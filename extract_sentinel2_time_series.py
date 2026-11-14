import json
import ee
from backend.app.services.satellite.gee_client import GEEClient
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
from pyproj import Transformer
from shapely.ops import transform

client = GEEClient()
if not client.is_initialized:
    exit(1)

bellandur_box = ee.Geometry.Rectangle([77.653, 12.926, 77.679, 12.943])

configs = [
    {"year": "2017", "id": "obs-bellandur-2017", "date": "2017-02-15", "start": "2017-02-01", "end": "2017-03-15", "col": "COPERNICUS/S2", "thresh": 0.0},
    {"year": "2019", "id": "obs-bellandur-2019", "date": "2019-03-10", "start": "2019-02-15", "end": "2019-03-30", "col": "COPERNICUS/S2_SR_HARMONIZED", "thresh": 0.0},
    {"year": "2021", "id": "obs-bellandur-2021", "date": "2021-02-28", "start": "2021-02-01", "end": "2021-03-30", "col": "COPERNICUS/S2_SR_HARMONIZED", "thresh": -0.05},
    {"year": "2023", "id": "obs-bellandur-2023", "date": "2023-01-20", "start": "2023-01-10", "end": "2023-02-28", "col": "COPERNICUS/S2_SR_HARMONIZED", "thresh": 0.0},
    {"year": "2024", "id": "obs-bellandur-2024", "date": "2024-03-05", "start": "2024-02-15", "end": "2024-03-25", "col": "COPERNICUS/S2_SR_HARMONIZED", "thresh": 0.0},
]

transformer = Transformer.from_crs('EPSG:4326', 'EPSG:32643', always_xy=True)
results = {}

for c in configs:
    s2 = (
        ee.ImageCollection(c["col"])
        .filterBounds(bellandur_box)
        .filterDate(c["start"], c["end"])
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 10))
        .sort("CLOUDY_PIXEL_PERCENTAGE")
    )
    img = s2.first()
    ndwi = img.normalizedDifference(["B3", "B8"]).rename("ndwi")
    water_mask = ndwi.gt(c["thresh"]).selfMask().clip(bellandur_box)
    vectors = water_mask.reduceToVectors(
        geometry=bellandur_box,
        scale=20,
        geometryType="polygon",
        eightConnected=True,
        maxPixels=1e7
    )
    feats = vectors.getInfo()["features"]
    polys = []
    for f in feats:
        try:
            poly = shape(f["geometry"])
            if poly.area > 2e-6:
                polys.append(poly)
        except Exception:
            pass
    if polys:
        merged = unary_union(polys)
        if merged.geom_type == "MultiPolygon":
            parts = [p for p in merged.geoms if p.area > 3e-6]
            merged = unary_union(parts) if parts else max(merged.geoms, key=lambda p: p.area)
        
        # Simplify slightly
        simplified = merged.simplify(0.0001, preserve_topology=True)
        s_utm = transform(transformer.transform, simplified)
        area_ha = s_utm.area / 10000.0
        bounds = simplified.bounds
        results[c["year"]] = {
            "obs_id": c["id"],
            "observation_date": c["date"],
            "area_hectares": round(area_ha, 2),
            "geometry": mapping(simplified),
            "bounds": [round(b, 5) for b in bounds]
        }
        print(f"{c['year']} ({c['date']}): {area_ha:.2f} ha | Bounds: {results[c['year']]['bounds']}")

with open("data/inventory/bellandur_s2_time_series.json", "w") as f:
    json.dump(results, f, indent=2)
print("Updated data/inventory/bellandur_s2_time_series.json successfully!")
