"""
Authoritative Bengaluru Lake Inventory & Real Multi-Temporal Observation Records.
Sources: BBMP Lake Department Master Inventory, Karnataka Lake Conservation and Development Authority (KLCDA),
OpenStreetMap authoritative surveyed boundaries, and ESA Copernicus Sentinel-2 MSI.
Coordinate Reference: WGS84 (EPSG:4326), with area calculations validated in UTM Zone 43N (EPSG:32643).

Catalog Summary:
Total Active BBMP Lakes: 185
  - Free of Intrusion (Restored/Preserved): 49 lakes
  - Encroached (Public/Private Settlements): 136 lakes
Observations per lake: 6 temporal benchmarks (2017, 2019, 2021, 2023, 2024, 2026) = 1,110 total observations.
"""

import json
from pathlib import Path
from typing import List, Dict, Any

_CACHED_INVENTORY = None

def get_initial_lake_inventory() -> List[Dict[str, Any]]:
    global _CACHED_INVENTORY
    if _CACHED_INVENTORY is not None:
        return _CACHED_INVENTORY

    data_path = Path(__file__).resolve().parents[4] / "data" / "inventory" / "bengaluru_185_lakes_with_observations.json"
    if not data_path.exists():
        # Fallback to local relative
        data_path = Path("data/inventory/bengaluru_185_lakes_with_observations.json")
    
    with open(data_path, "r", encoding="utf-8") as f:
        _CACHED_INVENTORY = json.load(f)
    
    return _CACHED_INVENTORY
