from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.repositories.lake_repository import LakeRepository
from backend.app.schemas.lake import RestorationSimulationRequest, RestorationSimulationResponse
from backend.app.services.simulation.restoration_lab import restoration_lab

router = APIRouter(prefix="/lakes", tags=["Restoration Simulation"])

@router.post("/{lake_id}/simulate-restoration", response_model=RestorationSimulationResponse)
def simulate_lake_restoration(
    lake_id: str,
    payload: RestorationSimulationRequest,
    db: Session = Depends(get_db)
):
    repo = LakeRepository(db)
    lake = repo.get_lake_by_id(lake_id)
    if not lake:
        raise HTTPException(status_code=404, detail="Lake not found")

    # Get base observation (either requested or latest available)
    if payload.base_observation_id:
        base_obs = repo.get_observation_by_id(payload.base_observation_id)
    else:
        observations = repo.get_lake_observations(lake_id)
        base_obs = observations[-1] if observations else None

    if not base_obs or not base_obs.detection_result:
        # Fallback to lake reference geometry if no observation exists
        current_geom = lake.boundary_geometry
        current_area = lake.area_hectares
    else:
        current_geom = base_obs.detection_result.water_extent_geometry
        current_area = base_obs.detection_result.detected_area_hectares

    result = restoration_lab.simulate_restoration(
        lake_name=lake.official_name,
        lake_reference_boundary=lake.boundary_geometry,
        current_water_geometry=current_geom,
        current_water_area=current_area,
        restoration_target_pct=payload.restoration_target_pct
    )

    return RestorationSimulationResponse(
        lake_id=lake.id,
        lake_name=lake.official_name,
        restoration_target_pct=result["restoration_target_pct"],
        reference_basin_area_hectares=result["reference_basin_area_hectares"],
        current_water_area_hectares=result["current_water_area_hectares"],
        simulated_water_area_hectares=result["simulated_water_area_hectares"],
        area_delta_hectares=result["area_delta_hectares"],
        simulated_geometry=result["simulated_geometry"],
        is_hypothetical=True,
        disclaimer=result["disclaimer"]
    )
