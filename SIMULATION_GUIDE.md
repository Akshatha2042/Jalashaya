# JALASHAYA — Simulation & Demonstration Guide

This guide describes how to experience the interactive simulation capabilities of **JALASHAYA**, particularly for evaluation and hackathon presentations.

---

## 1. The 10-Second First Impression

When JALASHAYA loads:
1. You are placed in a **dark, high-resolution 3D satellite visualization of Bengaluru**.
2. Fine cyan outlines trace actual water body cadastral boundaries across the metropolitan region.
3. The camera smoothly orbits into **Bellandur Lake** (Bengaluru's largest water body).
4. The floating right-hand HUD displays live multi-spectral telemetry:
   - **Observed Surface Water Extent (ha)** vs. **Cadastral Basin Extent (ha)**.
   - Sensor metadata: **Sentinel-2 MSI Level-2A**, cloud cover percentage, and UTM 43N geodetic grid coordinates.

---

## 2. Core Interactive Features

### Feature A: Temporal Time-Travel Simulation
- **Location:** The floating bottom timeline controller.
- **Action:** Click on chronological observation nodes (e.g. `2017` &rarr; `2019` &rarr; `2021` &rarr; `2023` &rarr; `2024`) or click **Play Simulation**.
- **What Happens:**
  1. The map updates without reloading.
  2. The detected water boundary dynamically transforms to match the satellite pass from that exact date.
  3. The detected area indicator updates in real-time.
  4. Notice the dramatic surface contraction of Bellandur Lake between 2017 (308.4 ha) and 2024 (194.2 ha), driven by desiltation and weed clearance operations.

---

### Feature B: Historical Comparison Studio
- **Access:** Click **Comparison** on the top navigation bar or the telemetry card.
- **Workflow:**
  1. Choose a baseline pass (e.g. `2017-02-15`).
  2. Choose a recent pass (e.g. `2024-03-05`).
  3. The engine automatically computes:
     - **$\Delta A$ Net Area Delta:** $-114.2$ ha ($-37.0\%$).
     - **Scientific Classification:** *Persistent Decline*.
     - **Spatial Difference Vector:**
       - *Stable Water Core* (Cyan/Blue)
       - *Lost Water Boundary* (Vivid Red)
       - *Newly Submerged Water* (Emerald Green)
     - **Hydro-Climatic Intelligence:** Validates that both observations occurred within the pre-monsoon dry season, confirming that the change is structural rather than an seasonal precipitation artifact.

---

### Feature C: What-If: Lake Restoration Lab
- **Access:** Click **Restoration Lab** in the navigation bar.
- **Workflow:**
  1. Drag the **Hypothetical Restoration Target** slider from `0%` to `100%`.
  2. Watch the green simulated water boundary expand smoothly outward toward the cadastral basin boundary.
  3. Inspect the live telemetry calculation:
     - At 50% target: Potential gain of $+83.5$ ha.
     - At 100% target: Reaches full 361.2 ha reference basin.
  4. Notice the prominent scientific guardrail watermark: *Hypothetical simulation — not an observed satellite measurement*.

---

### Feature D: Traceable Change Report Generation
- **Access:** Click **Change Report** on the navigation bar.
- **Capabilities:**
  1. **Print / Export PDF:** Generates a clean, formatted environmental intelligence report suitable for civil authorities, courts, or environmental trusts.
  2. **Download GeoJSON:** Exports the vector difference polygons (`stable_water`, `lost_water`, `gained_water`) for inspection in QGIS or ArcGIS.
  3. **Download CSV:** Exports the chronological observation time series and cloud percentages.

---

## 3. Recommended Demonstration Tour of Bengaluru Lakes

| Lake | Key Demonstration Angle |
| :--- | :--- |
| **Bellandur Lake** | Multi-year water surface contraction (308.4 ha &rarr; 194.2 ha) |
| **Varthur Lake** | Downstream catchment impact and major desilting changes (156.3 ha &rarr; 98.4 ha) |
| **Jakkur Lake** | Citizen-governed integrated wetland system with high water-level stability |
| **Ulsoor Lake** | Urban central lake with moderate seasonal variation |
| **Sankey Tank** | Engineered heritage tank demonstrating stable perennial water core |
