# JALASHAYA

## Bengaluru Water Body Digital Twin & Satellite-Based Change Simulation

> **Tagline:** *Rewind the Past. Observe the Present. Understand the Change.*

[![Python 3.13](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-4.1-396BFC.svg)](https://maplibre.org/)
[![Sentinel-2](https://img.shields.io/badge/Sentinel--2-10m_MSI-003399.svg)](https://dataspace.copernicus.eu/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Product Overview

**JALASHAYA** is a simulation-first geospatial intelligence platform and digital twin of Bengaluru’s lakes and water bodies. Rather than presenting generic analytics charts, JALASHAYA combines **high-resolution satellite remote sensing**, **automated computational water boundary extraction (NDWI)**, **geodetic coordinate projections (UTM 43N)**, and **interactive temporal simulations** to observe how Bengaluru's lake ecosystems have changed over time.

---

## 2. Key Capabilities

1. **Interactive Full-Screen 3D Geospatial Digital Twin:**
   - Dark, refined geospatial interface designed for environmental intelligence.
   - High-resolution global satellite imagery overlaid with actual cadastral lake boundaries.
   - Smooth, cinematic 3D camera navigation to any water body across Bengaluru.

2. **Temporal Time-Travel Simulation:**
   - Interactive timeline moving across genuine Copernicus Sentinel-2 satellite passes.
   - Real-time boundary vector transitions driven by computational observations.
   - Live surface water area calculation (hectares) with zero invented data.

3. **Automated Water-Boundary Detection Engine:**
   - Implementation of the McFeeters Normalized Difference Water Index:
     $$\text{NDWI} = \frac{\text{Band 3 [Green]} - \text{Band 8 [NIR]}}{\text{Band 3 [Green]} + \text{Band 8 [NIR]}}$$
   - SCL cloud and shadow filtering with zero-division safety.
   - Morphological filtering to eliminate speckle noise.
   - Georeferenced vector polygon extraction constrained to the lake cadastral basin.

4. **Multi-Temporal Historical Comparison Studio:**
   - Compare any two historical satellite observations.
   - Compute absolute surface water delta ($\Delta A = A_{new} - A_{old}$) and percentage change.
   - Visualize spatial difference vectors: **Stable Water Core**, **Lost Water Extent**, and **Newly Gained Water**.
   - Incorporates Hydro-Climatic Seasonal Intelligence to normalize against dry and monsoon cycles.

5. **What-If: Lake Restoration Lab:**
   - Interactive scenario exploration tool with a 0% to 100% restoration target slider.
   - Mathematically models hypothetical basin reclamation towards the official reference boundary.
   - Enforces strict scientific disclaimers to clearly separate hypothetical simulation from satellite measurements.

6. **Traceable Scientific Report Generation:**
   - One-click generation of printable verification reports.
   - Downloadable vector difference layers in GeoJSON format.
   - Downloadable time-series observations in CSV format.

---

## 3. Comprehensive Documentation

| Document | Purpose |
| :--- | :--- |
| **[ARCHITECTURE.md](file:///c:/Users/PRAJWAL%20V%20L/OneDrive/Desktop/Jalashaya/ARCHITECTURE.md)** | Full architectural breakdown of frontend, backend, and processing subsystems. |
| **[ENVIRONMENT_SETUP.md](file:///c:/Users/PRAJWAL%20V%20L/OneDrive/Desktop/Jalashaya/ENVIRONMENT_SETUP.md)** | Environment variables, credentials instructions, and consolidated keys list. |
| **[METHODOLOGY.md](file:///c:/Users/PRAJWAL%20V%20L/OneDrive/Desktop/Jalashaya/METHODOLOGY.md)** | Mathematical formulation of NDWI, cloud masking, and geodetic UTM 43N projection. |
| **[DATA_SOURCES.md](file:///c:/Users/PRAJWAL%20V%20L/OneDrive/Desktop/Jalashaya/DATA_SOURCES.md)** | Data provenance from BBMP, KLCDA, ESA Copernicus, OSM, and JRC Surface Water. |
| **[API_DOCUMENTATION.md](file:///c:/Users/PRAJWAL%20V%20L/OneDrive/Desktop/Jalashaya/API_DOCUMENTATION.md)** | Complete REST API endpoints, schemas, and usage examples. |
| **[SIMULATION_GUIDE.md](file:///c:/Users/PRAJWAL%20V%20L/OneDrive/Desktop/Jalashaya/SIMULATION_GUIDE.md)** | Step-by-step walkthrough for evaluating the platform and presentation workflows. |
| **[TESTING.md](file:///c:/Users/PRAJWAL%20V%20L/OneDrive/Desktop/Jalashaya/TESTING.md)** | Instructions for running the automated backend test suite and frontend verification. |
| **[DEPLOYMENT.md](file:///c:/Users/PRAJWAL%20V%20L/OneDrive/Desktop/Jalashaya/DEPLOYMENT.md)** | Local development startup and Docker Compose multi-container deployment. |

---

## 4. Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ (Tested on Node.js 22)

### 1. Run the Backend Engine
```bash
# In the project root:
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- FastAPI server starts at: `http://localhost:8000`
- Interactive OpenAPI Swagger documentation: `http://localhost:8000/docs`

### 2. Run the Frontend Digital Twin
In a second terminal:
```bash
cd frontend
npm run dev
```
- Open `http://localhost:5173` in your browser.

### 3. Run Automated Tests
```bash
$env:PYTHONPATH="."
.\backend\venv\Scripts\pytest tests\test_backend.py -v
```

---

## 5. Scientific Integrity Safeguards
1. **Cadastral Basin $\neq$ Observed Water Extent:** A lake's legal boundary is distinct from its observed water surface. JALASHAYA tracks both separately.
2. **Zero Fictional Data:** All demonstration lakes (Bellandur, Varthur, Jakkur, Ulsoor, Sankey Tank, Hebbal, Agara, Kaikondrahalli, Madiwala, Nagavara) use genuine geographic coordinates, real cadastral boundaries, and actual Sentinel-2 observations.
3. **No Speculative Encroachment Claims:** Reductions in water extent are classified as surface desiccation, sediment accumulation, or seasonal drawdown—never as legal encroachment without cadastral survey verification.
