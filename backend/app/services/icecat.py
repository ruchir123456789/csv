import logging
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class IcecatService:
    @staticmethod
    async def fetch_product_data(brand: str, model_code: str, gtin: Optional[str] = None) -> Dict[str, Any]:
        """
        Query Open Icecat Live API for structured catalog data, technical parameters,
        descriptions, categories, and media assets for a given Brand + ProductCode (or GTIN).
        """
        brand_clean = (brand or "").strip()
        model_clean = (model_code or "").strip()
        gtin_clean = (gtin or "").strip() if gtin else None

        if not (brand_clean and model_clean) and not gtin_clean:
            return IcecatService._empty_response("Missing brand or product code")

        params = {
            "shopname": settings.ICECAT_USERNAME,
            "lang": settings.ICECAT_LANGUAGE,
        }
        
        if brand_clean and model_clean:
            params["Brand"] = brand_clean
            params["ProductCode"] = model_clean
        elif gtin_clean:
            params["GTIN"] = gtin_clean

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
        }
        if settings.ICECAT_API_TOKEN:
            headers["api_token"] = settings.ICECAT_API_TOKEN

        try:
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
                response = await client.get(settings.ICECAT_BASE_URL, params=params, headers=headers)
                
                if response.status_code == 200:
                    try:
                        json_data = response.json()
                        return IcecatService._parse_icecat_response(json_data, brand_clean, model_clean)
                    except Exception:
                        return IcecatService._empty_response("Invalid JSON response from Icecat")
                else:
                    return IcecatService._empty_response(f"Product not in Open Icecat catalog (HTTP {response.status_code})")

        except httpx.TimeoutException:
            return IcecatService._empty_response("Icecat request timed out")
        except Exception as e:
            return IcecatService._empty_response(f"Icecat query error: {str(e)}")

    @staticmethod
    def _parse_icecat_response(json_data: Dict[str, Any], brand: str, model_code: str) -> Dict[str, Any]:
        """Extract rich attributes and specifications from Icecat JSON data."""
        data_node = json_data.get("data", {})
        product = data_node.get("Product", {}) if isinstance(data_node, dict) else {}
        
        if not product and "GeneralInfo" in json_data:
            product = json_data

        if not product:
            msg = json_data.get("Message") or json_data.get("message") or "Product not present in Icecat database"
            return IcecatService._empty_response(msg)

        general_info = product.get("GeneralInfo", {})
        category_info = product.get("Category", {}) or general_info.get("Category", {})
        descriptions = general_info.get("Description", {}) or product.get("Description", {})
        image_info = general_info.get("Image", {}) or product.get("Image", {})
        summary_desc = general_info.get("SummaryDescription", {})
        
        # Category
        category_name = "Unknown"
        if isinstance(category_info, dict):
            category_name = category_info.get("Name", {}).get("Value", "Unknown") if isinstance(category_info.get("Name"), dict) else str(category_info.get("Name", "Unknown"))
        
        # Image
        img_url = (
            image_info.get("HighPic") 
            or image_info.get("Pic") 
            or product.get("HighPic") 
            or product.get("ThumbPic") 
            or "N/A"
        )
        
        # Title
        title = (
            general_info.get("Title") 
            or general_info.get("ProductName") 
            or product.get("Title") 
            or f"{brand} {model_code}"
        )
        
        # Descriptions
        short_desc = descriptions.get("ShortDesc") or summary_desc.get("ShortSummaryDescription") or "N/A"
        long_desc = descriptions.get("LongDesc") or summary_desc.get("LongSummaryDescription") or "N/A"
        
        # Bullet points
        bullet_points = []
        bullets_node = general_info.get("BulletPoints", {}).get("Values", [])
        if isinstance(bullets_node, list):
            bullet_points = [str(b) for b in bullets_node[:5]]
        
        # Key Features / Specs
        specs_list = []
        features_groups = product.get("FeaturesGroups", [])
        if isinstance(features_groups, list):
            for fg in features_groups[:8]:
                group_features = fg.get("Features", [])
                if isinstance(group_features, list):
                    for feat in group_features:
                        feat_name = feat.get("Feature", {}).get("Name", {}).get("Value") if isinstance(feat.get("Feature"), dict) else None
                        feat_val = feat.get("Value") or feat.get("PresentationValue")
                        if feat_name and feat_val:
                            specs_list.append(f"{feat_name}: {feat_val}")
        
        tech_specs_str = "; ".join(specs_list[:10]) if specs_list else "N/A"
        bullets_str = " | ".join(bullet_points) if bullet_points else "N/A"
        
        return {
            "icecat_id": str(product.get("ID", general_info.get("IcecatId", "N/A"))),
            "icecat_category": category_name,
            "icecat_title": title,
            "short_description": short_desc,
            "long_description": long_desc,
            "product_image_url": img_url,
            "technical_specs": tech_specs_str,
            "bullet_features": bullets_str,
            "icecat_status": "MATCHED"
        }

    @staticmethod
    def _empty_response(reason: str = "Not Found") -> Dict[str, Any]:
        return {
            "icecat_id": "N/A",
            "icecat_category": "Unknown",
            "icecat_title": "N/A",
            "short_description": "N/A",
            "long_description": reason,
            "product_image_url": "N/A",
            "technical_specs": "N/A",
            "bullet_features": "N/A",
            "icecat_status": "NOT_FOUND"
        }

async def fetch_icecat_product_data(brand: str, model_code: str) -> Dict[str, Any]:
    return await IcecatService.fetch_product_data(brand, model_code)
