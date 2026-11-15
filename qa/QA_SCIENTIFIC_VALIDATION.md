# JALASHAYA — Scientific Validation & Change Calculation Audit

**Audit Date:** November 15, 2026  
**Auditor:** Principal QA & Scientific Validation Engineer  
**System Under Test:** McFeeters NDWI Index & Temporal Change Engine  

---

## 1. McFeeters NDWI Mathematical Validation

The Normalized Difference Water Index (McFeeters, 1996) is computed as:
$$\text{NDWI} = \frac{\rho_{\text{Green}} - \rho_{\text{NIR}}}{\rho_{\text{Green}} + \rho_{\text{NIR}}}$$
For Sentinel-2 Multi-Spectral Instrument:
$$\text{NDWI} = \frac{B_3 - B_8}{B_3 + B_8}$$

### Numerical Matrix Test:
A synthetic reflectance matrix was tested in `tests/test_qa_geospatial.py::test_ndwi_numerical_matrix`:
- **Water Pixel:** $\rho_{\text{Green}} = 0.40, \rho_{\text{NIR}} = 0.05 \implies \text{NDWI} = +0.7778 > 0$ (**Classified as Water**).
- **Vegetation Pixel:** $\rho_{\text{Green}} = 0.15, \rho_{\text{NIR}} = 0.50 \implies \text{NDWI} = -0.5385 < 0$ (**Classified as Non-Water**).
- **Zero-Denominator Singularity:** $\rho_{\text{Green}} = 0, \rho_{\text{NIR}} = 0 \implies \text{NDWI} = -1.0$ (Safe guarded default, no crash).
- **Morphological Noise Suppression:** $3 \times 3$ kernel requires $\ge 3$ neighborhood sum to eliminate isolated speckle false positives.

---

## 2. Area Change & Shrinkage Threshold Rules

$$\Delta A = A_{\text{new}} - A_{\text{old}}$$
$$\text{Loss } \% = \left(\frac{A_{\text{old}} - A_{\text{new}}}{A_{\text{old}}}\right) \times 100$$

### Shrinkage Qualification Threshold:
- If Loss $\% \ge 20.0\%$ over multi-year span: **Flagged as "Persistent Decline" (Critical Audit Alert)**.
- If Loss $\% < 20.0\%$: Classified as **"Moderate Fluctuation"** or **"Stable Water Extent"**.
- If Gain $\% \ge 10.0\%$: Classified as **"Water Area Gain" (Rejuvenation / Recovery)**.
- Verified via `test_mathematical_change_formulas` and `test_shrinkage_threshold_qualification_rule`: **PASSED**.

---

## 3. Seasonal Intelligence & Precipitation Windows

To eliminate false-positive shrinkage alerts caused by inter-monsoonal drydown:
- Observations from identical seasonal windows (e.g. February 2017 vs March 2026 pre-monsoon dry season) are flagged with high confidence.
- Inter-seasonal comparisons (e.g. February dry season vs October post-monsoon) generate an automatic caveat: `"Inter-seasonal variation may reflect natural climatic drawdown rather than permanent structural reduction."`
- Verified via `test_seasonal_context_awareness`: **PASSED**.

---

## 4. What-If Restoration Simulation Lab

- **Geometric Interpolation:** Models outward surface expansion from current water extent toward the cadastral basin boundary.
- **Physical Boundary Constraints:** Output geometry is strictly clipped to legal reference boundary ($\text{Area} \le A_{\text{cadastral}}$).
- **Mandatory Scientific Disclaimer:** All responses clearly label results as hypothetical scenario models, not measured satellite observations.
- Verified via `test_restoration_lab_mathematical_bounds`: **PASSED**.
