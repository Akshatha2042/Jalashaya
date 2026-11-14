import React from 'react';
import { X, Sliders, ArrowDownRight, ArrowUpRight, Calendar, AlertCircle, FileText } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 bg-[#101A20]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101A20] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#47D4DF]" />
            <div>
              <h3 className="text-base font-bold text-white">Historical Comparison Studio</h3>
              <p className="text-xs text-[#8D9A9A]">
                Multi-temporal satellite water-boundary differential analysis — {selectedLake.official_name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveScreen('command-center')}
            className="text-[#8D9A9A] hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector Row */}
        <div className="p-4 bg-[#142D3B]/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#8D9A9A] block mb-1">
                Baseline (Historical Pass)
              </label>
              <select
                value={comparisonOlderId || ''}
                onChange={(e) => runComparison(e.target.value, comparisonNewerId || undefined)}
                className="bg-[#101A20] border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#47D4DF]"
              >
                {observations.map((obs) => (
                  <option key={obs.id} value={obs.id}>
                    {obs.observation_date} ({obs.satellite_source})
                  </option>
                ))}
              </select>
            </div>

            <span className="text-[#8D9A9A] mt-5">→</span>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#8D9A9A] block mb-1">
                Comparison (Recent Pass)
              </label>
              <select
                value={comparisonNewerId || ''}
                onChange={(e) => runComparison(comparisonOlderId || undefined, e.target.value)}
                className="bg-[#101A20] border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#47D4DF]"
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
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center space-x-1.5 bg-[#168CC5] hover:bg-[#168CC5]/80 text-white px-3.5 py-2 rounded-lg text-xs font-medium shadow-water-glow transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Official Change Report</span>
          </button>
        </div>

        {/* Comparison Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {comparisonData ? (
            <>
              {/* Metric Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-4">
                  <span className="text-[10px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                    Historical Extent ({comparisonData.older_date})
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {comparisonData.area_old_hectares.toFixed(1)}{' '}
                    <span className="text-xs text-[#8D9A9A]">ha</span>
                  </div>
                  <span className="text-[10px] text-[#8D9A9A] mt-0.5 block">Baseline coverage</span>
                </div>

                <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-4">
                  <span className="text-[10px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                    Recent Extent ({comparisonData.newer_date})
                  </span>
                  <div className="text-2xl font-bold font-mono text-[#47D4DF] mt-1">
                    {comparisonData.area_new_hectares.toFixed(1)}{' '}
                    <span className="text-xs text-[#8D9A9A]">ha</span>
                  </div>
                  <span className="text-[10px] text-[#8D9A9A] mt-0.5 block">Observed contemporary</span>
                </div>

                <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-4">
                  <span className="text-[10px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                    Net Area Delta (ΔA)
                  </span>
                  <div
                    className={`text-2xl font-bold font-mono mt-1 ${
                      comparisonData.is_gain ? 'text-[#329B71]' : 'text-[#E05B54]'
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

                <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-4">
                  <span className="text-[10px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                    Scientific Classification
                  </span>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase ${
                        comparisonData.is_gain
                          ? 'bg-[#329B71]/20 text-[#329B71] border border-[#329B71]/30'
                          : 'bg-[#E05B54]/20 text-[#E05B54] border border-[#E05B54]/30'
                      }`}
                    >
                      {comparisonData.change_classification}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8D9A9A] mt-1.5 block">
                    {comparisonData.seasonal_context?.is_same_season_comparison
                      ? 'Consistent seasonal window'
                      : 'Seasonal gap detected'}
                  </span>
                </div>
              </div>

              {/* Spatial Difference Layer Legend */}
              <div className="bg-[#102B25]/30 border border-[#329B71]/20 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#47D4DF]">
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
                    <span className="w-3.5 h-3.5 rounded bg-[#E05B54]" />
                    <div>
                      <span className="text-white font-medium block">Lost Water Extent</span>
                      <span className="text-[10px] text-[#8D9A9A]">Desiccated or non-water in recent pass</span>
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

              {/* Hydro-Climatic Seasonal Intelligence Context */}
              <div className="bg-[#142D3B]/30 border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-[#47D4DF] font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Hydro-Meteorological & Seasonal Intelligence</span>
                </div>
                <p className="text-xs text-[#8D9A9A] leading-relaxed">
                  {comparisonData.seasonal_context?.scientific_interpretation}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8D9A9A] pt-2 border-t border-white/5">
                  <div>
                    <span className="text-white font-medium">Historical Season: </span>
                    {comparisonData.seasonal_context?.older_observation_season}
                  </div>
                  <div>
                    <span className="text-white font-medium">Recent Season: </span>
                    {comparisonData.seasonal_context?.newer_observation_season}
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
