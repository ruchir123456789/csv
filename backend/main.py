from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes.csv_analysis import router as csv_analysis_router
from app.routes.csv import router as csv_enrich_router
from app.db.mongodb import mongo_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await mongo_db.connect()
    yield
    # Shutdown: Close MongoDB connection
    await mongo_db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-performance FastAPI backend for CSV data analysis, Open Icecat product enrichment, preview, and visualizations with MongoDB persistence.",
    lifespan=lifespan
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(csv_enrich_router, prefix=settings.API_V1_STR)
app.include_router(csv_analysis_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    db_health = await mongo_db.ping()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_health,
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

@app.get("/health")
async def health_check():
    db_health = await mongo_db.ping()
    return {
        "status": "ok",
        "database": db_health
    }

@app.get(f"{settings.API_V1_STR}/db/status")
async def db_status():
    """Detailed MongoDB connection status and ping check."""
    return await mongo_db.ping()

