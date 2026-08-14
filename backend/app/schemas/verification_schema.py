from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class RowVerificationResult(BaseModel):
    brand: str
    model_code: str
    description: Optional[str] = ""
    web_closeness_score: str
    closeness_percentage: float
    verification_status: str
    verified_market_title: str
    spec_verification_insights: str
    live_web_reference: str
    detected_discrepancies: List[str] = []

class DatasetInsights(BaseModel):
    total_items_checked: int
    average_closeness_score: float
    accuracy_grade: str
    high_confidence_items: int
    moderate_confidence_items: int
    discrepancy_items: int
    overall_dataset_verdict: str
    key_takeaways: List[str] = []

class VerificationResponse(BaseModel):
    file_id: str
    original_filename: str
    verified_filename: str
    dataset_insights: DatasetInsights
    preview_rows: List[Dict[str, Any]] = []
    download_url: str

class SingleVerificationRequest(BaseModel):
    brand: str = Field(..., description="Brand name, e.g. Samsung, LG, HP")
    model_code: str = Field(..., description="Model number or part code, e.g. AR18CY5A, OLED55C3")
    description: Optional[str] = Field("", description="Optional product description/variant, e.g. 1.5 Ton Inverter AC")

class SingleVerificationResponse(BaseModel):
    brand: str
    model_code: str
    web_closeness_score: str
    closeness_percentage: float
    verification_status: str
    verified_market_title: str
    spec_verification_insights: str
    live_web_reference: str
    brand_verified: bool
    model_verified: bool
    specs_verified: bool
    detected_discrepancies: List[str] = []
