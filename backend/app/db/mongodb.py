import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class MongoDBManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    _is_connected: bool = False

    @property
    def is_connected(self) -> bool:
        return self._is_connected

    async def connect(self):
        """Initialize MongoDB client and ping server."""
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL} (Database: {settings.DATABASE_NAME})...")
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=settings.MONGO_CONNECT_TIMEOUT_MS,
                connectTimeoutMS=settings.MONGO_CONNECT_TIMEOUT_MS
            )
            # Test connection with ping
            await self.client.admin.command("ping")
            self.db = self.client[settings.DATABASE_NAME]
            self._is_connected = True
            logger.info("Successfully connected to MongoDB.")
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            self._is_connected = False
            logger.warning(
                f"MongoDB connection failed: {e}. "
                "The app will continue running, but MongoDB persistence operations will operate in fallback mode."
            )
        except Exception as e:
            self._is_connected = False
            logger.warning(f"Unexpected error connecting to MongoDB: {e}")

    async def close(self):
        """Close MongoDB connection."""
        if self.client:
            logger.info("Closing MongoDB connection...")
            self.client.close()
            self._is_connected = False
            self.client = None
            self.db = None
            logger.info("MongoDB connection closed.")

    async def ping(self) -> dict:
        """Check MongoDB health/ping."""
        if not self.client:
            return {"status": "disconnected", "database": settings.DATABASE_NAME}
        try:
            await self.client.admin.command("ping")
            return {
                "status": "connected",
                "database": settings.DATABASE_NAME,
                "url": settings.MONGODB_URL.split("@")[-1]  # Hide credentials if any
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "database": settings.DATABASE_NAME
            }

mongo_db = MongoDBManager()

def get_database() -> Optional[AsyncIOMotorDatabase]:
    """Dependency provider for FastAPI routes."""
    return mongo_db.db
