from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.repositories.lake_repository import LakeRepository
from backend.app.schemas.lake import LakeSummary, LakeDetail, SatelliteObservationSchema
from backend.app.services.satellite.jrc_surface_water import jrc_service

router = APIRouter(prefix="/lakes", tags=["Lakes"])

@router.get("", response_model=List[LakeSummary])
def list_lakes(
    search: Optional[str] = Query(None, description="Search by lake name, zone, or ward"),
    zone: Optional[str] = Query(None, description="Filter by administrative zone"),
    min_area: Optional[float] = Query(None, description="Filter by minimum area in hectares"),
    db: Session = Depends(get_db)
):
    repo = LakeRepository(db)
    lakes = repo.get_all_lakes(search=search, zone=zone, min_area=min_area)
    summaries = []
    for l in lakes:
        obs = l.observations
        latest_obs = obs[-1] if obs else None
        
        # Determine current status based on observation history
        status = "Stable"
        if len(obs) >= 2:
            first_area = obs[0].detection_result.detected_area_hectares if obs[0].detection_result else l.area_hectares
            last_area = latest_obs.detection_result.detected_area_hectares if (latest_obs and latest_obs.detection_result) else l.area_hectares
            if first_area > 0:
                change = ((first_area - last_area) / first_area) * 100.0
                if change > 25.0:
                    status = "Persistent Decline"
                elif change > 10.0:
                    status = "Moderate Decline"
                elif change < -10.0:
                    status = "Water Gain"
                else:
                    status = "Stable"
        elif len(obs) == 1:
            status = "Observed"
        else:
            status = "Insufficient Data"

        summaries.append(LakeSummary(
            id=l.id,
            official_name=l.official_name,
            alternative_names=l.alternative_names or [],
            latitude=l.latitude,
            longitude=l.longitude,
            area_hectares=l.area_hectares,
            administrative_zone=l.administrative_zone,
            ward=l.ward,
            custodian=l.custodian,
            data_source=l.data_source,
            geometry_confidence=l.geometry_confidence,
            observation_count=len(obs),
            latest_observation_date=str(latest_obs.observation_date) if latest_obs else None,
            has_historical_comparison=len(obs) >= 2,
            current_risk_status=status,
            encroachment_status=getattr(l, "encroachment_status", "Free of Intrusion (Restored)"),
            encroached_area_hectares=getattr(l, "encroached_area_hectares", 0.0),
            encroachment_type=getattr(l, "encroachment_type", None),
            boundary_geometry=l.boundary_geometry
        ))
    return summaries

@router.get("/{lake_id}", response_model=LakeDetail)
def get_lake_detail(lake_id: str, db: Session = Depends(get_db)):
    repo = LakeRepository(db)
    lake = repo.get_lake_by_id(lake_id)
    if not lake:
        raise HTTPException(status_code=404, detail=f"Lake with id '{lake_id}' not found")
    
    return LakeDetail(
        id=lake.id,
        official_name=lake.official_name,
        alternative_names=lake.alternative_names or [],
        latitude=lake.latitude,
        longitude=lake.longitude,
        boundary_geometry=lake.boundary_geometry,
        area_hectares=lake.area_hectares,
        perimeter_meters=lake.perimeter_meters,
        administrative_zone=lake.administrative_zone,
        ward=lake.ward,
        custodian=lake.custodian,
        data_source=lake.data_source,
        source_identifier=lake.source_identifier,
        encroachment_status=getattr(lake, "encroachment_status", "Free of Intrusion (Restored)"),
        encroached_area_hectares=getattr(lake, "encroached_area_hectares", 0.0),
        encroachment_type=getattr(lake, "encroachment_type", None),
        last_verified=lake.last_verified,
        geometry_confidence=lake.geometry_confidence
    )
    repo = LakeRepository(db)
    lake = repo.get_lake_by_id(lake_id)
    if not lake:
        raise HTTPException(status_code=404, detail="Lake not found in inventory")
    return lake

@router.get("/{lake_id}/boundary")
def get_lake_boundary(lake_id: str, db: Session = Depends(get_db)):
    repo = LakeRepository(db)
    lake = repo.get_lake_by_id(lake_id)
    if not lake:
        raise HTTPException(status_code=404, detail="Lake not found in inventory")
    return {
        "lake_id": lake.id,
        "official_name": lake.official_name,
        "cadastral_area_hectares": lake.area_hectares,
        "boundary_geometry": lake.boundary_geometry
    }

@router.get("/{lake_id}/observations", response_model=List[SatelliteObservationSchema])
def get_lake_observations(lake_id: str, db: Session = Depends(get_db)):
    repo = LakeRepository(db)
    lake = repo.get_lake_by_id(lake_id)
    if not lake:
        raise HTTPException(status_code=404, detail="Lake not found")
    
    observations = repo.get_lake_observations(lake_id)
    results = []
    for obs in observations:
        det = obs.detection_result
        results.append(SatelliteObservationSchema(
            id=obs.id,
            lake_id=obs.lake_id,
            observation_date=str(obs.observation_date),
            satellite_source=obs.satellite_source,
            sensor=obs.sensor,
            cloud_coverage_pct=obs.cloud_coverage_pct,
            valid_pixel_pct=obs.valid_pixel_pct,
            tile_id=obs.tile_id,
            preview_url=obs.preview_url,
            detected_area_hectares=det.detected_area_hectares if det else None,
            water_extent_geometry=det.water_extent_geometry if det else None,
            confidence_score=det.confidence_score if det else None
        ))
    return results

@router.get("/{lake_id}/jrc-profile")
def get_lake_jrc_profile(lake_id: str, db: Session = Depends(get_db)):
    repo = LakeRepository(db)
    lake = repo.get_lake_by_id(lake_id)
    if not lake:
        raise HTTPException(status_code=404, detail="Lake not found")
    return jrc_service.get_historical_profile(lake.official_name, {"lat": lake.latitude, "lon": lake.longitude})
