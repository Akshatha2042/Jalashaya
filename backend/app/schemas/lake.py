import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, ConfigDict

class GeoJSONGeometry(BaseModel):
    type: str = Field(..., description="Geometry type: Polygon or MultiPolygon")
    coordinates: List[Any] = Field(..., description="Coordinates array")

class LakeSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    official_name: str
    alternative_names: List[str] = []
    latitude: float
    longitude: float
    area_hectares: float
    administrative_zone: Optional[str] = None
    ward: Optional[str] = None
    custodian: Optional[str] = None
    data_source: str
    geometry_confidence: float
    observation_count: int = 0
    latest_observation_date: Optional[str] = None
    has_historical_comparison: bool = False
    current_risk_status: str = "Stable"
    encroachment_status: Optional[str] = "Free of Intrusion (Restored)"
    encroached_area_hectares: Optional[float] = 0.0
    encroachment_type: Optional[str] = None
    boundary_geometry: Optional[Dict[str, Any]] = None

class LakeDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    official_name: str
    alternative_names: List[str] = []
    latitude: float
    longitude: float
    boundary_geometry: Dict[str, Any]
    area_hectares: float
    perimeter_meters: Optional[float] = None
    administrative_zone: Optional[str] = None
    ward: Optional[str] = None
    custodian: Optional[str] = None
    data_source: str
    source_identifier: Optional[str] = None
    encroachment_status: Optional[str] = "Free of Intrusion (Restored)"
    encroached_area_hectares: Optional[float] = 0.0
    encroachment_type: Optional[str] = None
    last_verified: datetime.datetime
    geometry_confidence: float

class SatelliteObservationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    lake_id: str
    observation_date: str
    satellite_source: str
    sensor: str
    cloud_coverage_pct: float
    valid_pixel_pct: float
    tile_id: Optional[str] = None
    preview_url: Optional[str] = None
    detected_area_hectares: Optional[float] = None
    water_extent_geometry: Optional[Dict[str, Any]] = None
    confidence_score: Optional[float] = None

class ComparisonRequest(BaseModel):
    older_observation_id: str
    newer_observation_id: str
    lake_id: str

class ComparisonResponse(BaseModel):
    id: str
    lake_id: str
    lake_name: str
    older_date: str
    newer_date: str
    satellite_source: str
    area_old_hectares: float
    area_new_hectares: float
    area_change_hectares: float
    change_percentage: float
    change_classification: str
    is_gain: bool
    stable_water_geometry: Optional[Dict[str, Any]] = None
    lost_water_geometry: Optional[Dict[str, Any]] = None
    gained_water_geometry: Optional[Dict[str, Any]] = None
    seasonal_context: Dict[str, Any] = {}
    methodology: str = "Sentinel-2 Multi-Spectral NDWI (B3/B8) Automated Extraction"
    limitations: str = "Optical observations dependent on cloud coverage. Satellite water detection reflects surface water extent, not legal cadastral boundary."

class RestorationSimulationRequest(BaseModel):
    lake_id: str
    base_observation_id: Optional[str] = None
    restoration_target_pct: float = Field(..., ge=0.0, le=100.0, description="Percentage of basin restoration (0 - 100%)")

class RestorationSimulationResponse(BaseModel):
    lake_id: str
    lake_name: str
    restoration_target_pct: float
    reference_basin_area_hectares: float
    current_water_area_hectares: float
    simulated_water_area_hectares: float
    area_delta_hectares: float
    simulated_geometry: Dict[str, Any]
    is_hypothetical: bool = True
    disclaimer: str = "HYPOTHETICAL RESTORATION SCENARIO — Based on mathematical polygon interpolation towards cadastral reference boundary. Not an observed satellite measurement."

class SystemHealthResponse(BaseModel):
    status: str
    app_name: str
    environment: str
    timestamp: str
    providers: Dict[str, Dict[str, Any]]
    database: Dict[str, Any]
    inventory_summary: Dict[str, Any]
