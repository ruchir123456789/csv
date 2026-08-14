import os
import uuid
import math
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
import pandas as pd
import numpy as np

from app.core.config import settings
from app.schemas.csv_schema import (
    CSVMetadata,
    ColumnSummary,
    CSVSummaryResponse,
    CSVPreviewResponse,
    FilterRequest,
    ChartDataRequest,
    ChartDataResponse
)

# In-memory DataFrame cache: file_id -> (filename, DataFrame)
_DF_CACHE: Dict[str, Tuple[str, pd.DataFrame]] = {}

def _sanitize_for_json(obj: Any) -> Any:
    """Recursively converts NaN, Infinity, numpy types, and timestamps into JSON-serializable primitives."""
    if obj is None:
        return None
    if isinstance(obj, (float, np.floating)):
        if math.isnan(obj) or np.isnan(obj):
            return None
        if math.isinf(obj) or np.isinf(obj):
            return None
        return float(obj)
    if isinstance(obj, (int, np.integer)):
        return int(obj)
    if isinstance(obj, (bool, np.bool_)):
        return bool(obj)
    if isinstance(obj, (pd.Timestamp, pd.Timedelta)):
        return str(obj)
    if isinstance(obj, dict):
        return {k: _sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, np.ndarray, pd.Series)):
        return [_sanitize_for_json(v) for v in obj]
    return obj


class CSVService:
    @staticmethod
    def save_and_load(file_bytes: bytes, filename: str) -> Tuple[str, pd.DataFrame]:
        file_id = str(uuid.uuid4())
        file_path = settings.UPLOAD_DIR / f"{file_id}_{filename}"
        
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        
        # Load into pandas
        try:
            df = pd.read_csv(file_path)
        except Exception:
            # Try with alternative encodings/delimiters if default fails
            try:
                df = pd.read_csv(file_path, encoding="latin1")
            except Exception:
                df = pd.read_csv(file_path, sep=None, engine="python")

        _DF_CACHE[file_id] = (filename, df)
        return file_id, df

    @staticmethod
    def get_dataframe(file_id: str) -> Tuple[str, pd.DataFrame]:
        if file_id in _DF_CACHE:
            return _DF_CACHE[file_id]
        
        # Try loading from disk
        matched_files = list(settings.UPLOAD_DIR.glob(f"{file_id}_*"))
        if not matched_files:
            raise FileNotFoundError(f"CSV dataset with ID {file_id} not found.")
        
        file_path = matched_files[0]
        original_filename = file_path.name.replace(f"{file_id}_", "", 1)
        df = pd.read_csv(file_path)
        _DF_CACHE[file_id] = (original_filename, df)
        return original_filename, df

    @staticmethod
    def get_metadata(file_id: str) -> CSVMetadata:
        filename, df = CSVService.get_dataframe(file_id)
        file_path = settings.UPLOAD_DIR / f"{file_id}_{filename}"
        file_size = file_path.stat().st_size if file_path.exists() else 0
        
        column_types = {col: str(df[col].dtype) for col in df.columns}
        memory_usage = df.memory_usage(deep=True).sum() / 1024.0 # in KB
        total_nulls = int(df.isna().sum().sum())
        duplicates = int(df.duplicated().sum())

        return CSVMetadata(
            file_id=file_id,
            filename=filename,
            row_count=len(df),
            column_count=len(df.columns),
            file_size_bytes=file_size,
            columns=list(df.columns),
            column_types=column_types,
            memory_usage_kb=round(memory_usage, 2),
            total_null_cells=total_nulls,
            duplicate_rows=duplicates
        )

    @staticmethod
    def get_column_summary(df: pd.DataFrame, col: str) -> ColumnSummary:
        series = df[col]
        null_count = int(series.isna().sum())
        total_count = len(series)
        null_pct = round((null_count / total_count * 100.0) if total_count > 0 else 0.0, 2)
        unique_count = int(series.nunique(dropna=True))
        
        # Sample non-null unique values
        sample_vals = series.dropna().unique()[:5].tolist()
        sample_vals = _sanitize_for_json(sample_vals)
        
        stats: Dict[str, Any] = {}
        if pd.api.types.is_numeric_dtype(series):
            clean_s = series.dropna()
            if not clean_s.empty:
                stats = {
                    "min": _sanitize_for_json(clean_s.min()),
                    "max": _sanitize_for_json(clean_s.max()),
                    "mean": _sanitize_for_json(round(clean_s.mean(), 4)),
                    "median": _sanitize_for_json(round(clean_s.median(), 4)),
                    "std": _sanitize_for_json(round(clean_s.std(), 4)) if len(clean_s) > 1 else 0.0,
                    "q25": _sanitize_for_json(clean_s.quantile(0.25)),
                    "q75": _sanitize_for_json(clean_s.quantile(0.75)),
                    "skew": _sanitize_for_json(round(clean_s.skew(), 4)) if len(clean_s) > 2 else 0.0
                }
        else:
            # Categorical stats
            val_counts = series.value_counts(dropna=True).head(5).to_dict()
            mode_val = series.mode().iloc[0] if not series.mode().empty else None
            stats = {
                "top_categories": _sanitize_for_json(val_counts),
                "mode": _sanitize_for_json(mode_val)
            }

        return ColumnSummary(
            name=col,
            dtype=str(series.dtype),
            null_count=null_count,
            null_percentage=null_pct,
            unique_count=unique_count,
            sample_values=sample_vals,
            stats=stats
        )

    @staticmethod
    def get_summary(file_id: str) -> CSVSummaryResponse:
        filename, df = CSVService.get_dataframe(file_id)
        meta = CSVService.get_metadata(file_id)
        
        cols_summary = [CSVService.get_column_summary(df, col) for col in df.columns]
        
        # Compute correlation for numeric columns if there are at least 2 numeric columns
        numeric_df = df.select_dtypes(include=[np.number])
        correlations = None
        if numeric_df.shape[1] >= 2 and len(numeric_df) > 1:
            try:
                corr_matrix = numeric_df.corr().round(4).to_dict()
                correlations = _sanitize_for_json(corr_matrix)
            except Exception:
                correlations = None

        return CSVSummaryResponse(
            metadata=meta,
            columns_summary=cols_summary,
            correlations=correlations
        )

    @staticmethod
    def get_preview(file_id: str, page: int = 1, page_size: int = 20) -> CSVPreviewResponse:
        _, df = CSVService.get_dataframe(file_id)
        total_rows = len(df)
        total_pages = max(1, math.ceil(total_rows / page_size)) if total_rows > 0 else 1
        
        page = max(1, min(page, total_pages))
        start_idx = (page - 1) * page_size
        end_idx = min(start_idx + page_size, total_rows)
        
        page_df = df.iloc[start_idx:end_idx]
        rows = _sanitize_for_json(page_df.to_dict(orient="records"))
        
        return CSVPreviewResponse(
            file_id=file_id,
            total_rows=total_rows,
            columns=list(df.columns),
            rows=rows,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    @staticmethod
    def filter_data(req: FilterRequest) -> CSVPreviewResponse:
        _, df = CSVService.get_dataframe(req.file_id)
        filtered_df = df.copy()
        
        for cond in req.conditions:
            if cond.column not in filtered_df.columns:
                continue
            col = cond.column
            op = cond.operator.lower()
            val = cond.value

            if op == "equals":
                filtered_df = filtered_df[filtered_df[col] == val]
            elif op == "not_equals":
                filtered_df = filtered_df[filtered_df[col] != val]
            elif op == "contains" and val is not None:
                filtered_df = filtered_df[filtered_df[col].astype(str).str.contains(str(val), case=False, na=False)]
            elif op == "startswith" and val is not None:
                filtered_df = filtered_df[filtered_df[col].astype(str).str.startswith(str(val), na=False)]
            elif op == "endswith" and val is not None:
                filtered_df = filtered_df[filtered_df[col].astype(str).str.endswith(str(val), na=False)]
            elif op == "gt" and val is not None:
                filtered_df = filtered_df[filtered_df[col] > float(val)]
            elif op == "gte" and val is not None:
                filtered_df = filtered_df[filtered_df[col] >= float(val)]
            elif op == "lt" and val is not None:
                filtered_df = filtered_df[filtered_df[col] < float(val)]
            elif op == "lte" and val is not None:
                filtered_df = filtered_df[filtered_df[col] <= float(val)]
            elif op == "is_null":
                filtered_df = filtered_df[filtered_df[col].isna()]
            elif op == "is_not_null":
                filtered_df = filtered_df[filtered_df[col].notna()]

        if req.sort_by and req.sort_by in filtered_df.columns:
            filtered_df = filtered_df.sort_values(by=req.sort_by, ascending=req.sort_ascending)

        total_rows = len(filtered_df)
        total_pages = max(1, math.ceil(total_rows / req.page_size)) if total_rows > 0 else 1
        page = max(1, min(req.page, total_pages))
        start_idx = (page - 1) * req.page_size
        end_idx = min(start_idx + req.page_size, total_rows)
        
        page_df = filtered_df.iloc[start_idx:end_idx]
        rows = _sanitize_for_json(page_df.to_dict(orient="records"))

        return CSVPreviewResponse(
            file_id=req.file_id,
            total_rows=total_rows,
            columns=list(df.columns),
            rows=rows,
            page=page,
            page_size=req.page_size,
            total_pages=total_pages
        )

    @staticmethod
    def get_chart_data(req: ChartDataRequest) -> ChartDataResponse:
        _, df = CSVService.get_dataframe(req.file_id)
        if req.x_column not in df.columns:
            raise ValueError(f"Column '{req.x_column}' does not exist in dataset.")

        limit = min(max(5, req.limit), 100)
        
        if req.chart_type == "histogram":
            series = df[req.x_column].dropna()
            if pd.api.types.is_numeric_dtype(series):
                counts, bin_edges = np.histogram(series, bins=10)
                labels = [f"{bin_edges[i]:.2f} - {bin_edges[i+1]:.2f}" for i in range(len(counts))]
                values = _sanitize_for_json(counts.tolist())
            else:
                top_counts = series.value_counts().head(limit)
                labels = _sanitize_for_json(top_counts.index.tolist())
                values = _sanitize_for_json(top_counts.values.tolist())
            
            return ChartDataResponse(
                file_id=req.file_id,
                chart_type="histogram",
                x_column=req.x_column,
                labels=labels,
                values=values
            )

        if not req.y_column:
            # Value counts by default for single column
            top_counts = df[req.x_column].value_counts().head(limit)
            return ChartDataResponse(
                file_id=req.file_id,
                chart_type=req.chart_type,
                x_column=req.x_column,
                labels=_sanitize_for_json(top_counts.index.tolist()),
                values=_sanitize_for_json(top_counts.values.tolist())
            )

        if req.y_column not in df.columns:
            raise ValueError(f"Column '{req.y_column}' does not exist in dataset.")

        # Aggregations
        agg_func = req.aggregation or "sum"
        if agg_func == "avg" or agg_func == "mean":
            grouped = df.groupby(req.x_column)[req.y_column].mean().head(limit)
        elif agg_func == "min":
            grouped = df.groupby(req.x_column)[req.y_column].min().head(limit)
        elif agg_func == "max":
            grouped = df.groupby(req.x_column)[req.y_column].max().head(limit)
        elif agg_func == "count":
            grouped = df.groupby(req.x_column)[req.y_column].count().head(limit)
        else: # sum default
            grouped = df.groupby(req.x_column)[req.y_column].sum().head(limit)

        return ChartDataResponse(
            file_id=req.file_id,
            chart_type=req.chart_type,
            x_column=req.x_column,
            y_column=req.y_column,
            labels=_sanitize_for_json(grouped.index.tolist()),
            values=_sanitize_for_json(grouped.values.tolist())
        )
