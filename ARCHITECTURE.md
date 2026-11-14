# JALASHAYA — System Architecture Specification

## 1. Architectural Overview

**JALASHAYA** is an environmental geospatial digital twin and temporal simulation platform specifically engineered for Bengaluru's water bodies. It moves beyond traditional analytics dashboards by implementing a **simulation-first, remote-sensing pipeline** that grounds every lake polygon, satellite observation, and surface-water delta in verifiable physics and satellite telemetry.

```
                              ┌──────────────────────────────────────────────┐
                              │           JALASHAYA Digital Twin             │
                              │ (React 18 + TypeScript + Vite + MapLibre GL) │
                              └──────────────────────┬───────────────────────┘
                                                     │ REST / GeoJSON
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │            FastAPI Backend Engine            │
                              │           (Python 3.13 + Pydantic)           │
                              └───────┬──────────────┬───────────────┬───────┘
                                      │              │               │
        ┌─────────────────────────────┼──────────────┼───────────────┼─────────────────────────────┐
        │                             │              │               │                             │
        ▼                             ▼              ▼               ▼                             ▼
┌───────────────┐             ┌───────────────┐ ┌─────────────┐ ┌───────────────┐          ┌───────────────┐
│ Lake Cadastre │             │  Sentinel-2   │ │     JRC     │ │ NDWI Vector   │          │  Restoration  │
│  Repository   │             │   MSI Engine  │ │  GSW (30m)  │ │ Detection Core│          │      Lab      │
│ (BBMP / PostGIS)│           │ (Copernicus)  │ │ (1984-2021) │ │ (UTM Zone 43N)│          │  (What-If)    │
└───────────────┘             └───────────────┘ └─────────────┘ └───────────────┘          └───────────────┘
```

---

## 2. Core Subsystems

### A. Lake Inventory & Cadastre Subsystem
- **Repository:** `backend/app/repositories/lake_repository.py`
- **Data Model:** Normalized schema supporting official and alternative Kannada names, WGS84 coordinates, cadastral basin geometries (MultiPolygon), custodian authorities (BBMP Lakes Division, KLCDA, BDA, Karnataka Forest Department), administrative zones, and wards.
- **Geodetic Projections:** All spatial queries and surface calculations are transformed from WGS84 (`EPSG:4326`) into UTM Zone 43N (`EPSG:32643`) via `pyproj.Transformer`.

### B. Satellite Ingestion & Remote Sensing Subsystem
- **Sentinel-2 Service:** Supports Sentinel-2 Level-2A Bottom-of-Atmosphere (BOA) surface reflectance (Band 3 Green @ 560nm, Band 8 NIR @ 842nm).
- **Google Earth Engine Integration:** Configured in `backend/app/services/satellite/gee_client.py` with support for service-account JSON keys and graceful fallback when credentials are unconfigured.
- **JRC Global Surface Water:** Ingests long-term multi-decadal occurrence baselines (1984–2021) derived from Landsat 30m imagery.

### C. Automated Water Detection Engine
- **Mathematical Formula:** McFeeters Normalized Difference Water Index:
  $$\text{NDWI} = \frac{\text{Green} - \text{NIR}}{\text{Green} + \text{NIR}}$$
- **Preprocessing & Masking:** SCL cloud/shadow filtering + zero-division safety.
- **Noise Suppression:** 3×3 binary morphological filtering to eliminate speckle noise.
- **Vectorization:** Converts raster grids into georeferenced Shapely polygons, intersected and constrained by the lake cadastral reference basin.

### D. Change Detection & Seasonal Intelligence
- **Deltas:** Absolute area difference ($\Delta A = A_{new} - A_{old}$) and percentage change ($\frac{A_{old} - A_{new}}{A_{old}} \times 100$).
- **Differential Vector Layers:**
  - $\text{Stable Water} = W_{old} \cap W_{new}$
  - $\text{Lost Water} = W_{old} \setminus W_{new}$
  - $\text{Gained Water} = W_{new} \setminus W_{old}$
- **Seasonal Intelligence:** Normalizes comparisons against the Bengaluru hydro-meteorological cycle (Pre-Monsoon March–May, Southwest Monsoon June–September, Northeast Monsoon October–December).

### E. Scenario Simulation Subsystem (Restoration Lab)
- Models hypothetical restoration scenarios from 0% to 100% reclamation target.
- Interpolates outward from current detected water towards the official cadastral basin boundary.
- Enforces strict scientific disclaimers to prevent mistaking simulation for observed data.

---

## 3. Frontend Architecture
- **Framework:** React 18 + Vite + TypeScript
- **Geospatial Engine:** MapLibre GL JS with custom dark theme, Esri World Imagery global satellite tiles, and dynamic vector GeoJSON layers.
- **State Store:** Zustand (`frontend/src/stores/useAppStore.ts`) providing unified state for selected lakes, timeline ticks, comparison pairs, and layer toggles.
- **Styling:** Tailwind CSS with the official JALASHAYA color system (Deep Forest `#102B25`, Midnight `#101A20`, Deep Navy `#142D3B`, Water Blue `#168CC5`, Cyan `#47D4DF`, Forest Green `#329B71`, Warning Amber `#E6A84B`, Critical Red `#E05B54`).
