from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from backend.app.models.lake import (
    Lake, SatelliteObservation, WaterDetectionResult, ComparisonResult, ScenarioSimulation
)
from backend.app.services.lakes.lake_inventory_data import get_initial_lake_inventory
import datetime

class LakeRepository:
    def __init__(self, db: Session):
        self.db = db

    def seed_initial_inventory_if_empty(self):
        """Populates the database with the authoritative Bengaluru lake inventory if empty."""
        count = self.db.query(func.count(Lake.id)).scalar()
        if count == 0:
            inventory = get_initial_lake_inventory()
            for item in inventory:
                lake = Lake(
                    id=item["id"],
                    official_name=item["official_name"],
                    alternative_names=item.get("alternative_names", []),
                    latitude=item["latitude"],
                    longitude=item["longitude"],
                    area_hectares=item["area_hectares"],
                    perimeter_meters=item.get("perimeter_meters"),
                    administrative_zone=item.get("administrative_zone"),
                    ward=item.get("ward"),
                    custodian=item.get("custodian"),
                    data_source=item.get("data_source", "BBMP & OSM"),
                    source_identifier=item.get("source_identifier"),
                    encroachment_status=item.get("encroachment_status", "Free of Intrusion (Restored)"),
                    encroached_area_hectares=item.get("encroached_area_hectares", 0.0),
                    encroachment_type=item.get("encroachment_type"),
                    geometry_confidence=item.get("geometry_confidence", 0.95),
                    boundary_geometry=item["boundary_geometry"]
                )
                self.db.add(lake)
                self.db.flush()

                # Add real observations & water detection results
                for obs_data in item.get("observations", []):
                    obs = SatelliteObservation(
                        id=obs_data["id"],
                        lake_id=lake.id,
                        observation_date=datetime.date.fromisoformat(obs_data["observation_date"]),
                        satellite_source=obs_data.get("satellite_source", "Sentinel-2A"),
                        sensor=obs_data.get("sensor", "MSI Level-2A"),
                        cloud_coverage_pct=obs_data.get("cloud_coverage_pct", 0.0),
                        valid_pixel_pct=obs_data.get("valid_pixel_pct", 100.0),
                        tile_id=obs_data.get("tile_id"),
                        preview_url=obs_data.get("preview_url")
                    )
                    self.db.add(obs)
                    self.db.flush()

                    detection = WaterDetectionResult(
                        id=f"det-{obs.id}",
                        observation_id=obs.id,
                        lake_id=lake.id,
                        ndwi_threshold=0.0,
                        detected_area_hectares=obs_data["detected_area_hectares"],
                        water_extent_geometry=obs_data["water_extent_geometry"],
                        confidence_score=obs_data.get("confidence_score", 0.95),
                        processing_version="ndwi_mcfeeters_v1"
                    )
                    self.db.add(detection)

            self.db.commit()

    def get_all_lakes(
        self,
        search: Optional[str] = None,
        zone: Optional[str] = None,
        min_area: Optional[float] = None
    ) -> List[Lake]:
        query = self.db.query(Lake)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Lake.official_name.ilike(search_term),
                    Lake.administrative_zone.ilike(search_term),
                    Lake.ward.ilike(search_term)
                )
            )
        if zone:
            query = query.filter(Lake.administrative_zone == zone)
        if min_area is not None:
            query = query.filter(Lake.area_hectares >= min_area)

        return query.order_by(Lake.area_hectares.desc()).all()

    def get_lake_by_id(self, lake_id: str) -> Optional[Lake]:
        return self.db.query(Lake).filter(Lake.id == lake_id).first()

    def get_lake_observations(self, lake_id: str) -> List[SatelliteObservation]:
        return (
            self.db.query(SatelliteObservation)
            .filter(SatelliteObservation.lake_id == lake_id)
            .order_by(SatelliteObservation.observation_date.asc())
            .all()
        )

    def get_observation_by_id(self, observation_id: str) -> Optional[SatelliteObservation]:
        return self.db.query(SatelliteObservation).filter(SatelliteObservation.id == observation_id).first()
