import pytest
import time
from fastapi.testclient import TestClient
from backend.app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_api_catalog_query_and_search(client):
    """Test lake listing, search filters, and administrative zone queries."""
    # 1. Full inventory
    start = time.perf_counter()
    r = client.get("/api/v1/lakes")
    elapsed = time.perf_counter() - start
    assert r.status_code == 200
    assert elapsed < 3.500, f"Full lake inventory latency {elapsed:.3f}s exceeds 3500ms"
    data = r.json()
    assert len(data) == 185

    # 2. Search query
    r_search = client.get("/api/v1/lakes?search=Bellandur")
    assert r_search.status_code == 200
    res_search = r_search.json()
    assert len(res_search) >= 1
    assert any("Bellandur" in l["official_name"] for l in res_search)

    # 3. Zone query
    r_zone = client.get("/api/v1/lakes?zone=Mahadevapura")
    assert r_zone.status_code == 200
    res_zone = r_zone.json()
    assert len(res_zone) > 0
    assert all(l["administrative_zone"] == "Mahadevapura" for l in res_zone)

    # 4. Non-existent zone
    r_empty = client.get("/api/v1/lakes?zone=Atlantis")
    assert r_empty.status_code == 200
    assert len(r_empty.json()) == 0

def test_api_lake_detail_and_404_error(client):
    """Test single lake lookup and 404 response for invalid IDs."""
    r_valid = client.get("/api/v1/lakes/lake-bellandur")
    assert r_valid.status_code == 200
    detail = r_valid.json()
    assert detail["id"] == "lake-bellandur"
    assert "boundary_geometry" in detail
    assert detail["boundary_geometry"]["type"] in ["Polygon", "MultiPolygon"]

    r_invalid = client.get("/api/v1/lakes/non-existent-lake-xyz-999")
    assert r_invalid.status_code == 404
    assert "not found" in r_invalid.json()["detail"].lower()

def test_api_observations_and_timeline_order(client):
    """Test retrieving multi-temporal observation sequence for a lake."""
    r = client.get("/api/v1/lakes/lake-bellandur/observations")
    assert r.status_code == 200
    obs = r.json()
    assert len(obs) == 6
    dates = [o["observation_date"] for o in obs]
    # Check chronological ordering
    assert dates == sorted(dates)
    assert dates[0] == "2017-02-15"
    assert dates[-1] == "2026-03-15"
    # Ensure water detection results are populated
    for o in obs:
        assert o["detected_area_hectares"] is not None
        assert o["water_extent_geometry"] is not None

def test_api_comparison_endpoint_and_validation(client):
    """Test observation comparison with valid, invalid, and missing payloads."""
    # 1. Valid comparison
    r_comp = client.post(
        "/api/v1/lakes/lake-bellandur/compare",
        json={
            "lake_id": "lake-bellandur",
            "older_observation_id": "obs-lake-bellandur-2017",
            "newer_observation_id": "obs-lake-bellandur-2026"
        }
    )
    assert r_comp.status_code == 200
    comp = r_comp.json()
    assert comp["lake_id"] == "lake-bellandur"
    assert comp["area_old_hectares"] > comp["area_new_hectares"]
    assert comp["area_change_hectares"] < 0
    assert comp["change_percentage"] >= 20.0
    assert "lost_water_geometry" in comp

    # 2. Missing payload fields (triggers Pydantic 422 Unprocessable Entity)
    r_invalid = client.post("/api/v1/lakes/lake-bellandur/compare", json={})
    assert r_invalid.status_code == 422

    # 3. Invalid observation IDs (triggers 404 Not Found)
    r_notfound = client.post(
        "/api/v1/lakes/lake-bellandur/compare",
        json={
            "lake_id": "lake-bellandur",
            "older_observation_id": "fake-obs-id-1",
            "newer_observation_id": "fake-obs-id-2"
        }
    )
    assert r_notfound.status_code == 404

def test_api_restoration_simulation_bounds(client):
    """Test restoration simulation API with valid and out-of-range targets."""
    # 1. Valid target 50%
    r = client.post(
        "/api/v1/lakes/lake-bellandur/simulate-restoration",
        json={"lake_id": "lake-bellandur", "restoration_target_pct": 50.0}
    )
    assert r.status_code == 200
    res = r.json()
    assert res["is_hypothetical"] is True
    assert res["restoration_target_pct"] == 50.0
    assert res["simulated_water_area_hectares"] > 100.0

    # 2. Out of range target (e.g. 150% or -10%)
    r_bad = client.post(
        "/api/v1/lakes/lake-bellandur/simulate-restoration",
        json={"lake_id": "lake-bellandur", "restoration_target_pct": 150.0}
    )
    assert r_bad.status_code == 422

def test_api_report_exports(client):
    """Verify HTML, GeoJSON, and CSV report export endpoints."""
    # 1. HTML Report
    r_html = client.get("/api/v1/lakes/lake-bellandur/report.html")
    assert r_html.status_code == 200
    assert "text/html" in r_html.headers["content-type"]
    assert "JALASHAYA" in r_html.text
    assert "Bellandur Lake" in r_html.text

    # 2. GeoJSON Evidence Report
    r_geo = client.get("/api/v1/lakes/lake-bellandur/report.geojson")
    assert r_geo.status_code == 200
    geo = r_geo.json()
    assert geo["type"] == "FeatureCollection"
    assert len(geo["features"]) >= 2  # Cadastral reference + water extent

    # 3. CSV Observations Export
    r_csv = client.get("/api/v1/lakes/lake-bellandur/observations.csv")
    assert r_csv.status_code == 200
    assert "text/csv" in r_csv.headers["content-type"]
    assert "Observation_ID,Date,Satellite_Source" in r_csv.text

def test_sql_injection_resilience(client):
    """Verify that search query parameters are immune to SQL injection attacks."""
    injection_payloads = [
        "' OR 1=1 --",
        "'; DROP TABLE lakes; --",
        "UNION SELECT null, null, null--",
        "1' AND '1'='1"
    ]
    for payload in injection_payloads:
        r = client.get(f"/api/v1/lakes?search={payload}")
        assert r.status_code == 200
        # If safely parameterized, it should simply return 0 matches
        assert len(r.json()) == 0

    # Verify database was not dropped
    r_check = client.get("/api/v1/lakes")
    assert r_check.status_code == 200
    assert len(r_check.json()) == 185
