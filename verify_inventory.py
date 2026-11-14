from backend.app.services.lakes.lake_inventory_data import get_initial_lake_inventory
from shapely.geometry import shape

lakes = get_initial_lake_inventory()
print(f"Total lakes: {len(lakes)}")
for l in lakes:
    b = shape(l['boundary_geometry']).bounds
    obs = l.get('observations', [])
    print(f"{l['id']}: {l['official_name']} | Center: ({l['longitude']}, {l['latitude']}) | Bounds: Lon [{b[0]:.4f}, {b[2]:.4f}] Lat [{b[1]:.4f}, {b[3]:.4f}] | Obs: {len(obs)}")
    for o in obs:
        ob = shape(o['water_extent_geometry']).bounds
        print(f"   - {o['id']} ({o['detected_area_hectares']} ha): Lon [{ob[0]:.4f}, {ob[2]:.4f}] Lat [{ob[1]:.4f}, {ob[3]:.4f}]")
