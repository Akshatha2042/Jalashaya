# JALASHAYA — Feature Page Test Matrix & Interaction Report

**Standard:** Multi-Screen Feature Verification Matrix  
**Test Suite:** Playwright Browser Suite & Functional Interaction Engine

---

## 1. Feature Page Matrix

### Feature 1: Clickable Water Body Map
- **Location:** Digital Twin (`#map`)
- **Interaction Tested:**
  - MapLibre GL 3D vector map loads with 185 lake polygons.
  - Hovering over a lake displays a pointer cursor and high-contrast boundary halo.
  - Clicking any lake triggers `selectLake(id)`, animates camera `flyTo()`, loads 6-epoch satellite observations, and opens the right telemetry card.
- **Result:** **PASSED**

### Feature 2: Area-Over-Time Trend Chart
- **Location:** `LakeTelemetryCard.tsx`
- **Interaction Tested:**
  - Multi-temporal SVG sparkline renders across 2017, 2019, 2021, 2023, 2024, and 2026.
  - Clicking any year dot marker updates `selectedObservationIndex` and recalculates detected water area in real-time.
  - Dynamic readout shows baseline (2017) vs contemporary (2026) water spread.
- **Result:** **PASSED**

### Feature 3: Automatic Shrinkage Flag
- **Location:** `LakeTelemetryCard.tsx`, `LandingPage.tsx`, `ComparisonStudioModal.tsx`
- **Interaction Tested:**
  - Automatically identifies if surface water loss exceeds critical $\ge 20\%$ threshold.
  - Displays high-visibility badge: `⚠️ Shrinkage Flagged (-66.6%)` for Bellandur Lake.
  - Correctly tags pristine or rejuvenated lakes (e.g. Sankey Tank) with `✓ Intrusion-Free (Restored)`.
- **Result:** **PASSED**

### Feature 4: Side-by-Side Satellite Comparison Studio
- **Location:** `ComparisonStudioModal.tsx` (`#comparison`)
- **Interaction Tested:**
  - Dual synchronized inspection cards comparing Year 1 (Baseline) vs Year 2 (Contemporary).
  - Mode 1 (`Side-by-Side`): Independent zoom toggles (`1x`, `1.5x`, `2x`), pure photo vs water mask toggles.
  - Mode 2 (`Curtain Swipe`): In-modal draggable split-screen divider comparing 2017 vs 2026.
  - Dropdown lake selector switches between all 185 BBMP lakes dynamically.
  - Observation selector dropdowns recalculate $\Delta A$ and loss % instantaneously.
- **Result:** **PASSED**

### Feature 5: Hydrological Restoration Lab
- **Location:** `RestorationLabModal.tsx` (`#simulation-lab`)
- **Interaction Tested:**
  - Interactive slider controls hypothetical rejuvenation scenario from 10% to 100%.
  - Real-time estimation of reclaimed water surface area in hectares.
  - Calculation of annual groundwater recharge potential (million liters).
  - Financial budget estimate in INR ($\approx \text{₹}1.85 \text{ Lakhs/ha}$).
  - Strict scientific safeguard explicitly highlighting outputs as HYPOTHETICAL SIMULATIONS.
- **Result:** **PASSED**

### Feature 6: Civic Evidentiary Compliance Report
- **Location:** `EvidenceReportModal.tsx`
- **Interaction Tested:**
  - Generates official compliance audit document with statutory legal citations (KLCDA Act 2014, NGT O.A. No. 125/2017).
  - Embeds dynamic SVG maps of cadastral boundary and detected water extent.
  - Export buttons: Download HTML Report, Export GeoJSON FeatureCollection, Export CSV Observation Series.
- **Result:** **PASSED**

### Feature 7: Peer-Reviewed Methodology & Data Sources
- **Location:** `MethodologyView.tsx` (`#methodology`)
- **Interaction Tested:**
  - Explains McFeeters (1996) NDWI formulation, spectral bands (Sentinel-2 B3 Green and B8 NIR), and threshold criteria.
  - Details UTM Zone 43N planar geodetic projection mechanics (EPSG:32643).
  - Documents seasonal context awareness and legal buffer mandates (30m lake buffer, 50m primary storm-water drain).
- **Result:** **PASSED**

---

**Feature Page Test Verdict:** **100% OPERATIONAL**
