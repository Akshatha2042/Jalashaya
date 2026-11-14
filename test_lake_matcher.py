import json
import math
from shapely.geometry import shape, Point

# Load all 271 extracted satellite water polygons
with open('data/inventory/bengaluru_gee_all_lakes.json') as f:
    gee_lakes = json.load(f)

print(f"Loaded {len(gee_lakes)} satellite water bodies.")

# Helper to find closest polygon to a lat/lng
def find_closest_polygon(target_lat, target_lon, max_dist_km=2.5):
    best_match = None
    best_dist = 999999
    
    for gl in gee_lakes:
        clon, clat = gl["centroid"]
        # Haversine distance
        dlat = (clat - target_lat) * 111.0
        dlon = (clon - target_lon) * 111.0 * math.cos(math.radians(target_lat))
        dist_km = math.sqrt(dlat*dlat + dlon*dlon)
        
        if dist_km < best_dist:
            best_dist = dist_km
            best_match = gl
            
    if best_dist <= max_dist_km:
        return best_match, best_dist
    return None, best_dist

# Test with a few known lakes
test_lakes = [
    ("Bellandur", 12.935, 77.667),
    ("Varthur", 12.948, 77.739),
    ("Sarakki", 12.905, 77.585),
    ("Begur", 12.878, 77.625),
    ("Kasavanahalli", 12.908, 77.683),
    ("Hulimavu", 12.880, 77.600),
    ("Kengeri", 12.915, 77.485),
    ("Chikkabanavara", 13.080, 77.505),
    ("Kalkere", 13.035, 77.675),
    ("Doddanekundi", 12.970, 77.695)
]

for name, lat, lon in test_lakes:
    match, dist = find_closest_polygon(lat, lon)
    if match:
        print(f"Matched {name} -> dist: {dist*1000:.0f}m, area: {match['area_ha']} ha, centroid: {match['centroid']}")
    else:
        print(f"No match for {name}")
