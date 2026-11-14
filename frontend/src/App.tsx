import React, { useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { GeospatialMap } from './maps/GeospatialMap';
import { Navbar } from './components/Navbar';
import { LakeExplorerPanel } from './features/lake-explorer/LakeExplorerPanel';
import { LakeTelemetryCard } from './features/digital-twin/LakeTelemetryCard';
import { TimelineController } from './features/timeline/TimelineController';
import { ComparisonStudioModal } from './features/comparison/ComparisonStudioModal';
import { RestorationLabModal } from './features/restoration/RestorationLabModal';
import { EvidenceReportModal } from './features/reports/EvidenceReportModal';
import { MethodologyView } from './features/methodology/MethodologyView';

export const App: React.FC = () => {
  const { fetchLakes, fetchHealth, isLoadingLakes } = useAppStore();

  useEffect(() => {
    fetchLakes();
    fetchHealth();
  }, [fetchLakes, fetchHealth]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#101A20]">
      {/* 1. Full-Screen Geospatial Environment (75-85% visual attention) */}
      <GeospatialMap />

      {/* 2. Top HUD Navigation */}
      <Navbar />

      {/* 3. Left Side Lake Explorer Drawer */}
      <LakeExplorerPanel />

      {/* 4. Right Side Lake Telemetry Panel */}
      <LakeTelemetryCard />

      {/* 5. Bottom Temporal Simulation Timeline Controller */}
      <TimelineController />

      {/* 6. Context Modals */}
      <ComparisonStudioModal />
      <RestorationLabModal />
      <EvidenceReportModal />
      <MethodologyView />

      {/* Subtle initial loading splash */}
      {isLoadingLakes && (
        <div className="absolute inset-0 z-50 bg-[#101A20] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#47D4DF] border-t-transparent animate-spin" />
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-widest text-white">JALASHAYA</h2>
            <p className="text-xs text-[#8D9A9A] font-mono mt-1">
              Initializing Bengaluru Digital Twin Geospatial Engine...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
