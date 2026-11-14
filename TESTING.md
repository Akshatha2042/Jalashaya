# JALASHAYA — Testing & Scientific Validation Guide

## 1. Automated Backend Test Suite

JALASHAYA includes a comprehensive automated test suite powered by `pytest` and `FastAPI TestClient`.

### Running the Test Suite:
```bash
# In the project root with the virtual environment activated:
$env:PYTHONPATH="."
.\backend\venv\Scripts\pytest tests\test_backend.py -v
```

### Coverage Overview:
| Test Function | Component Verified |
| :--- | :--- |
| `test_ndwi_computation` | Verifies McFeeters $(B3 - B8)/(B3 + B8)$ formula produces positive values on water signatures. |
| `test_ndwi_zero_division_safety` | Verifies zero and invalid pixel handling without NaN or Inf values. |
| `test_geodetic_area_hectares` | Verifies projection from WGS84 to UTM Zone 43N (EPSG:32643) matches true ground area. |
| `test_lake_inventory_api` | Verifies `GET /api/v1/lakes` returns authoritative lakes with risk statuses. |
| `test_lake_detail_api` | Verifies `GET /api/v1/lakes/{id}` retrieves cadastral geometry and metadata. |
| `test_lake_observations_api` | Verifies `GET /api/v1/lakes/{id}/observations` retrieves multi-temporal satellite records. |
| `test_change_engine_comparison` | Verifies $\Delta A$, percentage change, and spatial difference vector generation. |
| `test_restoration_lab_simulation` | Verifies hypothetical area calculation and required disclaimers. |
| `test_system_health` | Verifies system health, database dialect, and provider transparency. |

---

## 2. Frontend Build & Static Analysis

Verify TypeScript type safety and Vite production bundling:
```bash
cd frontend
npm run build
```
This runs `tsc` for complete type-checking across all components, hooks, and services, followed by Vite production bundling.
