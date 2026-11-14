from typing import Dict, Any, Optional
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import unary_union
from shapely.validation import make_valid
from backend.app.geospatial.crs import calculate_geodetic_area_hectares

class RestorationLab:
    """
    Scenario Exploration Engine: What-If Lake Restoration Lab.
    Mathematically models hypothetical restored water extents toward the reference cadastral basin.
    STRICT SCIENTIFIC SAFEGUARD: Clearly marks all outputs as hypothetical simulations.
    """

    @classmethod
    def simulate_restoration(
        cls,
        lake_name: str,
        lake_reference_boundary: Dict[str, Any],
        current_water_geometry: Dict[str, Any],
        current_water_area: float,
        restoration_target_pct: float  # 0.0 to 100.0%
    ) -> Dict[str, Any]:
        """
        Generates hypothetical restored geometry based on restoration target percentage (0-100%).
        At 0%: returns current detected water extent.
        At 100%: returns the full reference lake basin boundary.
        At t%: geometrically interpolates outward from current water toward the reference basin.
        """
        basin_shp = shape(lake_reference_boundary)
        current_shp = shape(current_water_geometry)

        if not basin_shp.is_valid:
            basin_shp = make_valid(basin_shp)
        if not current_shp.is_valid:
            current_shp = make_valid(current_shp)

        basin_area = calculate_geodetic_area_hectares(basin_shp)
        fraction = max(0.0, min(100.0, restoration_target_pct)) / 100.0

        if fraction == 0.0:
            simulated_geom = mapping(current_shp)
            sim_area = current_water_area
        elif fraction >= 0.99:
            simulated_geom = mapping(basin_shp)
            sim_area = basin_area
        else:
            # Buffer outward from current water bounded by reference basin
            # Estimate buffer distance in degrees (~0.0001 deg is ~11 meters)
            max_dist_deg = 0.003 * fraction
            buffered = current_shp.buffer(max_dist_deg)
            # Clip strictly by the cadastral reference basin
            bounded_sim = buffered.intersection(basin_shp)
            # Ensure current water is always included
            unified = unary_union([current_shp, bounded_sim])
            if not unified.is_valid:
                unified = make_valid(unified)

            simulated_geom = mapping(unified)
            sim_area = calculate_geodetic_area_hectares(unified)

        area_delta = round(sim_area - current_water_area, 4)

        return {
            "lake_name": lake_name,
            "restoration_target_pct": restoration_target_pct,
            "reference_basin_area_hectares": basin_area,
            "current_water_area_hectares": current_water_area,
            "simulated_water_area_hectares": sim_area,
            "area_delta_hectares": area_delta,
            "simulated_geometry": simulated_geom,
            "is_hypothetical": True,
            "disclaimer": (
                "HYPOTHETICAL RESTORATION SCENARIO — Based on mathematical polygon interpolation "
                "towards cadastral reference boundary. NOT an observed satellite measurement. "
                "Does not account for bathymetry, sediment volume, or local hydrology."
            )
        }

restoration_lab = RestorationLab()
