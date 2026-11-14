import React from 'react';
import {
  X,
  Sliders,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const ComparisonStudioModal: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    selectedLake,
    observations,
    comparisonOlderId,
    comparisonNewerId,
    comparisonData,
    runComparison,
    setIsReportModalOpen
  } = useAppStore();

  if (activeScreen !== 'comparison-studio' || !selectedLake) return null;

  const olderObs = observations.find((o) => o.id === comparisonOlderId) || observations[0];
  const newerObs = observations.find((o) => o.id === comparisonNewerId) || observations[observations.length - 1];

  const oldYear = olderObs ? olderObs.observation_date.split('-')[0] : '2017';
  const newYear = newerObs ? newerObs.observation_date.split('-')[0] : '2024';

  const isShrinking = comparisonData && comparisonData.area_change_hectares < 0 && Math.abs(comparisonData.change_percentage) >= 20.0;

  return (
    <div className="fixed inset-0 z-50 bg-[#101A20]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101A20] border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#168CC5]/20 text-[#47D4DF]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Side-by-Side Satellite Comparison Studio</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#168CC5]/20 text-[#47D4DF] border border-[#168CC5]/30">
                  {selectedLake.official_name}
                </span>
              </div>
              <p className="text-xs text-[#8D9A9A]">
                Multi-temporal satellite imagery & surface area differential watch
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveScreen('command-center')}
            className="text-[#8D9A9A] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector Row */}
        <div className="p-3.5 bg-[#142D3B]/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#8D9A9A] block mb-1">
                Baseline (Year 1)
              </label>
              <select
                value={comparisonOlderId || ''}
                onChange={(e) => runComparison(e.target.value, comparisonNewerId || undefined)}
                className="bg-[#101A20] border border-white/15 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#47D4DF]"
              >
                {observations.map((obs) => (
                  <option key={obs.id} value={obs.id}>
                    {obs.observation_date} ({obs.satellite_source})
                  </option>
                ))}
              </select>
            </div>

            <span className="text-[#8D9A9A] mt-5 font-bold">vs</span>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#8D9A9A] block mb-1">
                Comparison (Year 2)
              </label>
              <select
                value={comparisonNewerId || ''}
                onChange={(e) => runComparison(comparisonOlderId || undefined, e.target.value)}
                className="bg-[#101A20] border border-white/15 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#47D4DF]"
              >
                {observations.map((obs) => (
                  <option key={obs.id} value={obs.id}>
                    {obs.observation_date} ({obs.satellite_source})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action to report */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setActiveScreen('command-center');
                useAppStore.getState().setIsSwipeMode(true);
              }}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Interactive Swipe Curtain</span>
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center space-x-1.5 bg-[#168CC5] hover:bg-[#168CC5]/80 text-white px-3.5 py-2 rounded-lg text-xs font-medium shadow-water-glow transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Official Compliance Report</span>
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Core Feature 4: Side-by-side images from two years */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Year 1 Satellite View Card */}
            <div className="bg-[#142D3B]/40 border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#168CC5]" />
                  <span className="font-bold text-sm text-white">
                    {oldYear} Baseline Satellite Image
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#47D4DF] bg-[#168CC5]/20 px-2 py-0.5 rounded">
                  {olderObs?.observation_date}
                </span>
              </div>

              {/* Satellite Frame Representation */}
              <div className="relative h-44 rounded-xl overflow-hidden border border-white/10 bg-[#0B1216] flex items-center justify-center">
                {/* Background Imagery Representation with Satellite Coordinates */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#102B25]/60 via-[#142D3B]/80 to-[#0F1E26] flex flex-col items-center justify-center text-center p-4">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#47D4DF]/60 bg-[#168CC5]/30 flex items-center justify-center shadow-water-glow animate-pulse">
                    <span className="text-xs font-mono text-white font-bold">
                      {comparisonData ? comparisonData.area_old_hectares.toFixed(1) : olderObs?.detected_area_hectares} ha
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8D9A9A] mt-2 font-mono">
                    Sentinel-2 MSI Level-2A • 10m Ground Resolution
                  </span>
                </div>

                <div className="absolute top-2 left-2 text-[9px] font-mono text-[#34D399] bg-[#10B981]/20 border border-[#10B981]/40 px-2 py-0.5 rounded-full">
                  ✓ Full Water Spread (Pre-Encroachment)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-[#8D9A9A] block">Water Surface</span>
                  <span className="font-mono font-bold text-white">
                    {comparisonData ? comparisonData.area_old_hectares.toFixed(1) : olderObs?.detected_area_hectares} ha
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8D9A9A] block">Sensor / Source</span>
                  <span className="text-white text-[11px] truncate block">
                    {olderObs?.satellite_source || 'Sentinel-2A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Year 2 Satellite View Card */}
            <div className="bg-[#142D3B]/40 border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
                  <span className="font-bold text-sm text-white">
                    {newYear} Contemporary Satellite Image
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#F87171] bg-[#EF4444]/20 px-2 py-0.5 rounded">
                  {newerObs?.observation_date}
                </span>
              </div>

              {/* Satellite Frame Representation */}
              <div className="relative h-44 rounded-xl overflow-hidden border border-white/10 bg-[#0B1216] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2D1414]/60 via-[#142D3B]/80 to-[#0F1E26] flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 rounded-full border-2 border-[#168CC5] bg-[#168CC5]/40 flex items-center justify-center">
                    <span className="text-[11px] font-mono text-white font-bold">
                      {comparisonData ? comparisonData.area_new_hectares.toFixed(1) : newerObs?.detected_area_hectares} ha
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8D9A9A] mt-2 font-mono">
                    Sentinel-2 MSI Level-2A • Multi-Spectral NDWI
                  </span>
                </div>

                {isShrinking ? (
                  <div className="absolute top-2 left-2 text-[9px] font-mono text-[#F87171] bg-[#EF4444]/30 border border-[#EF4444]/60 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 animate-pulse">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>⚠️ SHRINKING ALERT (Automatic Flag)</span>
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 text-[9px] font-mono text-[#34D399] bg-[#10B981]/20 border border-[#10B981]/40 px-2 py-0.5 rounded-full">
                    ✓ Stable Boundary
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-[#8D9A9A] block">Water Surface</span>
                  <span className="font-mono font-bold text-[#47D4DF]">
                    {comparisonData ? comparisonData.area_new_hectares.toFixed(1) : newerObs?.detected_area_hectares} ha
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8D9A9A] block">Net Change</span>
                  <span className={`font-mono font-bold ${comparisonData?.is_gain ? 'text-[#329B71]' : 'text-[#EF4444]'}`}>
                    {comparisonData ? `${comparisonData.area_change_hectares.toFixed(1)} ha (${comparisonData.change_percentage.toFixed(1)}%)` : '0 ha'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {comparisonData ? (
            <>
              {/* Metric Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-3">
                  <span className="text-[9px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                    Historical Extent ({comparisonData.older_date})
                  </span>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {comparisonData.area_old_hectares.toFixed(1)}{' '}
                    <span className="text-xs text-[#8D9A9A]">ha</span>
                  </div>
                  <span className="text-[10px] text-[#8D9A9A] mt-0.5 block">Baseline coverage</span>
                </div>

                <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-3">
                  <span className="text-[9px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                    Recent Extent ({comparisonData.newer_date})
                  </span>
                  <div className="text-xl font-bold font-mono text-[#47D4DF] mt-1">
                    {comparisonData.area_new_hectares.toFixed(1)}{' '}
                    <span className="text-xs text-[#8D9A9A]">ha</span>
                  </div>
                  <span className="text-[10px] text-[#8D9A9A] mt-0.5 block">Observed contemporary</span>
                </div>

                <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-3">
                  <span className="text-[9px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                    Net Area Delta (ΔA)
                  </span>
                  <div
                    className={`text-xl font-bold font-mono mt-1 ${
                      comparisonData.is_gain ? 'text-[#329B71]' : 'text-[#EF4444]'
                    }`}
                  >
                    {comparisonData.area_change_hectares > 0 ? '+' : ''}
                    {comparisonData.area_change_hectares.toFixed(1)}{' '}
                    <span className="text-xs text-[#8D9A9A]">ha</span>
                  </div>
                  <span className="text-[10px] text-[#8D9A9A] mt-0.5 block font-mono">
                    {comparisonData.change_percentage.toFixed(1)}% {comparisonData.is_gain ? 'gain' : 'loss'}
                  </span>
                </div>

                <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-3">
                  <span className="text-[9px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                    Scientific Classification
                  </span>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase ${
                        comparisonData.is_gain
                          ? 'bg-[#329B71]/20 text-[#329B71] border border-[#329B71]/30'
                          : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                      }`}
                    >
                      {comparisonData.change_classification}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8D9A9A] mt-1 block">
                    {comparisonData.seasonal_context?.is_same_season_comparison
                      ? 'Consistent seasonal window'
                      : 'Seasonal gap detected'}
                  </span>
                </div>
              </div>

              {/* Spatial Difference Layer Legend */}
              <div className="bg-[#102B25]/30 border border-[#329B71]/20 rounded-xl p-3.5 space-y-2">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#47D4DF]">
                  Spatial Differential Vector Layers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg">
                    <span className="w-3.5 h-3.5 rounded bg-[#168CC5]" />
                    <div>
                      <span className="text-white font-medium block">Stable Water Core</span>
                      <span className="text-[10px] text-[#8D9A9A]">Retained in both observation dates</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg">
                    <span className="w-3.5 h-3.5 rounded bg-[#EF4444]" />
                    <div>
                      <span className="text-white font-medium block">Lost Water / Encroached</span>
                      <span className="text-[10px] text-[#8D9A9A]">Accommodated by roads and layouts</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg">
                    <span className="w-3.5 h-3.5 rounded bg-[#329B71]" />
                    <div>
                      <span className="text-white font-medium block">Newly Gained Water</span>
                      <span className="text-[10px] text-[#8D9A9A]">Expanded surface water coverage</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-[#8D9A9A]">
              Loading differential analysis...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
