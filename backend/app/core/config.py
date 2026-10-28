import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "PSM.Intern – Internship Certificate Verification Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-jwt-key-psm-intern-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database configuration (PostgreSQL by default, SQLite fallback for seamless development)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./psm_intern.db"
    )

    # Application public URL for QR codes and verification
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # CORS origins (supports comma-separated string, JSON array, or wildcard)
    BACKEND_CORS_ORIGINS: List[str] = (
        [o.strip() for o in os.getenv("BACKEND_CORS_ORIGINS").split(",") if o.strip()]
        if os.getenv("BACKEND_CORS_ORIGINS") and os.getenv("BACKEND_CORS_ORIGINS") != "*"
        else (["*"] if os.getenv("BACKEND_CORS_ORIGINS") == "*" else [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            os.getenv("FRONTEND_URL", "http://localhost:5173"),
        ])
    )

    # Storage paths
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./storage")
    CERTIFICATES_DIR: str = os.getenv("CERTIFICATES_DIR", "./storage/certificates")
    QR_CODES_DIR: str = os.getenv("QR_CODES_DIR", "./storage/qrcodes")
    AVATARS_DIR: str = os.getenv("AVATARS_DIR", "./storage/avatars")

    # Initial Admin bootstrap credentials
    INITIAL_ADMIN_EMAIL: str = os.getenv("INITIAL_ADMIN_EMAIL", "admin@psmintern.com")
    INITIAL_ADMIN_PASSWORD: str = os.getenv("INITIAL_ADMIN_PASSWORD", "AdminPSM@2026!")
    INITIAL_ADMIN_NAME: str = os.getenv("INITIAL_ADMIN_NAME", "System Administrator")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Ensure storage directories exist
os.makedirs(settings.CERTIFICATES_DIR, exist_ok=True)
os.makedirs(settings.QR_CODES_DIR, exist_ok=True)
os.makedirs(settings.AVATARS_DIR, exist_ok=True)

