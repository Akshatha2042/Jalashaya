import datetime
import uuid
from sqlalchemy import (
    Column, String, Float, DateTime, Text, JSON, ForeignKey, Boolean, Date
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Lake(Base):
    __tablename__ = "lakes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    official_name = Column(String(255), nullable=False, index=True)
    alternative_names = Column(JSON, default=list)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    boundary_geometry = Column(JSON, nullable=False)  # GeoJSON Polygon / MultiPolygon
    area_hectares = Column(Float, nullable=False)
    perimeter_meters = Column(Float, nullable=True)
    administrative_zone = Column(String(100), nullable=True, index=True)
    ward = Column(String(100), nullable=True)
    custodian = Column(String(150), nullable=True)
    data_source = Column(String(100), default="BBMP Lake Inventory & OSM")
    source_identifier = Column(String(100), nullable=True)
    encroachment_status = Column(String(100), default="Free of Intrusion (Restored)", index=True)
    encroached_area_hectares = Column(Float, default=0.0)
    encroachment_type = Column(String(255), nullable=True)
    last_verified = Column(DateTime, default=datetime.datetime.utcnow)
    geometry_confidence = Column(Float, default=0.95)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    observations = relationship("SatelliteObservation", back_populates="lake", cascade="all, delete-orphan")
    detection_results = relationship("WaterDetectionResult", back_populates="lake", cascade="all, delete-orphan")
    comparisons = relationship("ComparisonResult", back_populates="lake", cascade="all, delete-orphan")
    simulations = relationship("ScenarioSimulation", back_populates="lake", cascade="all, delete-orphan")

class SatelliteObservation(Base):
    __tablename__ = "satellite_observations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lake_id = Column(String(36), ForeignKey("lakes.id", ondelete="CASCADE"), nullable=False, index=True)
    observation_date = Column(Date, nullable=False, index=True)
    satellite_source = Column(String(50), nullable=False, default="Sentinel-2")
    sensor = Column(String(50), default="MSI")
    cloud_coverage_pct = Column(Float, default=0.0)
    valid_pixel_pct = Column(Float, default=100.0)
    tile_id = Column(String(50), nullable=True)
    preview_url = Column(String(500), nullable=True)
    raw_bands_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lake = relationship("Lake", back_populates="observations")
    detection_result = relationship("WaterDetectionResult", back_populates="observation", uselist=False, cascade="all, delete-orphan")

class WaterDetectionResult(Base):
    __tablename__ = "water_detection_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    observation_id = Column(String(36), ForeignKey("satellite_observations.id", ondelete="CASCADE"), nullable=False, unique=True)
    lake_id = Column(String(36), ForeignKey("lakes.id", ondelete="CASCADE"), nullable=False, index=True)
    ndwi_threshold = Column(Float, default=0.0)
    detected_area_hectares = Column(Float, nullable=False)
    water_extent_geometry = Column(JSON, nullable=False)  # GeoJSON Polygon / MultiPolygon
    confidence_score = Column(Float, default=0.90)
    processing_version = Column(String(50), default="ndwi_mcfeeters_v1")
    quality_flags = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    observation = relationship("SatelliteObservation", back_populates="detection_result")
    lake = relationship("Lake", back_populates="detection_results")

class ComparisonResult(Base):
    __tablename__ = "comparison_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lake_id = Column(String(36), ForeignKey("lakes.id", ondelete="CASCADE"), nullable=False, index=True)
    older_observation_id = Column(String(36), nullable=False)
    newer_observation_id = Column(String(36), nullable=False)
    older_date = Column(Date, nullable=False)
    newer_date = Column(Date, nullable=False)
    area_old_hectares = Column(Float, nullable=False)
    area_new_hectares = Column(Float, nullable=False)
    area_change_hectares = Column(Float, nullable=False)  # A_new - A_old
    change_percentage = Column(Float, nullable=False)     # ((A_old - A_new) / A_old) * 100
    change_classification = Column(String(50), nullable=False)  # Stable, Seasonal Fluctuation, Persistent Decline, Water Gain, Insufficient Evidence
    stable_water_geometry = Column(JSON, nullable=True)
    lost_water_geometry = Column(JSON, nullable=True)
    gained_water_geometry = Column(JSON, nullable=True)
    seasonal_context = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lake = relationship("Lake", back_populates="comparisons")

class ScenarioSimulation(Base):
    __tablename__ = "scenario_simulations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lake_id = Column(String(36), ForeignKey("lakes.id", ondelete="CASCADE"), nullable=False, index=True)
    base_observation_id = Column(String(36), nullable=True)
    restoration_target_pct = Column(Float, nullable=False)  # 0.0 to 100.0%
    simulated_water_area_hectares = Column(Float, nullable=False)
    area_delta_hectares = Column(Float, nullable=False)
    simulated_geometry = Column(JSON, nullable=False)
    is_hypothetical = Column(Boolean, default=True)
    methodology_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lake = relationship("Lake", back_populates="simulations")
