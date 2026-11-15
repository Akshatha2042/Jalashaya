import pytest
from backend.app.services.comparison.change_engine import change_engine
from backend.app.services.simulation.restoration_lab import restoration_lab
from backend.app.core.database import SessionLocal
from backend.app.models.lake import Lake, SatelliteObservation

def test_mathematical_change_formulas():
    """Verify Area Change = New Area - Old Area and Loss % = ((Old - New) / Old) * 100."""
    ref_boundary = {
        "type": "Polygon",
        "coordinates": [[[77.65, 12.92], [77.69, 12.92], [77.69, 12.94], [77.65, 12.94], [77.65, 12.92]]]
    }
    # Case 1: 50% Loss
    old_obs = {
        "observation_date": "2017-02-15",
        "satellite_source": "Sentinel-2A",
        "detected_area_hectares": 200.0,
        "water_extent_geometry": ref_boundary
    }
    new_obs = {
        "observation_date": "2026-03-15",
        "satellite_source": "Sentinel-2C",
        "detected_area_hectares": 100.0,
        "water_extent_geometry": ref_boundary
    }
    res = change_engine.compare_observations("Test Lake", ref_boundary, old_obs, new_obs)
    assert res["area_change_hectares"] == -100.0
    assert res["change_percentage"] == 50.0
    assert res["is_gain"] is False
    assert res["change_classification"] == "Persistent Decline"

    # Case 2: Water Area Gain (Rejuvenated)
    new_obs_gain = {
        "observation_date": "2026-03-15",
        "satellite_source": "Sentinel-2C",
        "detected_area_hectares": 250.0,
        "water_extent_geometry": ref_boundary
    }
    res_gain = change_engine.compare_observations("Test Lake", ref_boundary, old_obs, new_obs_gain)
    assert res_gain["area_change_hectares"] == 50.0
    assert res_gain["change_percentage"] == 25.0
    assert res_gain["is_gain"] is True
    assert res_gain["change_classification"] == "Water Area Gain"

def test_shrinkage_threshold_qualification_rule():
    """Verify that shrinkage >= 20% is flagged as persistent decline / critical audit."""
    ref_boundary = {
        "type": "Polygon",
        "coordinates": [[[77.65, 12.92], [77.69, 12.92], [77.69, 12.94], [77.65, 12.94], [77.65, 12.92]]]
    }
    # Exactly 19% drop -> Stable / Minor Fluctuation
    old_obs = {"observation_date": "2017-02-15", "satellite_source": "S2", "detected_area_hectares": 100.0, "water_extent_geometry": ref_boundary}
    new_obs_minor = {"observation_date": "2026-03-15", "satellite_source": "S2", "detected_area_hectares": 81.0, "water_extent_geometry": ref_boundary}
    res_minor = change_engine.compare_observations("Minor Lake", ref_boundary, old_obs, new_obs_minor)
    assert res_minor["change_percentage"] == 19.0
    assert res_minor["change_classification"] == "Moderate Fluctuation"

    # Exactly 20% drop -> Persistent Decline (Critical threshold triggered)
    new_obs_20 = {"observation_date": "2026-03-15", "satellite_source": "S2", "detected_area_hectares": 80.0, "water_extent_geometry": ref_boundary}
    res_20 = change_engine.compare_observations("Threshold Lake", ref_boundary, old_obs, new_obs_20)
    assert res_20["change_percentage"] == 20.0
    assert res_20["change_classification"] == "Persistent Decline"

def test_seasonal_context_awareness():
    """Verify that comparisons evaluate seasonal windows to prevent false positive flags."""
    ref_boundary = {
        "type": "Polygon",
        "coordinates": [[[77.65, 12.92], [77.69, 12.92], [77.69, 12.94], [77.65, 12.94], [77.65, 12.92]]]
    }
    # Comparing Feb 2017 (Dry season) vs March 2026 (Dry season) -> Consistent
    obs_feb = {"observation_date": "2017-02-15", "satellite_source": "S2", "detected_area_hectares": 100.0, "water_extent_geometry": ref_boundary}
    obs_mar = {"observation_date": "2026-03-15", "satellite_source": "S2", "detected_area_hectares": 80.0, "water_extent_geometry": ref_boundary}
    res_consistent = change_engine.compare_observations("Dry Lake", ref_boundary, obs_feb, obs_mar)
    assert res_consistent["seasonal_context"]["is_same_season_comparison"] is True

    # Comparing Feb 2017 (Dry season) vs Oct 2024 (Post-monsoon) -> Inconsistent seasonal gap
    obs_oct = {"observation_date": "2024-10-15", "satellite_source": "S2", "detected_area_hectares": 120.0, "water_extent_geometry": ref_boundary}
    res_gap = change_engine.compare_observations("Seasonal Lake", ref_boundary, obs_feb, obs_oct)
    assert res_gap["seasonal_context"]["is_same_season_comparison"] is False

def test_restoration_lab_mathematical_bounds():
    """Verify that restoration simulation stays within cadastral boundary and respects target %."""
    ref_boundary = {
        "type": "Polygon",
        "coordinates": [[[77.65, 12.92], [77.69, 12.92], [77.69, 12.94], [77.65, 12.94], [77.65, 12.92]]]
    }
    current_water = {
        "type": "Polygon",
        "coordinates": [[[77.66, 12.925], [77.68, 12.925], [77.68, 12.935], [77.66, 12.935], [77.66, 12.925]]]
    }
    for pct in [10, 25, 50, 75, 100]:
        res = restoration_lab.simulate_restoration(
            lake_name="Bellandur Lake",
            lake_reference_boundary=ref_boundary,
            current_water_geometry=current_water,
            current_water_area=100.0,
            restoration_target_pct=float(pct)
        )
        assert res["is_hypothetical"] is True
        assert res["restoration_target_pct"] == float(pct)
        assert res["simulated_water_area_hectares"] >= 100.0
        assert res["area_delta_hectares"] >= 0.0
        assert res["simulated_geometry"] is not None
        assert "HYPOTHETICAL RESTORATION SCENARIO" in res["disclaimer"]
