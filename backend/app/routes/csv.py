import io
import uuid
import pandas as pd
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import StreamingResponse, FileResponse

from app.core.config import settings
from app.services.enricher import ProductEnricher
from app.services.icecat import IcecatService
from app.services.verifier import WebVerifier
from app.services.csv_service import _DF_CACHE, _sanitize_for_json
from app.db.repositories.dataset_repository import DatasetRepository
from app.schemas.enrichment_schema import (
    EnrichmentSummary,
    SingleEnrichmentRequest,
    SingleEnrichmentResponse
)
from app.schemas.verification_schema import (
    VerificationResponse,
    DatasetInsights,
    SingleVerificationRequest,
    SingleVerificationResponse
)

router = APIRouter(prefix="/csv", tags=["CSV Enrichment, Processing & Web Verification"])

@router.post("/enrich", response_model=EnrichmentSummary)
async def enrich_csv_dataset(
    file: UploadFile = File(..., description="CSV file with product codes/brands"),
    brand_column: Optional[str] = Form(None, description="Optional column name for Brand"),
    model_column: Optional[str] = Form(None, description="Optional column name for Model/Product Code"),
    description_column: Optional[str] = Form(None, description="Optional column name for Product Description/Title"),
    ean_column: Optional[str] = Form(None, description="Optional column name for EAN/GTIN"),
    include_web_scraping: bool = Form(True, description="Enable web scraping fallback for missing data")
):
    """
    Upload a CSV file, enrich all products with Open Icecat technical specs & media,
    save the newly generated enriched CSV, and return enrichment statistics and preview.
    """
    if not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a .csv file.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="The uploaded CSV file is empty.")

    try:
        # Load CSV with Pandas
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except Exception:
            df = pd.read_csv(io.BytesIO(contents), encoding="latin1")

        if len(df) == 0:
            raise HTTPException(status_code=400, detail="The CSV file lacks data rows.")

        # Run Open Icecat + Web enrichment pipeline
        enriched_df, summary_stats = await ProductEnricher.enrich_dataframe(
            df=df,
            brand_col=brand_column,
            model_col=model_column,
            ean_col=ean_column,
            desc_col=description_column,
            concurrency_limit=5,
            include_web_scraping=include_web_scraping
        )

        # Save both original and enriched files to disk
        file_id = str(uuid.uuid4())
        original_filename = file.filename
        enriched_filename = f"enriched_{original_filename}"
        
        enriched_file_path = settings.UPLOAD_DIR / f"{file_id}_{enriched_filename}"
        enriched_df.to_csv(enriched_file_path, index=False, encoding="utf-8-sig")

        # Cache in memory for quick preview and analysis
        _DF_CACHE[file_id] = (enriched_filename, enriched_df)

        # Persist summary to MongoDB
        await DatasetRepository.save_enriched_dataset(
            file_id=file_id,
            original_filename=original_filename,
            enriched_filename=enriched_filename,
            summary=summary_stats
        )

        # Generate preview rows
        preview_rows = _sanitize_for_json(enriched_df.head(10).to_dict(orient="records"))

        return EnrichmentSummary(
            file_id=file_id,
            original_filename=original_filename,
            enriched_filename=enriched_filename,
            total_rows=summary_stats["total_rows"],
            matched_icecat_count=summary_stats["matched_icecat_count"],
            web_enriched_count=summary_stats["web_enriched_count"],
            total_enriched_count=summary_stats["total_enriched_count"],
            match_rate_percentage=summary_stats["match_rate_percentage"],
            brand_column_used=summary_stats["brand_column_used"],
            model_column_used=summary_stats["model_column_used"],
            description_column_used=summary_stats["description_column_used"],
            ean_column_used=summary_stats["ean_column_used"],
            new_columns_added=summary_stats["new_columns_added"],
            download_url=f"/api/csv/{file_id}/download-enriched",
            preview_rows=preview_rows
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enrichment Pipeline Error: {str(e)}")


@router.post("/verify", response_model=VerificationResponse)
async def verify_csv_dataset(
    file: UploadFile = File(..., description="CSV file to cross-verify against live DuckDuckGo web data")
):
    """
    Upload a CSV, audit each product row against live Google/DuckDuckGo web index data,
    calculate data closeness/fidelity scores, detect discrepancies, and return comprehensive insights.
    """
    if not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a .csv file.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="The uploaded CSV file is empty.")

    try:
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except Exception:
            df = pd.read_csv(io.BytesIO(contents), encoding="latin1")

        if len(df) == 0:
            raise HTTPException(status_code=400, detail="The CSV file lacks data rows.")

        # Run DuckDuckGo Cross-Verification Engine
        verified_df, insights_dict = await WebVerifier.verify_dataframe(df=df, concurrency_limit=5)

        file_id = str(uuid.uuid4())
        original_filename = file.filename
        verified_filename = f"verified_{original_filename}"
        
        verified_file_path = settings.UPLOAD_DIR / f"{file_id}_{verified_filename}"
        verified_df.to_csv(verified_file_path, index=False, encoding="utf-8-sig")

        # Cache in memory
        _DF_CACHE[file_id] = (verified_filename, verified_df)

        # Persist verification summary to MongoDB
        await DatasetRepository.save_enriched_dataset(
            file_id=file_id,
            original_filename=original_filename,
            enriched_filename=verified_filename,
            summary={"type": "web_verification", "insights": insights_dict}
        )

        preview_rows = _sanitize_for_json(verified_df.head(10).to_dict(orient="records"))

        return VerificationResponse(
            file_id=file_id,
            original_filename=original_filename,
            verified_filename=verified_filename,
            dataset_insights=DatasetInsights(**insights_dict),
            preview_rows=preview_rows,
            download_url=f"/api/csv/{file_id}/download-verified"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification Pipeline Error: {str(e)}")


@router.get("/{file_id}/download-verified")
def download_verified_csv(file_id: str):
    """
    Download the verified CSV file containing web closeness scores, verification status, and audit insights.
    """
    matched_files = list(settings.UPLOAD_DIR.glob(f"{file_id}_verified_*"))
    if not matched_files:
        matched_files = list(settings.UPLOAD_DIR.glob(f"{file_id}_*"))
        if not matched_files:
            raise HTTPException(status_code=404, detail="Verified CSV file not found.")

    target_file = matched_files[0]
    original_filename = target_file.name.replace(f"{file_id}_", "", 1)

    return FileResponse(
        path=target_file,
        filename=original_filename,
        media_type="text/csv"
    )


@router.get("/{file_id}/download-enriched")
def download_enriched_csv(file_id: str):
    """
    Download the generated enriched CSV file with all Open Icecat and technical parameters.
    """
    matched_files = list(settings.UPLOAD_DIR.glob(f"{file_id}_enriched_*"))
    if not matched_files:
        matched_files = list(settings.UPLOAD_DIR.glob(f"{file_id}_*"))
        if not matched_files:
            raise HTTPException(status_code=404, detail="Enriched CSV file not found.")

    target_file = matched_files[0]
    original_filename = target_file.name.replace(f"{file_id}_", "", 1)

    return FileResponse(
        path=target_file,
        filename=original_filename,
        media_type="text/csv"
    )


@router.post("/enrich/stream")
async def stream_enriched_csv(
    file: UploadFile = File(...),
    brand_column: Optional[str] = Form(None),
    model_column: Optional[str] = Form(None),
    include_web_scraping: bool = Form(True)
):
    """
    Directly streams back the enriched CSV file as an attachment without requiring a secondary download.
    """
    if not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Invalid format. Please upload a .csv file.")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        enriched_df, _ = await ProductEnricher.enrich_dataframe(
            df=df,
            brand_col=brand_column,
            model_col=model_column,
            include_web_scraping=include_web_scraping
        )

        output_buffer = io.StringIO()
        enriched_df.to_csv(output_buffer, index=False, encoding="utf-8-sig")
        output_buffer.seek(0)

        return StreamingResponse(
            iter([output_buffer.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=icecat_enriched_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Streaming Pipeline Error: {str(e)}")


@router.post("/verify/single", response_model=SingleVerificationResponse)
async def verify_single_product(request: SingleVerificationRequest):
    """
    Audit and cross-verify a single Brand + Model against live Google/DuckDuckGo web index data.
    """
    try:
        data = await WebVerifier.verify_item_against_web(
            brand=request.brand,
            model_code=request.model_code,
            description=request.description or ""
        )
        return SingleVerificationResponse(
            brand=request.brand,
            model_code=request.model_code,
            **data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Single Verification Error: {str(e)}")


@router.post("/enrich/item", response_model=SingleEnrichmentResponse)
async def enrich_single_product(request: SingleEnrichmentRequest):
    """
    Query Open Icecat directly for a single Brand + Model Code combination.
    """
    try:
        data = await ProductEnricher.enrich_single_item(
            brand=request.brand,
            model_code=request.model_code,
            gtin=request.gtin,
            include_web_scraping=request.include_web_scraping
        )
        return SingleEnrichmentResponse(
            brand=request.brand,
            model_code=request.model_code,
            **data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lookup Error: {str(e)}")
