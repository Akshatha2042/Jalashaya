import json
import csv
import io
from typing import Dict, Any, List

class ReportGenerator:
    """
    Evidence and Traceable Scientific Report Generator.
    Produces comprehensive documentation of satellite observations,
    water extent changes, mathematical calculations, and methodology.
    """

    @staticmethod
    def generate_geojson(comparison_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generates GeoJSON FeatureCollection containing reference, old, new, lost and gained layers."""
        features = []

        # Stable Water
        if comparison_data.get("stable_water_geometry"):
            features.append({
                "type": "Feature",
                "properties": {
                    "layer": "stable_water",
                    "description": "Surface water detected consistently in both historical and recent satellite passes",
                    "lake": comparison_data["lake_name"]
                },
                "geometry": comparison_data["stable_water_geometry"]
            })

        # Lost Water
        if comparison_data.get("lost_water_geometry"):
            features.append({
                "type": "Feature",
                "properties": {
                    "layer": "lost_water",
                    "description": "Surface water detected in historical pass but absent in recent pass",
                    "lake": comparison_data["lake_name"],
                    "area_loss_hectares": abs(comparison_data["area_change_hectares"])
                },
                "geometry": comparison_data["lost_water_geometry"]
            })

        # Gained Water
        if comparison_data.get("gained_water_geometry"):
            features.append({
                "type": "Feature",
                "properties": {
                    "layer": "gained_water",
                    "description": "Surface water newly detected in recent pass",
                    "lake": comparison_data["lake_name"]
                },
                "geometry": comparison_data["gained_water_geometry"]
            })

        return {
            "type": "FeatureCollection",
            "metadata": {
                "platform": "JALASHAYA Environmental Intelligence",
                "lake": comparison_data["lake_name"],
                "older_date": comparison_data["older_date"],
                "newer_date": comparison_data["newer_date"],
                "crs": "urn:ogc:def:crs:OGC:1.3:CRS84"
            },
            "features": features
        }

    @staticmethod
    def generate_csv(observations: List[Dict[str, Any]]) -> str:
        """Generates CSV time series of lake observations and detected areas."""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Observation_ID",
            "Date",
            "Satellite_Source",
            "Sensor",
            "Cloud_Coverage_Pct",
            "Valid_Pixel_Pct",
            "Detected_Water_Area_Hectares",
            "Confidence_Score"
        ])
        for obs in observations:
            writer.writerow([
                obs.get("id"),
                obs.get("observation_date"),
                obs.get("satellite_source"),
                obs.get("sensor"),
                obs.get("cloud_coverage_pct"),
                obs.get("valid_pixel_pct"),
                obs.get("detected_area_hectares"),
                obs.get("confidence_score")
            ])
        return output.getvalue()

    @staticmethod
    def generate_html_report(comparison: Dict[str, Any], lake_info: Dict[str, Any]) -> str:
        """Generates a standalone, printable scientific report in HTML format."""
        status_color = "#E05B54" if "Decline" in comparison["change_classification"] else "#329B71"
        return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>JALASHAYA Scientific Environmental Report — {comparison['lake_name']}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #1a202c; line-height: 1.6; }}
        .header {{ border-bottom: 3px solid #168CC5; padding-bottom: 20px; margin-bottom: 30px; }}
        .brand {{ font-size: 28px; font-weight: 800; color: #102B25; letter-spacing: -0.5px; }}
        .tagline {{ font-size: 13px; text-transform: uppercase; color: #168CC5; letter-spacing: 1.5px; font-weight: 600; }}
        .badge {{ display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: 700; font-size: 12px; text-transform: uppercase; background: {status_color}; color: white; }}
        .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }}
        .card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; }}
        .card h4 {{ margin-top: 0; color: #334155; font-size: 14px; text-transform: uppercase; }}
        .metric-value {{ font-size: 26px; font-weight: 700; color: #0f172a; margin: 5px 0; }}
        .section-title {{ font-size: 18px; font-weight: 700; color: #102B25; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 35px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }}
        th, td {{ border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }}
        th {{ background: #f1f5f9; font-weight: 600; color: #475569; }}
        .footer {{ margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #64748b; }}
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">JALASHAYA</div>
        <div class="tagline">Bengaluru Water Body Digital Twin & Satellite Change Detection</div>
        <h2>Lake Change Verification & Traceability Report</h2>
        <div>Target Water Body: <strong>{comparison['lake_name']}</strong> &nbsp;|&nbsp; Generated: 2026-11-14</div>
    </div>

    <div>
        <span class="badge">{comparison['change_classification']}</span>
    </div>

    <div class="grid">
        <div class="card">
            <h4>Historical Water Extent ({comparison['older_date']})</h4>
            <div class="metric-value">{comparison['area_old_hectares']} ha</div>
            <p>Sensor: Sentinel-2 MSI Multi-Spectral Reflection</p>
        </div>
        <div class="card">
            <h4>Recent Water Extent ({comparison['newer_date']})</h4>
            <div class="metric-value">{comparison['area_new_hectares']} ha</div>
            <p>Sensor: Sentinel-2 MSI Multi-Spectral Reflection</p>
        </div>
        <div class="card">
            <h4>Net Surface Water Delta</h4>
            <div class="metric-value" style="color: {status_color}">{comparison['area_change_hectares']} ha</div>
            <p>Net change: {comparison['change_percentage']}%</p>
        </div>
        <div class="card">
            <h4>Reference Cadastral Basin</h4>
            <div class="metric-value">{lake_info.get('area_hectares', 'N/A')} ha</div>
            <p>Custodian: {lake_info.get('custodian', 'BBMP / BDA')}</p>
        </div>
    </div>

    <h3 class="section-title">Hydro-Climatic & Seasonal Context</h3>
    <p><strong>Older Season:</strong> {comparison['seasonal_context'].get('older_observation_season', 'N/A')}</p>
    <p><strong>Recent Season:</strong> {comparison['seasonal_context'].get('newer_observation_season', 'N/A')}</p>
    <p>{comparison['seasonal_context'].get('scientific_interpretation', '')}</p>

    <h3 class="section-title">Scientific Methodology</h3>
    <p>Surface water detection is computed computationally using McFeeters Normalized Difference Water Index (NDWI):</p>
    <pre>NDWI = (Band 3 [Green, 560nm] - Band 8 [NIR, 842nm]) / (Band 3 + Band 8)</pre>
    <p>Filtered at NDWI &gt; 0.0 with cloud and cloud-shadow mask suppression. Area measurements are computed by projecting geometries into UTM Zone 43N (EPSG:32643) geodetic coordinates.</p>

    <h3 class="section-title">Scientific Limitations & Integrity Disclaimer</h3>
    <p>1. Optical satellite water detection reflects visible surface water cover at the time of overpass. It does NOT establish cadastral boundaries, land-use zoning, or legal ownership.</p>
    <p>2. Reductions in water extent may stem from normal evaporation, monsoon cycle variations, desiltation dredging, or seasonal reservoir management.</p>

    <div class="footer">
        JALASHAYA Environmental Intelligence Platform — Built with Copernicus Sentinel-2, BBMP Lakes Inventory, and PostGIS Geospatial Engine.
    </div>
</body>
</html>"""

report_generator = ReportGenerator()
