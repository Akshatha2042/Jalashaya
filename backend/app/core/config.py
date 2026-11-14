import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "JALASHAYA"
    APP_ENV: str = "development"
    APP_PORT: int = 8000
    APP_SECRET_KEY: str = "jalashaya-production-ready-secret-key-2026"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "sqlite:///./jalashaya.db"
    DB_ECHO: bool = False

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000"
    ]

    # Google Earth Engine
    GEE_ENABLED: bool = False
    GEE_AUTH_MODE: str = "service_account"
    GEE_PROJECT_ID: Optional[str] = None
    GEE_SERVICE_ACCOUNT: Optional[str] = None
    GEE_PRIVATE_KEY: Optional[str] = None
    GEE_KEY_FILE_PATH: Optional[str] = None
    GEE_CLIENT_ID: Optional[str] = None

    # Sentinel Hub / Copernicus / Planet
    SENTINEL_HUB_ENABLED: bool = True
    SENTINEL_HUB_CLIENT_ID: Optional[str] = None
    SENTINEL_HUB_CLIENT_SECRET: Optional[str] = None
    PLANET_API_KEY: Optional[str] = None
    COPERNICUS_API_KEY: Optional[str] = None

    # Data Source URLs
    OPENSTREETMAP_OVERPASS_URL: str = "https://overpass-api.de/api/interpreter"
    BBMP_DATA_SOURCE_URL: str = "https://bbmp.gov.in/lakes"
    JRC_DATA_SOURCE_URL: str = "https://global-surface-water.appspot.com"

    # Storage & Cache
    STORAGE_PROVIDER: str = "local"
    STORAGE_LOCAL_DIR: str = "./data"
    STORAGE_BUCKET: str = "jalashaya-satellite-cache"
    STORAGE_ACCESS_KEY: Optional[str] = None
    STORAGE_SECRET_KEY: Optional[str] = None
    STORAGE_REGION: str = "ap-south-1"
    STORAGE_ENDPOINT: Optional[str] = None

    # Scientific Processing
    NDWI_THRESHOLD: float = 0.0
    MAX_CLOUD_COVERAGE: float = 20.0
    DEFAULT_OBSERVATION_WINDOW_DAYS: int = 30
    ENABLE_SATELLITE_CACHE: bool = True
    CACHE_EXPIRY_HOURS: int = 720
    DATA_PROCESSING_WORKERS: int = 2
    TARGET_PROJECTION_CRS: str = "EPSG:32643"  # UTM Zone 43N (covers Bengaluru: ~77.5°E, 13.0°N)

    # Optional AI Explanations
    ENABLE_AI_EXPLANATIONS: bool = False
    GROQ_API_KEY: Optional[str] = None
    AI_MODEL: str = "llama-3.3-70b-versatile"

settings = Settings()
