from typing import Dict, Any, Optional, Tuple
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import unary_union
from shapely.validation import make_valid
from backend.app.geospatial.crs import calculate_geodetic_area_hectares, clean_and_validate_geometry

class ChangeEngine:
    """
    Geospatial Water Extent Comparison Engine with Seasonal Intelligence.
    Computes rigorous surface area deltas and spatial difference polygons.
    """

    @staticmethod
    def get_season(month: int) -> str:
        """Determines Bengaluru hydro-meteorological season."""
        if month in [3, 4, 5]:
            return "Pre-Monsoon Dry (High Evaporation & Lowest Natural Water Tables)"
        elif month in [6, 7, 8, 9]:
            return "Southwest Monsoon (Primary Recharge & Peak Runoff Season)"
        elif month in [10, 11, 12]:
            return "Post-Monsoon / Northeast Monsoon (Secondary Recharge & High Levels)"
        else:
            return "Winter Stable (Moderate Levels)"

    @classmethod
    def compare_observations(
        cls,
        lake_name: str,
        lake_reference_boundary: Dict[str, Any],
        older_obs: Dict[str, Any],
        newer_obs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executes scientific comparison between two actual satellite observations.
        """
        area_old = float(older_obs.get("detected_area_hectares", 0.0))
        area_new = float(newer_obs.get("detected_area_hectares", 0.0))

        # Date parsing
        old_date_str = str(older_obs.get("observation_date"))
        new_date_str = str(newer_obs.get("observation_date"))
        old_month = int(old_date_str.split("-")[1])
        new_month = int(new_date_str.split("-")[1])
        old_year = int(old_date_str.split("-")[0])
        new_year = int(new_date_str.split("-")[0])

        old_season = cls.get_season(old_month)
        new_season = cls.get_season(new_month)

        # Delta calculations
        delta_area = round(area_new - area_old, 4)
        is_gain = delta_area > 0

        if area_old > 0:
            if is_gain:
                pct_change = round(((area_new - area_old) / area_old) * 100.0, 2)
            else:
                pct_change = round(((area_old - area_new) / area_old) * 100.0, 2)
        else:
            pct_change = 0.0

        # Spatial geometry difference
        geom_old_dict = older_obs.get("water_extent_geometry")
        geom_new_dict = newer_obs.get("water_extent_geometry")

        stable_geom = None
        lost_geom = None
        gained_geom = None

        if geom_old_dict and geom_new_dict:
            poly_old = shape(geom_old_dict)
            poly_new = shape(geom_new_dict)

            if not poly_old.is_valid:
                poly_old = make_valid(poly_old)
            if not poly_new.is_valid:
                poly_new = make_valid(poly_new)

            # Intersection: Stable retained water
            stable_poly = poly_old.intersection(poly_new)
            if not stable_poly.is_empty:
                stable_geom = mapping(make_valid(stable_poly))

            # Difference: Lost water (in old, not in new)
            lost_poly = poly_old.difference(poly_new)
            if not lost_poly.is_empty:
                lost_geom = mapping(make_valid(lost_poly))

            # Difference: Gained water (in new, not in old)
            gained_poly = poly_new.difference(poly_old)
            if not gained_poly.is_empty:
                gained_geom = mapping(make_valid(gained_poly))

        # Scientific classification considering seasonal intelligence
        year_gap = abs(new_year - old_year)
        same_season = (old_season == new_season) or (abs(old_month - new_month) <= 1)

        if abs(delta_area) < 1.0 or (area_old > 0 and (abs(delta_area) / area_old) < 0.05):
            classification = "Stable Water Extent"
        elif not is_gain and pct_change >= 20.0 and (year_gap >= 3 or same_season):
            classification = "Persistent Decline"
        elif not is_gain and not same_season and year_gap < 2:
            classification = "Seasonal Fluctuation"
        elif is_gain and pct_change >= 10.0:
            classification = "Water Area Gain"
        elif is_gain:
            classification = "Seasonal Inflow"
        else:
            classification = "Moderate Fluctuation"

        seasonal_context = {
            "older_observation_season": old_season,
            "newer_observation_season": new_season,
            "is_same_season_comparison": same_season,
            "multi_year_baseline_gap_years": year_gap,
            "scientific_interpretation": (
                f"Comparison between {old_date_str} ({old_season}) and {new_date_str} ({new_season}). "
                + ("Identical seasonal window minimizes precipitation bias." if same_season
                   else "Inter-seasonal variation may reflect natural climatic drawdown rather than permanent structural reduction.")
            )
        }

        return {
            "lake_name": lake_name,
            "older_date": old_date_str,
            "newer_date": new_date_str,
            "satellite_source": newer_obs.get("satellite_source", "Sentinel-2A"),
            "area_old_hectares": area_old,
            "area_new_hectares": area_new,
            "area_change_hectares": delta_area,
            "change_percentage": pct_change,
            "is_gain": is_gain,
            "change_classification": classification,
            "stable_water_geometry": stable_geom,
            "lost_water_geometry": lost_geom,
            "gained_water_geometry": gained_geom,
            "seasonal_context": seasonal_context
        }

change_engine = ChangeEngine()
