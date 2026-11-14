from typing import Dict, Any, Tuple, List, Union
import pyproj
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import transform, unary_union
from shapely.validation import make_valid

# WGS84 Geographic Coordinate System (Lat/Lon)
CRS_WGS84 = pyproj.CRS("EPSG:4326")

# UTM Zone 43N Projected Coordinate System (Bengaluru region: 72°E - 78°E, Northern Hemisphere)
CRS_UTM43N = pyproj.CRS("EPSG:32643")

# Forward: EPSG:4326 -> EPSG:32643
project_to_utm = pyproj.Transformer.from_crs(CRS_WGS84, CRS_UTM43N, always_xy=True).transform

# Backward: EPSG:32643 -> EPSG:4326
project_to_wgs84 = pyproj.Transformer.from_crs(CRS_UTM43N, CRS_WGS84, always_xy=True).transform

def to_utm(geom: Union[Polygon, MultiPolygon]) -> Union[Polygon, MultiPolygon]:
    """Projects a Shapely geometry from WGS84 (Lon/Lat) to UTM Zone 43N (Meters)."""
    return transform(project_to_utm, geom)

def to_wgs84(geom: Union[Polygon, MultiPolygon]) -> Union[Polygon, MultiPolygon]:
    """Projects a Shapely geometry from UTM Zone 43N (Meters) back to WGS84 (Lon/Lat)."""
    return transform(project_to_wgs84, geom)

def calculate_geodetic_area_hectares(geojson_or_geom: Union[Dict[str, Any], Polygon, MultiPolygon]) -> float:
    """
    Calculates accurate surface area in hectares (1 hectare = 10,000 square meters)
    by projecting from WGS84 to UTM Zone 43N.
    Does NOT calculate area directly from degree coordinates.
    """
    if isinstance(geojson_or_geom, dict):
        geom = shape(geojson_or_geom)
    else:
        geom = geojson_or_geom

    if not geom.is_valid:
        geom = make_valid(geom)

    utm_geom = to_utm(geom)
    area_sq_meters = utm_geom.area
    return round(area_sq_meters / 10000.0, 4)

def calculate_perimeter_meters(geojson_or_geom: Union[Dict[str, Any], Polygon, MultiPolygon]) -> float:
    """Calculates perimeter in meters via UTM Zone 43N projection."""
    if isinstance(geojson_or_geom, dict):
        geom = shape(geojson_or_geom)
    else:
        geom = geojson_or_geom

    if not geom.is_valid:
        geom = make_valid(geom)

    utm_geom = to_utm(geom)
    return round(utm_geom.length, 2)

def clean_and_validate_geometry(geojson_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Ensures topological validity and returns clean GeoJSON geometry."""
    geom = shape(geojson_dict)
    if not geom.is_valid:
        geom = make_valid(geom)
    return mapping(geom)
