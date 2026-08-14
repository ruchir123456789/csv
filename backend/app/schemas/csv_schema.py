from typing import Any, Optional, Dict, List
from pydantic import BaseModel, Field

class ColumnSummary(BaseModel):
    name: str
    dtype: str
    null_count: int
    null_percentage: float
    unique_count: int
    sample_values: List[Any] = []
    stats: Dict[str, Any] = {}

class CSVMetadata(BaseModel):
    file_id: str
    filename: str
    row_count: int
    column_count: int
    file_size_bytes: int
    columns: List[str]
    column_types: Dict[str, str]
    memory_usage_kb: float
    total_null_cells: int
    duplicate_rows: int

class CSVSummaryResponse(BaseModel):
    metadata: CSVMetadata
    columns_summary: List[ColumnSummary]
    correlations: Optional[Dict[str, Dict[str, Optional[float]]]] = None

class CSVPreviewResponse(BaseModel):
    file_id: str
    total_rows: int
    columns: List[str]
    rows: List[Dict[str, Any]]
    page: int
    page_size: int
    total_pages: int

class FilterCondition(BaseModel):
    column: str
    operator: str = Field(
        ...,
        description="Operator: equals, not_equals, contains, startswith, endswith, gt, gte, lt, lte, is_null, is_not_null"
    )
    value: Optional[Any] = None

class FilterRequest(BaseModel):
    file_id: str
    conditions: List[FilterCondition] = []
    sort_by: Optional[str] = None
    sort_ascending: bool = True
    page: int = 1
    page_size: int = 20

class ChartDataRequest(BaseModel):
    file_id: str
    x_column: str
    y_column: Optional[str] = None
    chart_type: str = Field("bar", description="bar, line, scatter, pie, histogram, box")
    aggregation: Optional[str] = Field(None, description="count, sum, avg, min, max")
    limit: int = 50

class ChartDataResponse(BaseModel):
    file_id: str
    chart_type: str
    x_column: str
    y_column: Optional[str] = None
    labels: List[Any]
    values: List[Any]
    series: Optional[List[Dict[str, Any]]] = None
