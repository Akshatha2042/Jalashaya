import json
from backend.app.services.lakes.lake_inventory_data import get_initial_lake_inventory

lakes = get_initial_lake_inventory()

for l in lakes:
    clean_id = l["id"].replace("-lake", "")
    if clean_id.endswith("-"):
        clean_id = clean_id[:-1]
    l["id"] = clean_id
    for o in l.get("observations", []):
        o["id"] = o["id"].replace("-lake-", "-")

output_py = '''"""
Authoritative Bengaluru Lake Inventory & Real Observation Records.
Sources: BBMP Lake Department, KLCDA, Karnataka Forest Department, OpenStreetMap contributors,
European Commission JRC Global Surface Water, and ESA Copernicus Sentinel-2 MSI.
Coordinate Reference: WGS84 (EPSG:4326), with area calculations validated in UTM Zone 43N (EPSG:32643).
Total Active Tracked Lakes: 185 (49 Free of Intrusion, 136 Encroached).
"""

from typing import List, Dict, Any

def get_initial_lake_inventory() -> List[Dict[str, Any]]:
    return ''' + json.dumps(lakes, indent=4) + "\n"

with open("backend/app/services/lakes/lake_inventory_data.py", "w", encoding="utf-8") as f:
    f.write(output_py)

print("IDs cleaned up cleanly!")
