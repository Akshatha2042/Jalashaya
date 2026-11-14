import json
import math
from shapely.geometry import shape, mapping
from shapely.ops import transform
from pyproj import Transformer

transformer_to_utm = Transformer.from_crs('EPSG:4326', 'EPSG:32643', always_xy=True)
transformer_to_wgs = Transformer.from_crs('EPSG:32643', 'EPSG:4326', always_xy=True)

with open('data/inventory/bengaluru_gee_all_lakes.json') as f:
    gee_lakes = json.load(f)

print(f"Loaded {len(gee_lakes)} GEE satellite polygons.")

# Match each lake by nearest satellite polygon
used_poly_indices = set()

def get_best_polygon(target_lat, target_lon, target_area=None):
    best_idx = None
    best_score = 999999
    
    for idx, gl in enumerate(gee_lakes):
        clon, clat = gl["centroid"]
        dlat = (clat - target_lat) * 111.0
        dlon = (clon - target_lon) * 111.0 * math.cos(math.radians(target_lat))
        dist_km = math.sqrt(dlat*dlat + dlon*dlon)
        
        # Penalize already used polygons slightly so distinct lakes get distinct polygons
        usage_penalty = 1.8 if idx in used_poly_indices else 1.0
        
        # Area difference factor if target area provided
        area_diff = 1.0
        if target_area:
            area_ratio = max(gl["area_ha"] / max(target_area, 0.5), target_area / max(gl["area_ha"], 0.5))
            area_diff = min(3.0, area_ratio)
            
        score = dist_km * usage_penalty * (1.0 + 0.2 * area_diff)
        
        if score < best_score:
            best_score = score
            best_idx = idx
            
    if best_idx is not None:
        used_poly_indices.add(best_idx)
        return gee_lakes[best_idx]
    return gee_lakes[0]

print("Matcher ready.")
