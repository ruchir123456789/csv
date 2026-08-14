from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
from app.db.mongodb import mongo_db, get_database

def get_collection(collection_name: str):
    """Helper to fetch collections dynamically from active MongoDB connection."""
    if mongo_db.db is not None:
        return mongo_db.db[collection_name]
    # Fallback direct client if accessed outside lifespan
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    return db[collection_name]

__all__ = ["mongo_db", "get_database", "get_collection"]
