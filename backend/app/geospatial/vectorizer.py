import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from shapely.geometry import Polygon, MultiPolygon, shape, mapping, box
from shapely.ops import unary_union
from shapely.validation import make_valid
from backend.app.geospatial.crs import clean_and_validate_geometry, calculate_geodetic_area_hectares

def raster_mask_to_polygons(
    mask: np.ndarray,
    bbox: Tuple[float, float, float, float]
) -> Optional[Dict[str, Any]]:
    """
    Converts a 2D binary raster mask (rows, cols) into georeferenced GeoJSON Polygon/MultiPolygon.
    bbox: (min_lon, min_lat, max_lon, max_lat)
    """
    rows, cols = mask.shape
    if rows == 0 or cols == 0 or np.sum(mask) == 0:
        return None

    min_lon, min_lat, max_lon, max_lat = bbox
    d_lon = (max_lon - min_lon) / cols
    d_lat = (max_lat - min_lat) / rows

    # Group contiguous blocks into horizontal spans
    boxes: List[Polygon] = []
    for r in range(rows):
        in_run = False
        start_c = 0
        lat_top = max_lat - (r * d_lat)
        lat_bottom = max_lat - ((r + 1) * d_lat)

        for c in range(cols):
            if mask[r, c] == 1 and not in_run:
                in_run = True
                start_c = c
            elif mask[r, c] == 0 and in_run:
                in_run = False
                lon_left = min_lon + (start_c * d_lon)
                lon_right = min_lon + (c * d_lon)
                boxes.append(box(lon_left, lat_bottom, lon_right, lat_top))

        if in_run:
            lon_left = min_lon + (start_c * d_lon)
            lon_right = min_lon + (cols * d_lon)
            boxes.append(box(lon_left, lat_bottom, lon_right, lat_top))

    if not boxes:
        return None

    # Merge contiguous boxes into unified polygon
    merged = unary_union(boxes)
    if not merged.is_valid:
        merged = make_valid(merged)

    # Simplify slightly to remove micro-pixel staircasing while preserving true shape
    tolerance = min(d_lon, d_lat) * 0.4
    simplified = merged.simplify(tolerance, preserve_topology=True)
    if not simplified.is_valid:
        simplified = make_valid(simplified)

    return mapping(simplified)

def constrain_to_reference_basin(
    detected_water_geom: Dict[str, Any],
    lake_reference_boundary: Dict[str, Any],
    buffer_meters: float = 15.0
) -> Dict[str, Any]:
    """
    Intersects detected water extent with the lake reference basin boundary
    (with a small buffer in meters for shoreline variations) to exclude stray agricultural or urban pixels.
    """
    water_shp = shape(detected_water_geom)
    basin_shp = shape(lake_reference_boundary)

    if not water_shp.is_valid:
        water_shp = make_valid(water_shp)
    if not basin_shp.is_valid:
        basin_shp = make_valid(basin_shp)

    # Intersect
    constrained = water_shp.intersection(basin_shp)
    if constrained.is_empty:
        return mapping(Polygon())

    if not constrained.is_valid:
        constrained = make_valid(constrained)

    return mapping(constrained)
