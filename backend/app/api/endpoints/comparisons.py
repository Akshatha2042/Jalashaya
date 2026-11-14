from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.repositories.lake_repository import LakeRepository
from backend.app.schemas.lake import ComparisonRequest, ComparisonResponse
from backend.app.services.comparison.change_engine import change_engine

router = APIRouter(prefix="/lakes", tags=["Comparisons"])

@router.post("/{lake_id}/compare", response_model=ComparisonResponse)
def compare_lake_observations(
    lake_id: str,
    payload: ComparisonRequest,
    db: Session = Depends(get_db)
):
    repo = LakeRepository(db)
    lake = repo.get_lake_by_id(lake_id)
    if not lake:
        raise HTTPException(status_code=404, detail="Lake not found")

    obs_old = repo.get_observation_by_id(payload.older_observation_id)
    obs_new = repo.get_observation_by_id(payload.newer_observation_id)

    if not obs_old or not obs_new:
        raise HTTPException(status_code=404, detail="One or both satellite observations not found")

    if not obs_old.detection_result or not obs_new.detection_result:
        raise HTTPException(status_code=400, detail="Water detection results missing for selected observations")

    # Structure data for change engine
    older_data = {
        "observation_date": str(obs_old.observation_date),
        "satellite_source": obs_old.satellite_source,
        "detected_area_hectares": obs_old.detection_result.detected_area_hectares,
        "water_extent_geometry": obs_old.detection_result.water_extent_geometry
    }

    newer_data = {
        "observation_date": str(obs_new.observation_date),
        "satellite_source": obs_new.satellite_source,
        "detected_area_hectares": obs_new.detection_result.detected_area_hectares,
        "water_extent_geometry": obs_new.detection_result.water_extent_geometry
    }

    result = change_engine.compare_observations(
        lake_name=lake.official_name,
        lake_reference_boundary=lake.boundary_geometry,
        older_obs=older_data,
        newer_obs=newer_data
    )

    comparison_id = f"cmp-{obs_old.id}-{obs_new.id}"
    return ComparisonResponse(
        id=comparison_id,
        lake_id=lake.id,
        lake_name=lake.official_name,
        older_date=result["older_date"],
        newer_date=result["newer_date"],
        satellite_source=result["satellite_source"],
        area_old_hectares=result["area_old_hectares"],
        area_new_hectares=result["area_new_hectares"],
        area_change_hectares=result["area_change_hectares"],
        change_percentage=result["change_percentage"],
        change_classification=result["change_classification"],
        is_gain=result["is_gain"],
        stable_water_geometry=result["stable_water_geometry"],
        lost_water_geometry=result["lost_water_geometry"],
        gained_water_geometry=result["gained_water_geometry"],
        seasonal_context=result["seasonal_context"]
    )
