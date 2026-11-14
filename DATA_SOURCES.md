# JALASHAYA — Data Sources & Provenance Documentation

Every water body polygon, satellite observation, and area calculation in **JALASHAYA** is traceable to authoritative and scientific data sources.

---

## 1. Cadastral & Administrative Lake Inventories

### Bruhat Bengaluru Mahanagara Palike (BBMP) Lake Inventory
- **Authority:** BBMP Lakes Division & Karnataka Lake Conservation and Development Authority (KLCDA).
- **Coverage:** Lakes across all 8 BBMP zones (Mahadevapura, Bommanahalli, Yelahanka, East, West, South, Rajarajeshwari Nagara, Dasarahalli).
- **Attributes Ingested:** Official English and Kannada names, custodian authority (BBMP, BDA, Karnataka Forest Department, Minor Irrigation), cadastral basin area in hectares, revenue survey identifiers, and ward allocations.
- **Reference:** Government of Karnataka Lake Master Records & High Court of Karnataka Justice N.K. Patil Committee Report.

### OpenStreetMap (OSM) Water Body Layer
- **Source:** OpenStreetMap contributors (`natural=water`, `water=lake|reservoir|basin`, `waterway=riverbank`).
- **Endpoint:** Overpass API (`https://overpass-api.de/api/interpreter`).
- **Attribution:** © OpenStreetMap contributors under ODbL license.

---

## 2. Satellite Remote Sensing Imagery

### Copernicus Sentinel-2 Multi-Spectral Instrument (MSI)
- **Space Agency:** European Space Agency (ESA) / European Commission.
- **Product:** Level-2A Bottom-of-Atmosphere (BOA) Surface Reflectance.
- **Spatial Resolution:**
  - Band 3 (Green, 560 nm): **10 meters**
  - Band 8 (Near-Infrared, 842 nm): **10 meters**
  - Band 4 (Red, 665 nm): **10 meters**
  - Band 2 (Blue, 490 nm): **10 meters**
- **Temporal Resolution:** 5-day revisit frequency over Bengaluru.
- **Grid Tile IDs:** Tile `43PGP` (Bengaluru South/Central) and Tile `43PFP` (Bengaluru North).
- **Processing:** Scene Classification Layer (SCL) cloud and cloud-shadow mask suppression.

### Joint Research Centre (JRC) Global Surface Water (GSW)
- **Source:** European Commission Joint Research Centre (EC JRC).
- **Temporal Span:** 1984 – 2021 (38-year multi-decadal baseline).
- **Spatial Resolution:** 30 meters (Landsat 5 TM, Landsat 7 ETM+, Landsat 8 OLI).
- **Products Utilized:** Water Occurrence, Water Seasonality, and Decadal Water Change.
- **Scientific Citation:** Pekel, J.-F., Cottam, A., Gorelick, N. & Belward, A. S. *High-resolution mapping of global surface water and its long-term changes.* Nature 540, 418–422 (2016).

---

## 3. Coordinate Systems & Geodetic Projections

| Coordinate System | EPSG Code | Type | Usage |
| :--- | :--- | :--- | :--- |
| **WGS 84** | `EPSG:4326` | Geographic (Lat/Lon) | Geometry storage, GeoJSON API responses, MapLibre rendering |
| **UTM Zone 43N** | `EPSG:32643` | Projected (Meters) | Geodetic area calculation (hectares) and perimeter measurement (meters) |
