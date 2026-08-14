from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.mongodb import mongo_db
from app.schemas.csv_schema import CSVSummaryResponse

COLLECTION_NAME = "datasets"

class DatasetRepository:
    @staticmethod
    async def save_dataset(summary_data: CSVSummaryResponse) -> Optional[str]:
        """Save dataset analysis summary to MongoDB collection."""
        if not mongo_db.is_connected or mongo_db.db is None:
            return None
        
        doc = {
            "_id": summary_data.metadata.file_id,
            "file_id": summary_data.metadata.file_id,
            "filename": summary_data.metadata.filename,
            "row_count": summary_data.metadata.row_count,
            "column_count": summary_data.metadata.column_count,
            "file_size_bytes": summary_data.metadata.file_size_bytes,
            "columns": summary_data.metadata.columns,
            "column_types": summary_data.metadata.column_types,
            "memory_usage_kb": summary_data.metadata.memory_usage_kb,
            "total_null_cells": summary_data.metadata.total_null_cells,
            "duplicate_rows": summary_data.metadata.duplicate_rows,
            "columns_summary": [col.model_dump() for col in summary_data.columns_summary],
            "correlations": summary_data.correlations,
            "created_at": datetime.now(timezone.utc)
        }
        
        await mongo_db.db[COLLECTION_NAME].replace_one(
            {"_id": summary_data.metadata.file_id},
            doc,
            upsert=True
        )
        return summary_data.metadata.file_id

    @staticmethod
    async def get_dataset(file_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve dataset record by file_id from MongoDB."""
        if not mongo_db.is_connected or mongo_db.db is None:
            return None
        
        return await mongo_db.db[COLLECTION_NAME].find_one({"file_id": file_id})

    @staticmethod
    async def list_datasets(limit: int = 50) -> List[Dict[str, Any]]:
        """List dataset records from MongoDB sorted by created_at desc."""
        if not mongo_db.is_connected or mongo_db.db is None:
            return []
        
        cursor = mongo_db.db[COLLECTION_NAME].find().sort("created_at", -1).limit(limit)
        results = []
        async for doc in cursor:
            doc["id"] = doc.pop("_id", str(doc.get("file_id", "")))
            if "created_at" in doc and isinstance(doc["created_at"], datetime):
                doc["created_at"] = doc["created_at"].isoformat()
            results.append(doc)
        return results

    @staticmethod
    async def save_enriched_dataset(
        file_id: str,
        original_filename: str,
        enriched_filename: str,
        summary: Dict[str, Any]
    ) -> Optional[str]:
        """Save enriched dataset metadata and match rate to MongoDB."""
        if not mongo_db.is_connected or mongo_db.db is None:
            return None
        
        doc = {
            "_id": file_id,
            "file_id": file_id,
            "original_filename": original_filename,
            "enriched_filename": enriched_filename,
            "type": "enriched_csv",
            "summary": summary,
            "created_at": datetime.now(timezone.utc)
        }
        
        await mongo_db.db[COLLECTION_NAME].replace_one(
            {"_id": file_id},
            doc,
            upsert=True
        )
        return file_id

    @staticmethod
    async def delete_dataset(file_id: str) -> bool:
        """Delete dataset record from MongoDB."""
        if not mongo_db.is_connected or mongo_db.db is None:
            return False
        
        result = await mongo_db.db[COLLECTION_NAME].delete_one({"file_id": file_id})
        return result.deleted_count > 0

