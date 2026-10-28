import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.api.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure storage and initialize database
    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    os.makedirs(settings.CERTIFICATES_DIR, exist_ok=True)
    os.makedirs(settings.QR_CODES_DIR, exist_ok=True)
    os.makedirs(settings.AVATARS_DIR, exist_ok=True)
    
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount storage directory for generated QR codes and public assets
app.mount("/storage", StaticFiles(directory=settings.STORAGE_DIR), name="storage")

# Include central API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "app": "PSM.Intern – Internship Certificate Verification Platform",
        "tagline": "Verify Your Internship. Showcase Your Skills.",
        "version": "1.0.0",
        "status": "operational",
        "api_docs": f"{settings.API_V1_STR}/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
