import { create } from 'zustand';
import {
  LakeSummary,
  LakeDetail,
  SatelliteObservation,
  ComparisonData,
  RestorationSimulation,
  MapLayerState,
  AppScreen
} from '../types';
import { api } from '../services/api';

interface AppStoreState {
  // Navigation & Screen
  activeScreen: AppScreen;
  setActiveScreen: (screen: AppScreen) => void;

  // Lakes
  lakes: LakeSummary[];
  selectedLakeId: string | null;
  selectedLake: LakeDetail | null;
  searchQuery: string;
  selectedZone: string | null;
  isLoadingLakes: boolean;

  // Observations & Timeline
  observations: SatelliteObservation[];
  selectedObservationIndex: number;
  isLoadingObservations: boolean;

  // Active Map Layers
  layers: MapLayerState;
  toggleLayer: (layer: keyof MapLayerState) => void;

  // Camera Target
  cameraTarget: { center: [number, number]; zoom: number; pitch: number; bearing: number } | null;

  // Comparison Studio
  comparisonOlderId: string | null;
  comparisonNewerId: string | null;
  comparisonData: ComparisonData | null;
  isLoadingComparison: boolean;

  // Restoration Simulation Lab
  restorationTargetPct: number;
  restorationData: RestorationSimulation | null;
  isLoadingRestoration: boolean;

  // System Health / Transparency
  systemHealth: any | null;

  // UI Panels State
  isExplorerOpen: boolean;
  setIsExplorerOpen: (open: boolean) => void;
  isTelemetryOpen: boolean;
  setIsTelemetryOpen: (open: boolean) => void;
  isLayersOpen: boolean;
  setIsLayersOpen: (open: boolean) => void;

  // Modals
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;

  // Actions
  fetchLakes: () => Promise<void>;
  selectLake: (lakeId: string) => Promise<void>;
  setSelectedObservationIndex: (index: number) => void;
  setSearchQuery: (query: string) => void;
  setSelectedZone: (zone: string | null) => void;
  runComparison: (olderId?: string, newerId?: string) => Promise<void>;
  updateRestorationSlider: (pct: number) => Promise<void>;
  fetchHealth: () => Promise<void>;
  resetCameraToBengaluru: () => void;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  activeScreen: 'command-center',
  setActiveScreen: (screen) => set({ activeScreen: screen }),

  lakes: [],
  selectedLakeId: null,
  selectedLake: null,
  searchQuery: '',
  selectedZone: null,
  isLoadingLakes: false,

  observations: [],
  selectedObservationIndex: 0,
  isLoadingObservations: false,

  layers: {
    satellite: true,
    cadastralBoundary: true,
    detectedWater: true,
    lostWater: true,
    gainedWater: true,
    labels: true,
    terrain3D: true,
  },
  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),

  cameraTarget: null,

  comparisonOlderId: null,
  comparisonNewerId: null,
  comparisonData: null,
  isLoadingComparison: false,

  restorationTargetPct: 50,
  restorationData: null,
  isLoadingRestoration: false,

  isExplorerOpen: false,
  setIsExplorerOpen: (open) => set({ isExplorerOpen: open }),
  isTelemetryOpen: true,
  setIsTelemetryOpen: (open) => set({ isTelemetryOpen: open }),
  isLayersOpen: false,
  setIsLayersOpen: (open) => set({ isLayersOpen: open }),

  systemHealth: null,
  isReportModalOpen: false,
  setIsReportModalOpen: (open) => set({ isReportModalOpen: open }),

  fetchLakes: async () => {
    set({ isLoadingLakes: true });
    try {
      const lakes = await api.getLakes();
      set({ lakes, isLoadingLakes: false });
      // If none selected, default to Bellandur Lake as prime demonstration
      if (!get().selectedLakeId && lakes.length > 0) {
        const bellandur = lakes.find((l) => l.id === 'lake-bellandur') || lakes[0];
        get().selectLake(bellandur.id);
      }
    } catch (err) {
      console.error('Failed to load lakes', err);
      set({ isLoadingLakes: false });
    }
  },

  selectLake: async (lakeId: string) => {
    set({ selectedLakeId: lakeId, isLoadingObservations: true });
    try {
      const [lakeDetail, observations] = await Promise.all([
        api.getLake(lakeId),
        api.getObservations(lakeId),
      ]);

      const lastIdx = observations.length > 0 ? observations.length - 1 : 0;
      set({
        selectedLake: lakeDetail,
        observations,
        selectedObservationIndex: lastIdx,
        isLoadingObservations: false,
        cameraTarget: {
          center: [lakeDetail.longitude, lakeDetail.latitude],
          zoom: 14.2,
          pitch: 45,
          bearing: -10,
        },
      });

      // If at least 2 observations, precompute comparison
      if (observations.length >= 2) {
        const older = observations[0].id;
        const newer = observations[observations.length - 1].id;
        set({ comparisonOlderId: older, comparisonNewerId: newer });
        get().runComparison(older, newer);
      }
    } catch (err) {
      console.error('Failed to select lake', err);
      set({ isLoadingObservations: false });
    }
  },

  setSelectedObservationIndex: (index: number) => {
    set({ selectedObservationIndex: index });
    const { observations, selectedLakeId } = get();
    if (observations && observations.length >= 2 && selectedLakeId) {
      const baseline = observations[0].id;
      const current = observations[index]?.id;
      if (index === 0) {
        // At the earliest baseline observation (e.g. 2017), lake is at initial water spread (no encroachment)
        set({ comparisonData: null, comparisonOlderId: baseline, comparisonNewerId: baseline });
      } else if (current) {
        // Automatically compute & display what has been encroached / lost to human settlements up to this year
        get().runComparison(baseline, current);
      }
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedZone: (zone: string | null) => set({ selectedZone: zone }),

  runComparison: async (olderId?: string, newerId?: string) => {
    const { selectedLakeId, observations } = get();
    if (!selectedLakeId || observations.length < 2) return;

    const oldId = olderId || observations[0].id;
    const newId = newerId || observations[observations.length - 1].id;

    set({ isLoadingComparison: true, comparisonOlderId: oldId, comparisonNewerId: newId });
    try {
      const cmp = await api.compareObservations(selectedLakeId, oldId, newId);
      set({ comparisonData: cmp, isLoadingComparison: false });
    } catch (err) {
      console.error('Failed to run comparison', err);
      set({ isLoadingComparison: false });
    }
  },

  updateRestorationSlider: async (pct: number) => {
    set({ restorationTargetPct: pct });
    const { selectedLakeId } = get();
    if (!selectedLakeId) return;

    set({ isLoadingRestoration: true });
    try {
      const res = await api.simulateRestoration(selectedLakeId, pct);
      set({ restorationData: res, isLoadingRestoration: false });
    } catch (err) {
      console.error('Restoration simulation failed', err);
      set({ isLoadingRestoration: false });
    }
  },

  fetchHealth: async () => {
    try {
      const health = await api.getHealth();
      set({ systemHealth: health });
    } catch (e) {
      console.warn('Backend health check error', e);
    }
  },

  resetCameraToBengaluru: () => {
    set({
      selectedLakeId: null,
      selectedLake: null,
      cameraTarget: {
        center: [77.6200, 12.9800],
        zoom: 11.5,
        pitch: 35,
        bearing: 0,
      },
    });
  },
}));
