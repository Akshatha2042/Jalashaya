import json
import ee
from backend.app.services.satellite.gee_client import GEEClient
from shapely.geometry import shape, mapping
from shapely.ops import transform
from pyproj import Transformer

client = GEEClient()
if not client.is_initialized:
    print("GEE not initialized")
    exit(1)

# Bengaluru Metropolitan ROI
bengaluru_box = ee.Geometry.Rectangle([77.46, 12.82, 77.77, 13.14])

jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater")
max_extent = jrc.select("max_extent")

# Filter water bodies larger than 1 hectare (10,000 m2)
water = max_extent.gt(0).selfMask().clip(bengaluru_box)

print("Reducing to vectors in GEE...")
vectors = water.reduceToVectors(
    geometry=bengaluru_box,
    scale=30,
    geometryType="polygon",
    eightConnected=True,
    maxPixels=1e8
)

feats = vectors.getInfo()["features"]
print(f"Total raw water bodies in Bengaluru: {len(feats)}")

transformer_to_utm = Transformer.from_crs('EPSG:4326', 'EPSG:32643', always_xy=True)

valid_lakes = []
for idx, f in enumerate(feats):
    try:
        s = shape(f["geometry"])
        s_utm = transform(transformer_to_utm.transform, s)
        area_ha = s_utm.area / 10000.0
        # BBMP tracks lakes roughly > 1.0 ha up to 360 ha
        if 0.8 <= area_ha <= 450.0:
            bounds = s.bounds
            valid_lakes.append({
                "id": f"gee-lake-{idx}",
                "area_ha": round(area_ha, 2),
                "bounds": [round(b, 5) for b in bounds],
                "centroid": [round(s.centroid.x, 5), round(s.centroid.y, 5)],
                "geometry": f["geometry"]
            })
    except Exception:
        pass

print(f"Filtered lakes between 0.8 ha and 450 ha: {len(valid_lakes)}")
with open("data/inventory/bengaluru_gee_all_lakes.json", "w") as out_f:
    json.dump(valid_lakes, out_f)
print("Saved to data/inventory/bengaluru_gee_all_lakes.json")
