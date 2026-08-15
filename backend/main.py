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

# Set up CORS middleware to support local and deployed Render origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Register routers
app.include_router(csv_enrich_router, prefix=settings.API_V1_STR)
app.include_router(csv_analysis_router, prefix=settings.API_V1_STR)

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

# Mount frontend SPA static build if present
ROOT_PROJECT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST = ROOT_PROJECT_DIR / "frontend" / "dist"
if not FRONTEND_DIST.exists():
    FRONTEND_DIST = Path(__file__).resolve().parent / "dist"

if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    # Mount /assets
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    # Serve index.html on root
    @app.get("/", include_in_schema=False)
    async def serve_root():
        return FileResponse(FRONTEND_DIST / "index.html")

    # Catch-all for SPA client routes
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        file_target = FRONTEND_DIST / full_path
        if file_target.exists() and file_target.is_file():
            return FileResponse(file_target)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
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


