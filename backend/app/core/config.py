import os
from pathlib import Path
from typing import List, Optional
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "CSV Analyser API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    UPLOAD_DIR: Path = UPLOAD_DIR
    MAX_FILE_SIZE_MB: int = 50
    
    # MongoDB Configuration (supports MONGODB_URL and MONGODB_URI)
    MONGODB_URL: str = os.getenv("MONGODB_URL") or os.getenv("MONGODB_URI") or "mongodb://localhost:27017"
    DATABASE_NAME: str = os.getenv("DATABASE_NAME") or os.getenv("MONGODB_DB_NAME") or "csv_analyser_db"
    MONGO_CONNECT_TIMEOUT_MS: int = 10000
    
    # Open Icecat API Configuration
    ICECAT_USERNAME: str = "openicecat-live"
    ICECAT_API_TOKEN: Optional[str] = None
    ICECAT_LANGUAGE: str = "en"
    ICECAT_BASE_URL: str = "https://live.icecat.biz/api"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
