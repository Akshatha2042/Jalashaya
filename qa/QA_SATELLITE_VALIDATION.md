# JALASHAYA — Satellite Data Integration & Provenance Report

**Audit Date:** November 15, 2026  
**Auditor:** Principal QA & Remote Sensing Validation Specialist  
**System Under Test:** Remote Sensing Providers & Optical Observation Pipeline  

---

## 1. Provider Connectivity & Health Status

Verification against `/api/v1/system/health`:

| Remote Sensing Provider | Auth Mechanism | Resolution | Revisit | Status |
|---|---|---|---|---|
| **Google Earth Engine (GEE)** | Service Account (`lofty-voyage-514704-s5`) | 10m (Sentinel-2) / 30m (Landsat) | 5 days | **OPERATIONAL** |
| **Sentinel-2 / Planet Hub** | Planet API Key (PLAK) | 10m (B3 Green, B8 NIR, B4 Red, B2 Blue) | 5 days | **OPERATIONAL** |
| **EC JRC Surface Water** | Open Public Cloud Distribution | 30m global raster | Annual | **OPERATIONAL** |
| **OpenStreetMap Overpass** | REST API (`overpass-api.de`) | Vector polygons | Live | **OPERATIONAL** |
| **Google Maps Hybrid CDN** | Parallel 4-Host Stream (`mt0..mt3`) | Sub-meter optical aerial | Current | **OPERATIONAL** |

---

## 2. Multi-Temporal Observation Verification

All 185 lakes feature complete multi-temporal observation sequences across 6 temporal benchmark years:
- **2017-02-15:** Sentinel-2A MSI BOA Pristine Baseline.
- **2019-03-10:** Sentinel-2A/B MSI Level-2A.
- **2021-02-28:** Sentinel-2B MSI Level-2A.
- **2023-01-20:** Sentinel-2A MSI Level-2A.
- **2024-03-05:** Sentinel-2B MSI Level-2A.
- **2026-03-15:** Sentinel-2C MSI Level-2A Contemporary Observation.

### Provenance Audit:
- **Band Selection:** Green = B3 (560 nm), NIR = B8 (842 nm), Red = B4 (665 nm), Blue = B2 (490 nm).
- **Atmospheric Correction:** Level-2A Bottom-Of-Atmosphere (BOA) surface reflectance.
- **Cloud Filtering:** Automated masking rejects any acquisition exceeding 20% cloud cover over the lake bounding box.
- Verified via `test_api_observations_and_timeline_order`: **PASSED**.
