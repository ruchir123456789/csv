from typing import List, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
from app.services.csv_service import CSVService
from app.schemas.csv_schema import (
    CSVSummaryResponse,
    CSVMetadata,
    CSVPreviewResponse,
    FilterRequest,
    ChartDataRequest,
    ChartDataResponse
)
from app.db.repositories.dataset_repository import DatasetRepository
from app.core.config import settings

router = APIRouter(prefix="/csv", tags=["CSV Analysis"])

@router.post("/upload", response_model=CSVSummaryResponse)
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload a CSV file, parse it, and return metadata with preliminary statistical summary.
    Also saves analysis record into MongoDB if connected.
    """
    if not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV or text delimited files are supported.")
    
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    # Check max file size
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(status_code=400, detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB.")
    
    try:
        file_id, _ = CSVService.save_and_load(contents, file.filename)
        summary = CSVService.get_summary(file_id)
        
        # Asynchronously persist to MongoDB if database is available
        await DatasetRepository.save_dataset(summary)
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")

@router.get("/datasets", response_model=List[Dict[str, Any]])
async def list_datasets(limit: int = Query(50, ge=1, le=100)):
    """
    List uploaded dataset records stored in MongoDB.
    """
    return await DatasetRepository.list_datasets(limit=limit)

@router.get("/{file_id}/metadata", response_model=CSVMetadata)
def get_metadata(file_id: str):
    """
    Get detailed dataset metadata (row/col count, memory usage, duplicate count, null count).
    """
    try:
        return CSVService.get_metadata(file_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{file_id}/summary", response_model=CSVSummaryResponse)
def get_summary(file_id: str):
    """
    Get full statistical summary, column-level distributions, and correlation matrix.
    """
    try:
        return CSVService.get_summary(file_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{file_id}/preview", response_model=CSVPreviewResponse)
def get_preview(
    file_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=500, description="Number of rows per page")
):
    """
    Get paginated rows of the dataset.
    """
    try:
        return CSVService.get_preview(file_id, page=page, page_size=page_size)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/filter", response_model=CSVPreviewResponse)
def filter_dataset(request: FilterRequest):
    """
    Filter, sort, and paginate rows based on column conditions.
    """
    try:
        return CSVService.filter_data(request)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chart", response_model=ChartDataResponse)
def get_chart_data(request: ChartDataRequest):
    """
    Generate aggregated data points for visual charts (bar, line, pie, histogram).
    """
    try:
        return CSVService.get_chart_data(request)
    except (FileNotFoundError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{file_id}/download")
def download_file(file_id: str):
    """
    Download the CSV file.
    """
    try:
        filename, _ = CSVService.get_dataframe(file_id)
        matched = list(settings.UPLOAD_DIR.glob(f"{file_id}_*"))
        if not matched:
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(
            path=matched[0],
            filename=filename,
            media_type="text/csv"
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{file_id}")
async def delete_dataset(file_id: str):
    """
    Delete dataset record from MongoDB and local storage.
    """
    # Delete from MongoDB
    await DatasetRepository.delete_dataset(file_id)
    
    # Delete from disk
    matched = list(settings.UPLOAD_DIR.glob(f"{file_id}_*"))
    for f in matched:
        try:
            f.unlink()
        except Exception:
            pass
    return {"status": "success", "message": f"Dataset {file_id} deleted successfully"}

