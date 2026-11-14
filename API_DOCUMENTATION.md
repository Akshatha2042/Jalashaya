# JALASHAYA — REST API Documentation

Base URL: `http://localhost:8000/api/v1`

Interactive Swagger Documentation: `http://localhost:8000/docs`

---

## 1. Lakes & Inventory Endpoints

### `GET /lakes`
Retrieves the complete catalog of Bengaluru water bodies.
- **Query Parameters:**
  - `search` (optional, string): Search query matching official name, zone, or ward.
  - `zone` (optional, string): Filter by BBMP administrative zone (e.g., `Mahadevapura`, `Bommanahalli`, `Yelahanka`).
  - `min_area` (optional, float): Filter by minimum cadastral basin area in hectares.
- **Response:** Array of `LakeSummary` objects with risk status and observation count.

### `GET /lakes/{lake_id}`
Retrieves comprehensive details for a specific lake.
- **Path Parameters:**
  - `lake_id` (string): Unique lake identifier (e.g. `lake-bellandur`, `lake-varthur`).
- **Response:** `LakeDetail` object including cadastral boundary GeoJSON polygon, custodian, ward, and coordinates.

### `GET /lakes/{lake_id}/boundary`
Returns the standalone GeoJSON reference cadastral boundary for the lake basin.

### `GET /lakes/{lake_id}/observations`
Returns the chronological series of satellite observations for the lake, including observation dates, sensor IDs, cloud cover percentages, and detected water boundary polygons.

### `GET /lakes/{lake_id}/jrc-profile`
Retrieves European Commission Joint Research Centre (JRC) Global Surface Water multi-decadal historical profile (1984–2021).

---

## 2. Comparison & Change Detection Endpoints

### `POST /lakes/{lake_id}/compare`
Computes geospatial and mathematical change between two satellite passes.
- **Request Body:**
  ```json
  {
    "lake_id": "lake-bellandur",
    "older_observation_id": "obs-bellandur-2017",
    "newer_observation_id": "obs-bellandur-2024"
  }
  ```
- **Response:**
  - `area_old_hectares`: Detected water extent in older pass.
  - `area_new_hectares`: Detected water extent in newer pass.
  - `area_change_hectares`: Absolute delta ($\Delta A = A_{new} - A_{old}$).
  - `change_percentage`: Percentage change.
  - `change_classification`: `Stable Water Extent`, `Persistent Decline`, `Seasonal Fluctuation`, `Water Area Gain`.
  - `stable_water_geometry`: GeoJSON polygon of retained water.
  - `lost_water_geometry`: GeoJSON polygon of lost water.
  - `gained_water_geometry`: GeoJSON polygon of newly detected water.
  - `seasonal_context`: Hydro-climatic analysis.

---

## 3. Scenario Simulation Endpoints

### `POST /lakes/{lake_id}/simulate-restoration`
Runs the **What-If: Lake Restoration Lab** scenario.
- **Request Body:**
  ```json
  {
    "lake_id": "lake-bellandur",
    "restoration_target_pct": 50.0
  }
  ```
- **Response:**
  - `simulated_water_area_hectares`: Hypothetical surface water area.
  - `area_delta_hectares`: Net water area gained under scenario.
  - `simulated_geometry`: GeoJSON polygon of simulated extent.
  - `is_hypothetical`: `true`.
  - `disclaimer`: Strict scientific safeguard text.

---

## 4. Reports & Data Export Endpoints

### `GET /lakes/{lake_id}/report.html`
Generates a standalone, printable HTML change verification report.

### `GET /lakes/{lake_id}/report.geojson`
Downloads the spatial differential vector layers (`stable_water`, `lost_water`, `gained_water`) as a standard GeoJSON FeatureCollection.

### `GET /lakes/{lake_id}/observations.csv`
Downloads the time series of satellite observations, cloud coverage, and detected water areas as a CSV file.

---

## 5. System Health & Transparency Endpoints

### `GET /system/health`
Returns system status, active database dialect (PostgreSQL+PostGIS or SQLite Spatial Engine), and live connectivity for Google Earth Engine, Sentinel Hub, OSM Overpass, and JRC Surface Water.

### `GET /data-sources`
Returns official descriptions, organizations, and citations for all integrated datasets.
