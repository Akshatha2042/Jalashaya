import ee
import json
from shapely.geometry import shape, mapping, Polygon, MultiPolygon

def extract_lake_from_gee():
    sa_info = json.load(open('backend/secrets/gee-sa.json'))
    creds = ee.ServiceAccountCredentials(sa_info['client_email'], 'backend/secrets/gee-sa.json')
    ee.Initialize(creds, project=sa_info['project_id'])

    # Bellandur lake region: around [77.65 to 77.69, 12.925 to 12.95]
    bbox = ee.Geometry.Polygon([[
        [77.650, 12.928],
        [77.695, 12.928],
        [77.695, 12.952],
        [77.650, 12.952],
        [77.650, 12.928]
    ]])

    print("Querying JRC Global Surface Water occurrence...")
    jrc = ee.Image('JRC/GSW1_4/GlobalSurfaceWater').select('occurrence')
    # Water where occurrence > 10%
    water = jrc.gt(10).clip(bbox).selfMask()

    vectors = water.reduceToVectors(
        geometry=bbox,
        scale=30,
        maxPixels=1e7,
        geometryType='polygon',
        eightConnected=True
    )

    feat_list = vectors.getInfo()['features']
    print(f"Extracted {len(feat_list)} vector polygons from JRC!")

    # Find the largest polygon which represents Bellandur lake
    largest_feat = max(feat_list, key=lambda f: shape(f['geometry']).area)
    lake_poly = shape(largest_feat['geometry'])
    print(f"Largest polygon area: {lake_poly.area} sq deg, bounds: {lake_poly.bounds}")

    # Output GeoJSON
    with open("data/inventory/bellandur_gee_polygon.json", "w") as f:
        json.dump(mapping(lake_poly), f, indent=2)
    print("Saved to data/inventory/bellandur_gee_polygon.json")

if __name__ == "__main__":
    try:
        extract_lake_from_gee()
    except Exception as e:
        print("GEE error:", e)
