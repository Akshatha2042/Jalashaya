import React, { useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { GeospatialMap } from './maps/GeospatialMap';
import { Navbar } from './components/Navbar';
import { LeftMenuDrawer } from './features/navigation/LeftMenuDrawer';
import { LakeExplorerPanel } from './features/lake-explorer/LakeExplorerPanel';
import { LakeTelemetryCard } from './features/digital-twin/LakeTelemetryCard';
import { TimelineController } from './features/timeline/TimelineController';
import { ComparisonStudioModal } from './features/comparison/ComparisonStudioModal';
import { RestorationLabModal } from './features/restoration/RestorationLabModal';
import { EvidenceReportModal } from './features/reports/EvidenceReportModal';
import { MethodologyView } from './features/methodology/MethodologyView';
import { LandingPage } from './features/landing/LandingPage';

export const App: React.FC = () => {
  const { fetchLakes, fetchHealth, isLoadingLakes, activeScreen } = useAppStore();

  useEffect(() => {
    fetchLakes();
    fetchHealth();
  }, [fetchLakes, fetchHealth]);

  if (activeScreen === 'landing') {
    return <LandingPage />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100">
      {/* 1. Full-Screen Geospatial Environment */}
      <GeospatialMap />

      {/* 2. Top HUD Navigation (Light Mode) */}
      <Navbar />

      {/* 3. Three Dots Floating Menu on Left Hand Side (Dashboard Analysis & Simulation) */}
      <LeftMenuDrawer />

      {/* 4. Left Side Lake Explorer Drawer */}
      <LakeExplorerPanel />

      {/* 5. Right Side Lake Telemetry Panel */}
      <LakeTelemetryCard />

      {/* 6. Bottom Temporal Simulation Timeline Controller */}
      <TimelineController />

      {/* 7. Context Modals */}
      <ComparisonStudioModal />
      <RestorationLabModal />
      <EvidenceReportModal />
      <MethodologyView />

      {/* Subtle initial loading splash in Light Theme */}
      {isLoadingLakes && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-sky-600 border-t-transparent animate-spin" />
          <div className="text-center">
            <h2 className="text-xl font-extrabold tracking-widest text-slate-900">JALASHAYA</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Initializing Bengaluru Water Body Digital Twin...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
