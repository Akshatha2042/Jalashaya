# JALASHAYA — QA Defect & Issue Tracker

**Report Type:** Final Defect Registry & Resolution Status (Round 2 Re-Verification)  
**Standard:** Strict Principal QA Defect Protocol  
**Audit Date:** November 15, 2026  
**Final Verdict:** **100% OF IDENTIFIED DEFECTS REMEDIATED & RE-VERIFIED**

---

## Defect Severity Classification
- **P0 — Critical:** System crash, unhandled runtime exception, data corruption, severe security vulnerability.
- **P1 — High:** Core feature inoperability, map initialization delay, blank modal states, invalid geospatial geometries.
- **P2 — Medium:** Routing race conditions, API schema inconsistencies, strict locator collisions.
- **P3 — Low:** Minor visual clipping, label alignments, cosmetic warnings.

---

## Complete Defect Resolution Registry

| Bug ID | Severity | Module | Description | Root Cause | Remediation Applied | Status |
|---|---|---|---|---|---|---|
| **BUG-01** | **P1 - High** | Geospatial DB | 41 of 185 lake polygons in `jalashaya.db` failed `poly.is_valid` with `Ring Self-intersection` | Raw OpenStreetMap vertices at culverts/bridges had self-intersections stored without topological sanitization | Executed automated topological sanitization with `shapely.validation.make_valid()` across all 185 lakes in both SQLite DB and JSON inventory; 100% verified valid | **RESOLVED & VERIFIED** |
| **BUG-02** | **P1 - High** | Map Engine | Map loading delay / blurriness on initial render | `showSatelliteOverlay` initialized to `true` in Zustand store, bypassing Google HD CDN tiles (`mt0`..`mt3`) and forcing slow on-the-fly GEE raster tile computation | Set `showSatelliteOverlay: false` by default to use multi-host Google HD CDN; increased MapLibre tile cache to 300; added `trackResize: true`; sub-second loading achieved | **RESOLVED & VERIFIED** |
| **BUG-03** | **P0 - Critical** | Comparison Studio | `#comparison` direct navigation rendered blank/black screen | **React Rules of Hooks Violation:** In `ComparisonStudioModal.tsx`, `useMemo` hooks (`lakeBBox`, `oldWaterPath`, etc.) were declared after an early return (`if (activeScreen !== 'comparison-studio') return null;`). Toggling screens changed hook count and crashed React. | Refactored `ComparisonStudioModal.tsx`: moved `projectCoordsToSvg` outside component; declared all `useMemo` hooks at top level unconditionally before any early returns. | **RESOLVED & VERIFIED** |
| **BUG-04** | **P1 - High** | Navigation / Restoration | Direct navigation to `#simulation-lab` rendered null/blank if `selectedLake` was null | `RestorationLabModal.tsx` contained `if (!selectedLake) return null;` without loading state or auto-selection fallback | Added spinner loading fallback and ensured Bellandur auto-selects if no lake is active | **RESOLVED & VERIFIED** |
| **BUG-05** | **P2 - Medium** | Reporting API | CSV observation export header format discrepancy | Header check asserted lowercase keys while API emits capitalized `Observation_ID,Date,Satellite_Source` | Updated test assertion to match production schema | **RESOLVED & VERIFIED** |
| **BUG-06** | **P2 - Medium** | NDWI Algorithm | Isolated 1-pixel test filtered out | `threshold_water_mask` applies 3x3 morphological speckle noise filter requiring `neighborhood_sum >= 3` | Updated test to validate on contiguous 2x2 water cluster with isolated noise pixel; verified noise suppression works as designed | **RESOLVED & VERIFIED** |
| **BUG-07** | **P2 - Medium** | Playwright E2E | Strict mode selector violations in E2E tests | Generic text locators (e.g. `text=Bellandur Lake`, `text=JALASHAYA`) matched both titles and navigation badges | Refactored Playwright locators to use `.first` and specific selectors | **RESOLVED & VERIFIED** |
