export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: any[];
}

export interface LakeSummary {
  id: string;
  official_name: string;
  alternative_names: string[];
  latitude: float;
  longitude: float;
  area_hectares: number;
  administrative_zone?: string;
  ward?: string;
  custodian?: string;
  data_source: string;
  geometry_confidence: number;
  observation_count: number;
  latest_observation_date?: string;
  has_historical_comparison: boolean;
  current_risk_status: 'Stable' | 'Moderate Decline' | 'Persistent Decline' | 'Water Gain' | 'Insufficient Data' | 'Observed';
  boundary_geometry?: GeoJSONGeometry;
  encroachment_status?: string;
  encroached_area_hectares?: number;
  encroachment_type?: string;
}

export type float = number;

export interface LakeDetail extends LakeSummary {
  boundary_geometry: GeoJSONGeometry;
  perimeter_meters?: number;
  source_identifier?: string;
  last_verified: string;
}

export interface SatelliteObservation {
  id: string;
  lake_id: string;
  observation_date: string;
  satellite_source: string;
  sensor: string;
  cloud_coverage_pct: number;
  valid_pixel_pct: number;
  tile_id?: string;
  preview_url?: string;
  detected_area_hectares?: number;
  water_extent_geometry?: GeoJSONGeometry;
  confidence_score?: number;
}

export interface ComparisonData {
  id: string;
  lake_id: string;
  lake_name: string;
  older_date: string;
  newer_date: string;
  satellite_source: string;
  area_old_hectares: number;
  area_new_hectares: number;
  area_change_hectares: number;
  change_percentage: number;
  change_classification: string;
  is_gain: boolean;
  stable_water_geometry?: GeoJSONGeometry;
  lost_water_geometry?: GeoJSONGeometry;
  gained_water_geometry?: GeoJSONGeometry;
  seasonal_context: {
    older_observation_season?: string;
    newer_observation_season?: string;
    is_same_season_comparison?: boolean;
    multi_year_baseline_gap_years?: number;
    scientific_interpretation?: string;
  };
  methodology: string;
  limitations: string;
}

export interface RestorationSimulation {
  lake_id: string;
  lake_name: string;
  restoration_target_pct: number;
  reference_basin_area_hectares: number;
  current_water_area_hectares: number;
  simulated_water_area_hectares: number;
  area_delta_hectares: number;
  simulated_geometry: GeoJSONGeometry;
  is_hypothetical: boolean;
  disclaimer: string;
}

export interface MapLayerState {
  satellite: boolean;
  cadastralBoundary: boolean;
  detectedWater: boolean;
  lostWater: boolean;
  gainedWater: boolean;
  labels: boolean;
  terrain3D: boolean;
}

export type AppScreen =
  | 'landing'
  | 'command-center'
  | 'lake-explorer'
  | 'comparison-studio'
  | 'restoration-lab'
  | 'methodology'
  | 'about';
