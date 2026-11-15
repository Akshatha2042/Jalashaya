import pytest
import numpy as np
from shapely.geometry import Polygon, MultiPolygon, shape, box
from backend.app.geospatial.ndwi import compute_ndwi, threshold_water_mask
from backend.app.geospatial.crs import calculate_geodetic_area_hectares, to_utm
from backend.app.core.database import SessionLocal
from backend.app.models.lake import Lake, SatelliteObservation, WaterDetectionResult

def test_ndwi_numerical_matrix():
    """Verify McFeeters NDWI on known physical reflectance values."""
    # Pixel 1: Pure deep water (High green, low NIR)
    # Pixel 2: Dense vegetation (Moderate green, very high NIR) -> negative NDWI
    # Pixel 3: Urban concrete (Moderate green, slightly higher NIR) -> negative NDWI
    # Pixel 4: Dry bare soil (Low green, moderate NIR) -> negative NDWI
    green = np.array([[0.40, 0.15], [0.25, 0.20]], dtype=np.float32)
    nir = np.array([[0.05, 0.50], [0.35, 0.40]], dtype=np.float32)

    ndwi = compute_ndwi(green, nir)
    assert ndwi.shape == (2, 2)

    # Pixel 1 (water): (0.40 - 0.05) / (0.40 + 0.05) = 0.35 / 0.45 = +0.7778
    assert np.isclose(ndwi[0, 0], 0.35 / 0.45, atol=1e-3)
    assert ndwi[0, 0] > 0.0

    # Pixel 2 (vegetation): (0.15 - 0.50) / (0.15 + 0.50) = -0.35 / 0.65 = -0.5385
    assert np.isclose(ndwi[0, 1], -0.35 / 0.65, atol=1e-3)
    assert ndwi[0, 1] < 0.0

    # Water mask generation with McFeeters threshold = 0.0 on a 4x4 raster:
    # 2x2 contiguous water patch in center (survives speckle filter),
    # plus 1 isolated single-pixel water anomaly (should be filtered out by morphological filter).
    ndwi_field = np.array([
        [-0.5, -0.4, -0.3,  0.8],  # [0, 3] is isolated speckle noise
        [-0.3,  0.6,  0.7, -0.2],  # [1:3, 1:3] is contiguous water body
        [-0.4,  0.8,  0.5, -0.4],
        [-0.6, -0.3, -0.2, -0.5]
    ], dtype=np.float32)

    mask = threshold_water_mask(ndwi_field, threshold=0.0)
    # Contiguous water body pixels survive
    assert mask[1, 1] == 1
    assert mask[1, 2] == 1
    assert mask[2, 1] == 1
    assert mask[2, 2] == 1
    # Isolated speckle noise at [0, 3] is eliminated
    assert mask[0, 3] == 0
    # Land pixels remain 0
    assert mask[0, 0] == 0
    assert mask[3, 3] == 0

def test_ndwi_singularity_and_overflow_protection():
    """Ensure divide-by-zero, negative, and infinite cases are handled without crashing."""
    green = np.array([[0.0, 0.0], [-0.05, 1e6]], dtype=np.float32)
    nir = np.array([[0.0, 1.0], [-0.05, 1e6]], dtype=np.float32)

    ndwi = compute_ndwi(green, nir)
    assert not np.isnan(ndwi).any()
    assert not np.isinf(ndwi).any()
    assert ndwi[0, 0] == -1.0  # Guarded default for zero-sum

def test_geodetic_area_utm_zone_43n_accuracy():
    """Verify planar projection area in UTM Zone 43N (EPSG:32643) vs direct degree errors."""
    # A precise 1km x 1km square at Bengaluru coordinates (12.97° N, 77.59° E)
    # Expected area: 1,000,000 m² = 100.0 hectares
    lon1, lat1 = 77.590000, 12.970000
    # ~0.00921 degrees latitude = 1000m; ~0.00902 degrees longitude = ~1000m
    utm_geom = to_utm(box(lon1, lat1, lon1 + 0.00902, lat1 + 0.00921))
    area_ha = utm_geom.area / 10000.0
    assert 90.0 < area_ha < 110.0, f"Calculated area {area_ha} ha deviates from expected 100 ha"

def test_database_all_185_lake_geometries_valid():
    """Inspect all 185 lake boundary polygons in jalashaya.db for closure, validity, and bbox."""
    db = SessionLocal()
    try:
        lakes = db.query(Lake).all()
        assert len(lakes) == 185, f"Expected 185 lakes, found {len(lakes)}"

        for lake in lakes:
            geom_dict = lake.boundary_geometry
            assert geom_dict is not None, f"Lake {lake.id} has null boundary geometry"
            assert geom_dict["type"] in ["Polygon", "MultiPolygon"]

            poly = shape(geom_dict)
            assert poly.is_valid, f"Lake {lake.id} ({lake.official_name}) geometry is invalid"
            assert not poly.is_empty, f"Lake {lake.id} geometry is empty"

            # Check Greater Bengaluru geographic bounding box (77.3 - 77.9 E, 12.7 - 13.3 N)
            minx, miny, maxx, maxy = poly.bounds
            assert 77.2 <= minx <= 77.9, f"Lake {lake.id} min lon {minx} out of Bengaluru bounds"
            assert 77.2 <= maxx <= 77.9, f"Lake {lake.id} max lon {maxx} out of Bengaluru bounds"
            assert 12.6 <= miny <= 13.4, f"Lake {lake.id} min lat {miny} out of Bengaluru bounds"
            assert 12.6 <= maxy <= 13.4, f"Lake {lake.id} max lat {maxy} out of Bengaluru bounds"

            # Verify polygon coordinate closure (first == last point in ring)
            if geom_dict["type"] == "Polygon":
                for ring in geom_dict["coordinates"]:
                    assert ring[0] == ring[-1], f"Lake {lake.id} polygon ring is not closed"
            elif geom_dict["type"] == "MultiPolygon":
                for part in geom_dict["coordinates"]:
                    for ring in part:
                        assert ring[0] == ring[-1], f"Lake {lake.id} multipolygon ring is not closed"
    finally:
        db.close()

def test_reference_boundary_vs_detected_water_separation():
    """Verify that legal reference cadastre and detected water extent are separate concepts."""
    db = SessionLocal()
    try:
        bellandur = db.query(Lake).filter(Lake.id == "lake-bellandur").first()
        assert bellandur is not None
        obs_2026 = (
            db.query(SatelliteObservation)
            .filter(
                SatelliteObservation.lake_id == "lake-bellandur",
                SatelliteObservation.observation_date == "2026-03-15",
            )
            .first()
        )
        assert obs_2026 is not None
        assert obs_2026.detection_result is not None

        cadastral_area = bellandur.area_hectares  # Legal cadastral baseline
        detected_water = obs_2026.detection_result.detected_area_hectares  # Contemporary water

        assert cadastral_area == 324.5
        assert detected_water < cadastral_area
        # Detected water is ~108.45 ha, showing that reference boundary != detected water
        assert 100.0 < detected_water < 120.0
    finally:
        db.close()
