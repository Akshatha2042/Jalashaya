# JALASHAYA — Master QA Test Plan & Validation Strategy

**Document ID:** QA-TP-2026-01  
**Target:** JALASHAYA — Bengaluru Water Body Digital Twin  
**QA Lead:** Principal QA Engineer & Geospatial Testing Specialist  
**Execution Paradigm:** Two-Round Rigorous Evaluation (Round 1: Zero-modification baseline audit; Round 2: P0-P3 defect remediation & re-verification)

---

## 1. Test Objectives & Scope
The objective is to strictly stress-test, validate, and verify the JALASHAYA platform against real-world civic, remote sensing, geospatial, performance, and security requirements. 

### In-Scope Modules:
1. **Repository Reconnaissance & Architecture Audit**: Static code analysis, dependencies, and configuration check.
2. **Build & Runtime Verification**: TypeScript strict compilation, Vite production bundling, FastAPI service lifespan, SQLite migration and seeding.
3. **End-to-End Functional Journey**: Landing page -> Interactive Map -> Lake Selection -> Observation Timeline -> Satellite Comparison Studio -> Restoration Simulation -> Evidence Report Generation.
4. **Geospatial & Map Engine Validation**: MapLibre GL 3D vector rendering, camera navigation, geodetic polygon coordinate closure, projection transformations (`EPSG:4326` -> `EPSG:32643`), and dual-satellite raster streaming.
5. **Satellite & Remote Sensing Provenance**: Multi-temporal observation authenticity (2017 to 2026), acquisition dates, tile providers (Google HD, Esri, GEE).
6. **Water Detection Engine & NDWI Algorithm**: McFeeters (1996) formula verification on synthetic rasters, zero-denominator handling, cloud/shadow masking, threshold sensitivity.
7. **Hydrological Change & Area Mathematics**: Planar geodetic area computations, delta area ($\Delta A$), percentage change calculations, shrinkage flagging threshold ($\ge 20\%$).
8. **Temporal Timeline & Simulation Synchrony**: Time-lapse playback, multi-epoch observation integrity, hypothetical restoration scenarios (10% - 100%).
9. **Scientific & Environmental Integrity**: Verification that seasonal water fluctuations are distinguished from permanent anthropogenic encroachments.
10. **Database & API Security/Performance**: REST API suite covering all CRUD operations, malformed payloads, SQL injection resilience, CORS limits, query timing, and memory footprints.
11. **UI/UX & Responsiveness**: Viewport verification across Desktop (1920x1080, 1440x900), Tablet (768x1024), and Mobile (390x844).
12. **Playwright Automated Browser Suite**: Automated browser tests capturing console errors, network failures, routing changes, and visual screenshots.

---

## 2. Test Environment & Tooling
- **Backend Runtime:** Python 3.13.3 (Windows x64), FastAPI 0.162.7, Uvicorn 0.54.0.
- **Frontend Runtime:** Node.js v20+, Vite 5.4.21, React 18.3.1, TypeScript 5.2.2.
- **Database:** SQLite 3 (`jalashaya.db`) with 185 lakes and 1,110 observations.
- **Testing Tools:**
  - `pytest` 9.2.0 + `httpx` / `requests` for backend unit, integration, and mathematical tests.
  - `playwright` 1.65.2 for headless/headed browser automation and visual capture.
  - Custom synthetic raster generators with `numpy` for NDWI numerical boundary tests.
  - Geodetic polygon validation scripts via `shapely` and `pyproj`.

---

## 3. Test Cases & Execution Matrix

| Test Suite | Priority | Focus Area | Pass Criteria |
|---|---|---|---|
| **TS-01: Build & Packaging** | P0 | Frontend build, TypeScript, Backend import | 0 compiler errors, 0 runtime launch warnings |
| **TS-02: API & Endpoints** | P0 | `/lakes`, `/observations`, `/compare`, `/simulate`, `/reports` | 200 OK for valid inputs, 404/422 for invalid, < 150ms latency |
| **TS-03: NDWI & Mathematics** | P0 | McFeeters formula, division-by-zero, area $\Delta$ | Zero NaN/Inf, exact hectare calculation in EPSG:32643 |
| **TS-04: Geospatial Precision** | P1 | Polygon closure, WGS84 coordinate boundaries | 100% closed polygons, valid coordinates inside Bengaluru bbox |
| **TS-05: Map Loading & Performance** | P1 | Initial map render, tile streaming, FPS | Clean load under 2.5s, no tile 404s, smooth pan/zoom |
| **TS-06: Navigation & Feature Routing** | P1 | Hash routing (`#audit`, `#comparison`, `#map`, etc.) | Direct URL hash navigation renders without blank state |
| **TS-07: Satellite & Timeline Sync** | P1 | 6 epochs (2017-2026), image & vector sync | Correct observation date, matching detected hectares |
| **TS-08: Side-by-Side Comparison** | P1 | Dual view & curtain swipe in comparison studio | Clear visual distinction, correct loss calculation |
| **TS-09: Security & Resilience** | P1 | SQL injection, API keys, CORS origins | No credential leaks, sanitized queries, restricted origins |
| **TS-10: Responsive UI/UX** | P2 | 1920x1080 down to 390x844 | No horizontal scroll breakage, legible text, accessible HUD |

---

## 4. Defect Categorization & Acceptance Thresholds
- **P0 (Critical):** Crash, data corruption, broken calculation, exposed security key. Must be 0 for sign-off.
- **P1 (High):** Core feature failure (e.g. map fails to load, routing breaks, comparison modal blank). Must be 0 for sign-off.
- **P2 (Medium):** Usability flaw, sluggish rendering, layout collision. Addressed in Round 2.
- **P3 (Low):** Minor styling or cosmetic polish.

---

## 5. Execution Workflow
1. **Round 1 (Baseline Testing)**: Run full test harness, capture all defects in `QA_BUG_TRACKER.md`.
2. **Analysis & Triage**: Identify root causes without destructive changes.
3. **Round 2 (Remediation & Re-Verification)**: Apply targeted, non-destructive fixes, re-run test suite, ensure 100% passing rate.
4. **Final Deliverables**: Generate complete documentation suite in `qa/`.
