import json
import ee
from backend.app.services.satellite.gee_client import GEEClient
from shapely.geometry import shape
from pyproj import Transformer
from shapely.ops import transform

client = GEEClient()
if not client.is_initialized:
    exit(1)

jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater")
max_extent = jrc.select("max_extent") # 1 where water has ever been detected

lakes_roi = {
    "lake-bellandur": [77.652, 12.926, 77.680, 12.944],
    "lake-varthur": [77.726, 12.930, 77.760, 12.956],
    "lake-jakkur": [77.595, 13.068, 77.618, 13.088],
    "lake-ulsoor": [77.613, 12.976, 77.628, 12.990],
    "lake-sankey": [77.568, 13.004, 77.579, 13.013],
    "lake-hebbal": [77.580, 13.038, 77.601, 13.054],
    "lake-agara": [77.639, 12.918, 77.655, 12.932],
    "lake-kaikondrahalli": [77.670, 12.905, 77.682, 12.918],
    "lake-madiwala": [77.608, 12.905, 77.627, 12.925],
    "lake-nagavara": [77.612, 13.040, 77.628, 13.056],
    "lake-rachenahalli": [77.603, 13.050, 77.619, 13.064],
    "lake-chelekere": [77.640, 13.018, 77.651, 13.029],
    "lake-puttenahalli": [77.582, 12.886, 77.591, 12.896],
    "lake-saul-kere": [77.676, 12.912, 77.689, 12.924],
    "lake-lalbagh": [77.580, 12.942, 77.592, 12.952],
    "lake-yelahanka": [77.580, 13.092, 77.600, 13.113]
}

results = {}
transformer = Transformer.from_crs('EPSG:4326', 'EPSG:32643', always_xy=True)

for lid, roi in lakes_roi.items():
    geom = ee.Geometry.Rectangle(roi)
    mask = max_extent.gt(0).selfMask().clip(geom)
    vectors = mask.reduceToVectors(
        geometry=geom,
        scale=30,
        geometryType="polygon",
        eightConnected=True,
        maxPixels=1e7
    )
    features = vectors.getInfo()["features"]
    valid = []
    for f in features:
        try:
            s = shape(f["geometry"])
            valid.append((s.area, f["geometry"], s))
        except Exception:
            pass
    if valid:
        valid.sort(key=lambda x: -x[0])
        largest_geom = valid[0][1]
        s = valid[0][2]
        s_utm = transform(transformer.transform, s)
        area_ha = s_utm.area / 10000.0
        bounds = s.bounds
        results[lid] = {
            "geometry": largest_geom,
            "bounds": bounds,
            "area_ha": area_ha
        }
        print(f"{lid}: Area: {area_ha:6.2f} ha | Bounds: [{bounds[0]:.4f}, {bounds[1]:.4f}, {bounds[2]:.4f}, {bounds[3]:.4f}]")

with open("data/inventory/jrc_max_extents.json", "w") as f:
    json.dump(results, f, indent=2)
print("Saved jrc_max_extents.json")
