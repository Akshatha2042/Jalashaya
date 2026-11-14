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
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const LakeTelemetryCard: React.FC = () => {
  const {
    selectedLake,
    observations,
    selectedObservationIndex,
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

  return (
    <aside className="absolute top-20 right-4 z-20 pointer-events-auto">
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
          <ChevronDown className="w-3.5 h-3.5 text-[#8D9A9A]" />
        </button>
      ) : (
        /* 2. Compact Refined Glass HUD Card */
        <div className="w-84 bg-[#101A20]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
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
              Telemetry & Audit
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

          {/* Tab 1: Telemetry Metrics */}
          {activeTab === 'metrics' ? (
            <div className="space-y-3">
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
                    {coverageRatio}% coverage
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

              {/* Multi-Year Delta Banner if comparison exists */}
              {comparisonData && (
                <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    {comparisonData.is_gain ? (
                      <ArrowUpRight className="w-4 h-4 text-[#329B71]" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-[#EF4444]" />
                    )}
                    <div>
                      <span className="text-[10px] text-[#8D9A9A] block">
                        {comparisonData.is_gain ? 'Water Recharge' : 'Encroached Since Baseline'}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          comparisonData.is_gain ? 'text-[#329B71]' : 'text-[#EF4444]'
                        }`}
                      >
                        {comparisonData.is_gain ? '+' : '-'}
                        {Math.abs(comparisonData.area_change_hectares).toFixed(1)} ha ({Math.abs(comparisonData.change_percentage).toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-semibold ${
                      comparisonData.is_gain ? 'bg-[#329B71]/20 text-[#329B71]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                    }`}
                  >
                    {!comparisonData.is_gain ? 'Encroached' : comparisonData.change_classification}
                  </span>
                </div>
              )}
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
              Compare
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
