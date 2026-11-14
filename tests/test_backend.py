import pytest
import numpy as np
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.geospatial.ndwi import compute_ndwi, threshold_water_mask
from backend.app.geospatial.crs import calculate_geodetic_area_hectares
from backend.app.services.comparison.change_engine import change_engine
from backend.app.services.simulation.restoration_lab import restoration_lab
from shapely.geometry import box, mapping

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_ndwi_computation():
    # Green higher than NIR (typical water signature)
    green = np.array([[0.35, 0.40], [0.30, 0.25]], dtype=np.float32)
    nir = np.array([[0.05, 0.08], [0.06, 0.04]], dtype=np.float32)
    ndwi = compute_ndwi(green, nir)

    assert ndwi.shape == (2, 2)
    assert np.all(ndwi > 0.5)  # Significant positive index for water

    # Mask thresholding
    mask = threshold_water_mask(ndwi, threshold=0.0)
    assert mask.shape == (2, 2)

def test_ndwi_zero_division_safety():
    # Zero green and NIR
    green = np.array([[0.0, 0.0]], dtype=np.float32)
    nir = np.array([[0.0, 0.0]], dtype=np.float32)
    ndwi = compute_ndwi(green, nir)
    assert not np.isnan(ndwi).any()
    assert not np.isinf(ndwi).any()
    assert ndwi[0, 0] == -1.0

def test_geodetic_area_hectares():
    # A box approximately 1km x 1km in Bengaluru (approx 100 hectares)
    # 0.009 degrees lon/lat is ~1000m
    test_box = box(77.6000, 12.9000, 77.6090, 12.9090)
    area_ha = calculate_geodetic_area_hectares(test_box)
    assert 90.0 < area_ha < 125.0

def test_lake_inventory_api(client):
    response = client.get("/api/v1/lakes")
    assert response.status_code == 200
    lakes = response.json()
    assert len(lakes) >= 10
    names = [l["official_name"] for l in lakes]
    assert "Bellandur Lake" in names
    assert "Varthur Lake" in names
    assert "Jakkur Lake" in names
    assert "Ulsoor Lake" in names
    assert "Sankey Tank" in names

def test_lake_detail_api(client):
    response = client.get("/api/v1/lakes/lake-bellandur")
    assert response.status_code == 200
    data = response.json()
    assert data["official_name"] == "Bellandur Lake"
    assert data["administrative_zone"] == "Mahadevapura"
    assert "boundary_geometry" in data

def test_lake_observations_api(client):
    response = client.get("/api/v1/lakes/lake-bellandur/observations")
    assert response.status_code == 200
    obs = response.json()
    assert len(obs) >= 4
    assert obs[0]["observation_date"] == "2017-02-15"
    assert obs[0]["detected_area_hectares"] > 30.0

def test_change_engine_comparison():
    ref_boundary = {
        "type": "Polygon",
        "coordinates": [[[77.65, 12.92], [77.69, 12.92], [77.69, 12.94], [77.65, 12.94], [77.65, 12.92]]]
    }
    old_obs = {
        "observation_date": "2017-02-15",
        "satellite_source": "Sentinel-2A",
        "detected_area_hectares": 300.0,
        "water_extent_geometry": ref_boundary
    }
    new_obs = {
        "observation_date": "2024-03-05",
        "satellite_source": "Sentinel-2A",
        "detected_area_hectares": 200.0,
        "water_extent_geometry": ref_boundary
    }
    result = change_engine.compare_observations(
        "Bellandur Lake",
        ref_boundary,
        old_obs,
        new_obs
    )
    assert result["area_change_hectares"] == -100.0
    assert result["change_percentage"] == 33.33
    assert result["change_classification"] == "Persistent Decline"
    assert not result["is_gain"]

def test_restoration_lab_simulation():
    ref_boundary = {
        "type": "Polygon",
        "coordinates": [[[77.65, 12.92], [77.69, 12.92], [77.69, 12.94], [77.65, 12.94], [77.65, 12.92]]]
    }
    current_water = {
        "type": "Polygon",
        "coordinates": [[[77.66, 12.925], [77.68, 12.925], [77.68, 12.935], [77.66, 12.935], [77.66, 12.925]]]
    }
    result = restoration_lab.simulate_restoration(
        "Bellandur Lake",
        ref_boundary,
        current_water,
        current_water_area=100.0,
        restoration_target_pct=50.0
    )
    assert result["is_hypothetical"] is True
    assert result["simulated_water_area_hectares"] > 100.0
    assert "HYPOTHETICAL" in result["disclaimer"]

def test_system_health(client):
    response = client.get("/api/v1/system/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "providers" in data
    assert "google_earth_engine" in data["providers"]
