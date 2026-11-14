import React, { useState } from 'react';
import {
  MapPin,
  Shield,
  Layers,
  Sliders,
  Sparkles,
  FileText,
  ChevronDown,
  X,
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const LakeTelemetryCard: React.FC = () => {
  const {
    selectedLake,
    observations,
    selectedObservationIndex,
    setSelectedObservationIndex,
    comparisonData,
    layers,
    toggleLayer,
    setActiveScreen,
    setIsReportModalOpen,
    isTelemetryOpen,
    setIsTelemetryOpen
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'metrics' | 'layers'>('metrics');

  if (!selectedLake) return null;

  const currentObservation = observations[selectedObservationIndex] || null;
  const detectedArea = currentObservation?.detected_area_hectares ?? 0;
  const cadastralArea = selectedLake.area_hectares;
  const coverageRatio = cadastralArea > 0 ? Math.min(100, Math.round((detectedArea / cadastralArea) * 100)) : 0;
  const isEncroached = (selectedLake.encroachment_status || '').toLowerCase().includes('encroached');

  // Core Requirement: Area-over-time chart data
  const trendPoints = observations.map((o) => ({
    year: o.observation_date.split('-')[0],
    date: o.observation_date,
    area: o.detected_area_hectares ?? 0
  }));

  const baselineArea = trendPoints.length > 0 ? trendPoints[0].area : cadastralArea;
  const currentArea = currentObservation?.detected_area_hectares ?? baselineArea;
  const shrinkPct = baselineArea > 0 ? ((baselineArea - currentArea) / baselineArea) * 100 : 0;

  // Core Requirement: Automatic flag when size drops past a set threshold (20% contraction threshold)
  const SHRINK_THRESHOLD_PCT = 20.0;
  const isShrinkingPastThreshold = shrinkPct >= SHRINK_THRESHOLD_PCT;

  // SVG Chart Geometry calculations
  const maxArea = Math.max(...trendPoints.map((p) => p.area), cadastralArea, 1);
  const chartWidth = 280;
  const chartHeight = 65;
  const padX = 16;
  const padY = 12;

  const coords = trendPoints.map((p, idx) => {
    const x = padX + (idx / Math.max(1, trendPoints.length - 1)) * (chartWidth - 2 * padX);
    const y = chartHeight - padY - (p.area / maxArea) * (chartHeight - 2 * padY);
    return { x, y, ...p };
  });

  const pathD = coords.reduce((acc, c, idx) => {
    return idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
  }, '');

  const areaD = coords.length > 0
    ? `${pathD} L ${coords[coords.length - 1].x} ${chartHeight - padY} L ${coords[0].x} ${chartHeight - padY} Z`
    : '';

  // 20% Threshold line
  const thresholdAreaVal = baselineArea * 0.8;
  const thresholdY = chartHeight - padY - (thresholdAreaVal / maxArea) * (chartHeight - 2 * padY);

  return (
    <aside className="absolute top-[62px] right-4 z-30 pointer-events-auto">
      {/* 1. Minimized Pill */}
      {!isTelemetryOpen ? (
        <button
          onClick={() => setIsTelemetryOpen(true)}
          className="flex items-center space-x-2.5 bg-[#101A20]/90 backdrop-blur-xl border border-white/10 hover:border-[#47D4DF]/40 px-3.5 py-2 rounded-xl shadow-2xl text-xs text-white transition-all group"
        >
          <Activity className="w-3.5 h-3.5 text-[#47D4DF] group-hover:scale-110 transition-transform" />
          <span className="font-medium text-[#F2F5F2]">{selectedLake.official_name}</span>
          <span className="font-mono text-[#47D4DF] font-bold">
            {detectedArea.toFixed(1)} ha
          </span>
          {isShrinkingPastThreshold && (
            <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" title="Shrinking Alert" />
          )}
          <ChevronDown className="w-3.5 h-3.5 text-[#8D9A9A]" />
        </button>
      ) : (
        /* 2. Compact Refined Glass HUD Card */
        <div className="w-88 bg-[#101A20]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200 max-h-[82vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-2.5">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {selectedLake.official_name}
                </h3>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] text-[#8D9A9A] mt-0.5">
                <span>{selectedLake.administrative_zone || 'Bengaluru'}</span>
                <span>•</span>
                <span className="truncate max-w-[140px]">{selectedLake.custodian || 'BBMP'}</span>
              </div>
            </div>

            <button
              onClick={() => setIsTelemetryOpen(false)}
              className="text-[#8D9A9A] hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-tabs: Metrics vs Layers */}
          <div className="flex items-center rounded-lg bg-white/5 p-0.5 text-[11px]">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'metrics' ? 'bg-[#168CC5] text-white shadow' : 'text-[#8D9A9A] hover:text-white'
              }`}
            >
              Telemetry & History
            </button>
            <button
              onClick={() => setActiveTab('layers')}
              className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'layers' ? 'bg-[#168CC5] text-white shadow' : 'text-[#8D9A9A] hover:text-white'
              }`}
            >
              Layers
            </button>
          </div>

          {/* Tab 1: Telemetry & Area-over-Time */}
          {activeTab === 'metrics' ? (
            <div className="space-y-3">
              {/* Core Requirement 3: Automatic Flag when size drops past threshold */}
              {isShrinkingPastThreshold ? (
                <div className="flex items-center space-x-2 bg-[#EF4444]/20 border border-[#EF4444]/50 p-2.5 rounded-xl text-xs text-[#F87171] animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#EF4444] animate-pulse" />
                  <div>
                    <span className="font-bold block text-[11px] uppercase tracking-wide">
                      ⚠️ Automatic Flag: Shrinking Past Threshold
                    </span>
                    <span className="text-[10px] text-white/90">
                      Water extent contracted by <span className="font-mono font-bold text-white">-{shrinkPct.toFixed(1)}%</span> from baseline (Threshold: 20%).
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-[#10B981]/15 border border-[#10B981]/40 p-2 rounded-xl text-[10.5px] text-[#34D399]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#10B981]" />
                  <span>Stable Water Body: Surface extent within standard seasonal threshold.</span>
                </div>
              )}

              {/* Dual Metric Box */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-[#142D3B]/50 border border-white/5 rounded-xl p-2.5">
                  <span className="text-[9px] uppercase tracking-wider text-[#8D9A9A] block">
                    Observed Water
                  </span>
                  <div className="text-lg font-bold font-mono text-[#47D4DF] mt-0.5">
                    {detectedArea > 0 ? detectedArea.toFixed(1) : 'N/A'}{' '}
                    <span className="text-[10px] text-[#8D9A9A]">ha</span>
                  </div>
                  <span className="text-[9px] text-[#8D9A9A] mt-0.5 block font-mono">
                    {coverageRatio}% of basin
                  </span>
                </div>

                <div className="bg-[#142D3B]/50 border border-white/5 rounded-xl p-2.5">
                  <span className="text-[9px] uppercase tracking-wider text-[#8D9A9A] block">
                    Cadastral Basin
                  </span>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {cadastralArea.toFixed(1)}{' '}
                    <span className="text-[10px] text-[#8D9A9A]">ha</span>
                  </div>
                  <span className="text-[9px] text-[#8D9A9A] mt-0.5 block font-mono">
                    BBMP Master Extent
                  </span>
                </div>
              </div>

              {/* Core Requirement 2: Area-over-time chart for each water body */}
              <div className="bg-[#142D3B]/40 border border-white/10 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center space-x-1.5 text-white font-semibold">
                    <TrendingDown className="w-3 h-3 text-[#47D4DF]" />
                    <span>Area-over-Time Trend</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[9px] font-mono text-[#8D9A9A]">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-0.5 bg-[#47D4DF]" />
                      <span>Water</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2 border-t border-dashed border-[#EF4444]" />
                      <span>-20% Threshold</span>
                    </span>
                  </div>
                </div>

                {/* SVG Line / Area Sparkline Chart */}
                <div className="relative">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-16 overflow-visible"
                  >
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#47D4DF" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#168CC5" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Threshold Dashed Line (-20%) */}
                    <line
                      x1={padX}
                      y1={thresholdY}
                      x2={chartWidth - padX}
                      y2={thresholdY}
                      stroke="#EF4444"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      opacity="0.8"
                    />

                    {/* Area fill */}
                    {areaD && <path d={areaD} fill="url(#areaGradient)" />}

                    {/* Line stroke */}
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#47D4DF"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Interactive Points */}
                    {coords.map((c, idx) => {
                      const isSelected = selectedObservationIndex === idx;
                      return (
                        <g
                          key={c.year}
                          className="cursor-pointer"
                          onClick={() => setSelectedObservationIndex(idx)}
                        >
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r={isSelected ? 4.5 : 3}
                            fill={isSelected ? '#47D4DF' : '#101A20'}
                            stroke={isSelected ? '#FFFFFF' : '#47D4DF'}
                            strokeWidth="2"
                          />
                          <text
                            x={c.x}
                            y={chartHeight - 1}
                            textAnchor="middle"
                            fill={isSelected ? '#47D4DF' : '#8D9A9A'}
                            fontSize="8"
                            fontFamily="monospace"
                          >
                            {c.year}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-[#8D9A9A] pt-0.5 border-t border-white/5">
                  <span>2017: {trendPoints[0]?.area.toFixed(1)} ha</span>
                  <span className={shrinkPct > 20 ? 'text-[#F87171] font-bold' : 'text-white'}>
                    2024: {trendPoints[trendPoints.length - 1]?.area.toFixed(1)} ha
                  </span>
                </div>
              </div>

              {/* Civic Encroachment Audit Status Card */}
              <div className={`rounded-xl p-2.5 border text-xs ${
                isEncroached
                  ? 'bg-[#EF4444]/10 border-[#EF4444]/30'
                  : 'bg-[#10B981]/10 border-[#10B981]/30'
              }`}>
                <div className="flex items-center space-x-1.5 mb-1">
                  {isEncroached ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F87171]" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                  )}
                  <span className={`font-semibold text-[11px] ${
                    isEncroached ? 'text-[#F87171]' : 'text-[#34D399]'
                  }`}>
                    {selectedLake.encroachment_status || 'Free of Intrusion (Restored)'}
                  </span>
                </div>
                {selectedLake.encroached_area_hectares ? (
                  <div className="text-[10px] text-[#8D9A9A] leading-relaxed">
                    <span className="text-white font-mono font-bold">
                      {selectedLake.encroached_area_hectares} ha
                    </span>{' '}
                    permanently occupied by human settlements & layouts.
                    {selectedLake.encroachment_type && (
                      <div className="text-[#D1D5DB] mt-1 text-[9.5px]">
                        <span className="text-[#8D9A9A]">Type:</span> {selectedLake.encroachment_type}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-[#34D399]/90">
                    No active illegal settlements detected. Fully protected or restored by civic authorities.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tab 2: Map Layers Toggle */
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                onClick={() => toggleLayer('cadastralBoundary')}
                className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  layers.cadastralBoundary
                    ? 'border-[#47D4DF]/50 bg-[#47D4DF]/10 text-white'
                    : 'border-white/5 bg-white/5 text-[#8D9A9A]'
                }`}
              >
                <span>Basin Line</span>
                <span className="w-2 h-2 rounded-full border border-[#47D4DF]" />
              </button>

              <button
                onClick={() => toggleLayer('detectedWater')}
                className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  layers.detectedWater
                    ? 'border-[#168CC5]/50 bg-[#168CC5]/10 text-white'
                    : 'border-white/5 bg-white/5 text-[#8D9A9A]'
                }`}
              >
                <span>Water Mask</span>
                <span className="w-2 h-2 rounded-full bg-[#168CC5]" />
              </button>

              <button
                onClick={() => toggleLayer('lostWater')}
                className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  layers.lostWater
                    ? 'border-[#EF4444]/50 bg-[#EF4444]/10 text-white'
                    : 'border-white/5 bg-white/5 text-[#8D9A9A]'
                }`}
              >
                <span>Encroachment</span>
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              </button>

              <button
                onClick={() => toggleLayer('gainedWater')}
                className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  layers.gainedWater
                    ? 'border-[#329B71]/50 bg-[#329B71]/10 text-white'
                    : 'border-white/5 bg-white/5 text-[#8D9A9A]'
                }`}
              >
                <span>Recharge</span>
                <span className="w-2 h-2 rounded-full bg-[#329B71]" />
              </button>
            </div>
          )}

          {/* Quick Action Footer */}
          <div className="border-t border-white/10 pt-2.5 grid grid-cols-3 gap-1.5 text-xs">
            <button
              onClick={() => setActiveScreen('comparison-studio')}
              className="py-1.5 px-2 bg-white/5 hover:bg-white/10 text-[#47D4DF] rounded-lg text-center font-medium transition-colors"
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setActiveScreen('restoration-lab')}
              className="py-1.5 px-2 bg-white/5 hover:bg-white/10 text-[#329B71] rounded-lg text-center font-medium transition-colors"
            >
              What-If
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="py-1.5 px-2 bg-[#168CC5] hover:bg-[#168CC5]/80 text-white rounded-lg text-center font-medium shadow-water-glow transition-all"
            >
              Audit Report
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
