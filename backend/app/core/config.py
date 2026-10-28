import os
from typing import List, Union
from pydantic import field_validator
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

    # CORS origins (supports string '*', comma-separated list, or JSON list)
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped == "*":
                return ["*"]
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                import json
                try:
                    return json.loads(v_stripped)
                except Exception:
                    pass
            return [origin.strip() for origin in v_stripped.split(",") if origin.strip()]
        return v

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

