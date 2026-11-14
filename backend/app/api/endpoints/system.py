import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.models.lake import Lake, SatelliteObservation
from backend.app.services.satellite.gee_client import gee_client
from backend.app.services.satellite.sentinel2 import sentinel2_service

router = APIRouter(prefix="", tags=["System"])

@router.get("/system/health")
def system_health(db: Session = Depends(get_db)):
    lake_count = db.query(func.count(Lake.id)).scalar() or 0
    obs_count = db.query(func.count(SatelliteObservation.id)).scalar() or 0

    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "database": {
            "dialect": "PostgreSQL+PostGIS" if "postgresql" in settings.DATABASE_URL else "SQLite (Spatial JSON Engine)",
            "connected": True,
            "lake_count": lake_count,
            "observation_count": obs_count
        },
        "providers": {
            "google_earth_engine": gee_client.get_status(),
            "sentinel_hub": sentinel2_service.get_status(),
            "osm_overpass": {
                "name": "OpenStreetMap Overpass API",
                "status": "OPERATIONAL",
                "endpoint": settings.OPENSTREETMAP_OVERPASS_URL
            },
            "jrc_global_surface_water": {
                "name": "EC JRC Global Surface Water",
                "status": "OPERATIONAL",
                "resolution": "30m",
                "coverage": "1984 - 2021"
            }
        },
        "scientific_pipeline": {
            "ndwi_formula": "McFeeters: (Green - NIR) / (Green + NIR)",
            "sentinel2_bands": "B3 (Green, 560nm), B8 (NIR, 842nm)",
            "default_ndwi_threshold": settings.NDWI_THRESHOLD,
            "geodetic_crs": settings.TARGET_PROJECTION_CRS,
            "max_cloud_cover_pct": settings.MAX_CLOUD_COVERAGE
        }
    }

@router.get("/data-sources")
def list_data_sources():
    return {
        "sources": [
            {
                "id": "bbmp_lakes",
                "name": "BBMP Lake Inventory & Master Register",
                "organization": "Bruhat Bengaluru Mahanagara Palike (Lakes Division)",
                "type": "Administrative Lake Cadastre & Custodian Records",
                "coverage": "Bengaluru Urban & Rural Water Bodies",
                "attribution": "Government of Karnataka / BBMP",
                "url": settings.BBMP_DATA_SOURCE_URL
            },
            {
                "id": "copernicus_s2",
                "name": "Copernicus Sentinel-2 MSI Multi-Spectral Instrument",
                "organization": "European Space Agency (ESA) / European Commission",
                "type": "Level-2A Bottom-of-Atmosphere (BOA) Surface Reflectance",
                "resolution": "10 meters (B2, B3, B4, B8)",
                "revisit": "5 days",
                "bands_used": ["B3 (Green 560nm)", "B8 (NIR 842nm)"]
            },
            {
                "id": "osm_water",
                "name": "OpenStreetMap Water Bodies",
                "organization": "OpenStreetMap Contributors",
                "type": "Crowdsourced Geospatial Vector Polygons",
                "license": "ODbL",
                "url": "https://www.openstreetmap.org"
            },
            {
                "id": "jrc_gsw",
                "name": "JRC Global Surface Water (GSW)",
                "organization": "European Commission Joint Research Centre",
                "type": "Long-term Multi-decadal Water Occurrence & Transitions",
                "baseline": "1984 - 2021",
                "resolution": "30 meters",
                "citation": "Pekel et al., Nature 540, 418-422 (2016)"
            }
        ]
    }
