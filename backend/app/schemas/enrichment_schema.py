from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class EnrichmentSummary(BaseModel):
    file_id: str
    original_filename: str
    enriched_filename: str
    total_rows: int
    matched_icecat_count: int
    web_enriched_count: int = 0
    total_enriched_count: int = 0
    match_rate_percentage: float
    brand_column_used: Optional[str] = None
    model_column_used: Optional[str] = None
    description_column_used: Optional[str] = None
    ean_column_used: Optional[str] = None
    new_columns_added: List[str]
    download_url: str
    preview_rows: List[Dict[str, Any]] = []


class SingleEnrichmentRequest(BaseModel):
    brand: str = Field(..., description="Brand name, e.g. HP, Lenovo, LG, Samsung")
    model_code: str = Field(..., description="Model number or product code, e.g. RJ459AV, 20X30043UK")
    gtin: Optional[str] = Field(None, description="Optional EAN/GTIN barcode number")
    include_web_scraping: bool = Field(True, description="Whether to use web scraping if Icecat lookup has missing fields")

class SingleEnrichmentResponse(BaseModel):
    brand: str
    model_code: str
    icecat_id: str
    icecat_category: str
    icecat_title: str
    short_description: str
    long_description: str
    product_image_url: str
    technical_specs: str
    bullet_features: str
    estimated_price: Optional[str] = "N/A"
    hardware_technology: Optional[str] = "N/A"
    power_spec: Optional[str] = "N/A"
    icecat_status: str
