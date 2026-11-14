# JALASHAYA — Remote Sensing & Geospatial Methodology

## 1. Normalized Difference Water Index (NDWI) Computation

JALASHAYA employs the McFeeters (1996) Normalized Difference Water Index for automated water delineation from Sentinel-2 Multi-Spectral Instrument (MSI) observations:

$$\text{NDWI} = \frac{\rho_{\text{Green}} - \rho_{\text{NIR}}}{\rho_{\text{Green}} + \rho_{\text{NIR}}}$$

Where:
- $\rho_{\text{Green}}$ is Top-of-Canopy / Bottom-of-Atmosphere Reflectance in **Band 3** (Central wavelength: 560 nm, Bandwidth: 36 nm, Spatial resolution: 10m).
- $\rho_{\text{NIR}}$ is Reflectance in **Band 8** (Central wavelength: 842 nm, Bandwidth: 115 nm, Spatial resolution: 10m).

### Physical Principles:
1. Pure water strongly absorbs radiant energy in the Near-Infrared (NIR) spectrum while reflecting moderately in the visible green spectrum.
2. Terrestrial vegetation exhibits high NIR reflectance due to leaf mesophyll scattering, yielding negative NDWI values.
3. Bare soil and built-up concrete exhibit higher NIR than green reflectance, also producing negative values.
4. Open water surfaces exhibit positive NDWI values ($\text{NDWI} > 0.0$).

### Numerical Safety:
To prevent division-by-zero errors in shadow-obscured or sensor-saturated pixels where $\rho_{\text{Green}} + \rho_{\text{NIR}} = 0$, the backend evaluates:
$$\text{NDWI}(x, y) = \begin{cases} \frac{\rho_{\text{Green}}(x, y) - \rho_{\text{NIR}}(x, y)}{\rho_{\text{Green}}(x, y) + \rho_{\text{NIR}}(x, y)} & \text{if } \rho_{\text{Green}} + \rho_{\text{NIR}} > 0 \\ -1.0 & \text{otherwise} \end{cases}$$

---

## 2. Cloud Suppression & Morphological Filtering

1. **Cloud & Shadow Masking:** Pixels identified as cloud, thin cirrus, or cloud shadow by the Scene Classification Layer (SCL) are masked with value $-1.0$.
2. **Binary Water Thresholding:**
   $$M(x, y) = \begin{cases} 1 & \text{if } \text{NDWI}(x, y) > 0.0 \\ 0 & \text{otherwise} \end{cases}$$
3. **Morphological Noise Reduction:** A $3 \times 3$ binary opening operator (erosion followed by dilation) eliminates transient single-pixel speckle noise while preserving genuine canal and littoral boundary geometry.

---

## 3. Geodetic Projection & Boundary Extraction

1. **Vectorization:** Contiguous water pixel runs are vectorized into Shapely `Polygon` or `MultiPolygon` geometries.
2. **Basin Constraint:** Detected water vectors are clipped to the official cadastral lake basin boundary to prevent stray agricultural puddles from distorting lake measurements.
3. **Geodetic Coordinate Transformation:** Geometries are reprojected from WGS84 geographic degrees into **UTM Zone 43N (EPSG:32643)**:
   $$A = \iint_{\mathcal{P}} dx \, dy \quad [\text{m}^2]$$
   $$\text{Area}_{\text{hectares}} = \frac{A}{10,000}$$

---

## 4. Change Detection & Seasonal Intelligence

For any two observation dates $t_{\text{old}}$ and $t_{\text{new}}$:
- **Absolute Area Change:** $\Delta A = A(t_{\text{new}}) - A(t_{\text{old}})$
- **Percentage Change:** $\Delta \% = \left(\frac{A(t_{\text{old}}) - A(t_{\text{new}})}{A(t_{\text{old}})}\right) \times 100$
- **Spatial Vector Layers:**
  - $\text{Stable Water} = W_{\text{old}} \cap W_{\text{new}}$
  - $\text{Lost Water} = W_{\text{old}} \setminus W_{\text{new}}$
  - $\text{Gained Water} = W_{\text{new}} \setminus W_{\text{old}}$

### Seasonal Intelligence Rules:
- **Pre-Monsoon (March–May):** Natural evaporative drawdown and lowest annual water tables.
- **Southwest Monsoon (June–September):** Primary catchment recharge and maximum surface inflow.
- **Post-Monsoon (October–December):** Secondary recharge and peak reservoir storage.
- **Persistent Decline Rule:** A lake is only classified under *Persistent Decline* if water reduction exceeds 20% across multi-year comparisons evaluated during the *same hydro-climatic season* or spanning $\ge 3$ consecutive calendar years.
