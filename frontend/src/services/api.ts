import {
  LakeSummary,
  LakeDetail,
  SatelliteObservation,
  ComparisonData,
  RestorationSimulation
} from '../types';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? '/api/v1'
    : 'http://localhost:8000/api/v1');

export const api = {
  async getLakes(search?: string, zone?: string): Promise<LakeSummary[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (zone) params.append('zone', zone);

    const response = await fetch(`${API_BASE_URL}/lakes?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch lake inventory');
    return response.json();
  },

  async getLake(lakeId: string): Promise<LakeDetail> {
    const response = await fetch(`${API_BASE_URL}/lakes/${lakeId}`);
    if (!response.ok) throw new Error(`Failed to fetch details for lake ${lakeId}`);
    return response.json();
  },

  async getObservations(lakeId: string): Promise<SatelliteObservation[]> {
    const response = await fetch(`${API_BASE_URL}/lakes/${lakeId}/observations`);
    if (!response.ok) throw new Error(`Failed to fetch observations for lake ${lakeId}`);
    return response.json();
  },

  async compareObservations(
    lakeId: string,
    olderObservationId: string,
    newerObservationId: string
  ): Promise<ComparisonData> {
    const response = await fetch(`${API_BASE_URL}/lakes/${lakeId}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lake_id: lakeId,
        older_observation_id: olderObservationId,
        newer_observation_id: newerObservationId
      })
    });
    if (!response.ok) throw new Error('Failed to compute observation comparison');
    return response.json();
  },

  async simulateRestoration(
    lakeId: string,
    restorationTargetPct: number,
    baseObservationId?: string
  ): Promise<RestorationSimulation> {
    const response = await fetch(`${API_BASE_URL}/lakes/${lakeId}/simulate-restoration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lake_id: lakeId,
        restoration_target_pct: restorationTargetPct,
        base_observation_id: baseObservationId
      })
    });
    if (!response.ok) throw new Error('Failed to run restoration simulation');
    return response.json();
  },

  async getHealth(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/system/health`);
    if (!response.ok) throw new Error('System health check failed');
    return response.json();
  },

  async getDataSources(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/data-sources`);
    if (!response.ok) throw new Error('Failed to fetch data sources');
    return response.json();
  },

  getReportHtmlUrl(lakeId: string, olderId?: string, newerId?: string): string {
    const params = new URLSearchParams();
    if (olderId) params.append('older_obs_id', olderId);
    if (newerId) params.append('newer_obs_id', newerId);
    return `${API_BASE_URL}/lakes/${lakeId}/report.html?${params.toString()}`;
  },

  getReportGeoJsonUrl(lakeId: string, olderId?: string, newerId?: string): string {
    const params = new URLSearchParams();
    if (olderId) params.append('older_obs_id', olderId);
    if (newerId) params.append('newer_obs_id', newerId);
    return `${API_BASE_URL}/lakes/${lakeId}/report.geojson?${params.toString()}`;
  },

  getCsvObservationsUrl(lakeId: string): string {
    return `${API_BASE_URL}/lakes/${lakeId}/observations.csv`;
  }
};
