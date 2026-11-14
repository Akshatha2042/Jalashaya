import React, { useEffect } from 'react';
import { X, Sparkles, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const RestorationLabModal: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    selectedLake,
    restorationTargetPct,
    updateRestorationSlider,
    restorationData
  } = useAppStore();

  useEffect(() => {
    if (activeScreen === 'restoration-lab' && selectedLake) {
      updateRestorationSlider(restorationTargetPct);
    }
  }, [activeScreen, selectedLake]);

  if (activeScreen !== 'restoration-lab' || !selectedLake) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#101A20]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101A20] border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#329B71]" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">What-If: Lake Restoration Lab</h3>
                <span className="text-[10px] font-mono uppercase bg-[#E6A84B]/20 text-[#E6A84B] px-2 py-0.5 rounded font-bold">
                  Simulation Model
                </span>
              </div>
              <p className="text-xs text-[#8D9A9A]">
                Hypothetical basin reclamation scenario — {selectedLake.official_name}
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

        {/* Warning Banner */}
        <div className="p-3 bg-[#E6A84B]/10 border-b border-[#E6A84B]/20 flex items-start space-x-2 text-xs text-[#E6A84B]">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Scientific Guardrail:</strong> This is a scenario exploration tool, NOT an observed satellite measurement.
            It geometrically extrapolates hypothetical water capacity towards the cadastral basin without assuming bathymetry or hydraulic viability.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Target Slider */}
          <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-[#47D4DF] tracking-wider font-semibold">
                Hypothetical Restoration Target
              </label>
              <span className="text-xl font-bold font-mono text-white">
                {restorationTargetPct}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={restorationTargetPct}
              onChange={(e) => updateRestorationSlider(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#101A20] rounded-lg appearance-none cursor-pointer accent-[#329B71]"
            />

            <div className="flex justify-between text-[10px] font-mono text-[#8D9A9A]">
              <span>0% (Current Satellite Extent)</span>
              <span>50% (Moderate Reclamation)</span>
              <span>100% (Full Cadastral Basin)</span>
            </div>
          </div>

          {/* Metric Comparison Cards */}
          {restorationData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#142D3B]/30 border border-white/5 rounded-xl p-4">
                <span className="text-[10px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                  Current Observed Water
                </span>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {restorationData.current_water_area_hectares.toFixed(1)}{' '}
                  <span className="text-xs text-[#8D9A9A]">ha</span>
                </div>
                <span className="text-[10px] text-[#8D9A9A] mt-0.5 block">
                  Latest Sentinel-2 observation
                </span>
              </div>

              <div className="bg-[#102B25]/40 border border-[#329B71]/30 rounded-xl p-4">
                <span className="text-[10px] font-mono uppercase text-[#329B71] tracking-wider block font-semibold">
                  Simulated Water Extent
                </span>
                <div className="text-2xl font-bold font-mono text-[#329B71] mt-1">
                  {restorationData.simulated_water_area_hectares.toFixed(1)}{' '}
                  <span className="text-xs text-[#8D9A9A]">ha</span>
                </div>
                <span className="text-[10px] text-[#329B71] mt-0.5 block font-mono">
                  +{restorationData.area_delta_hectares.toFixed(1)} ha potential gain
                </span>
              </div>

              <div className="bg-[#142D3B]/30 border border-white/5 rounded-xl p-4">
                <span className="text-[10px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                  Cadastral Basin Ceiling
                </span>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {restorationData.reference_basin_area_hectares.toFixed(1)}{' '}
                  <span className="text-xs text-[#8D9A9A]">ha</span>
                </div>
                <span className="text-[10px] text-[#8D9A9A] mt-0.5 block">
                  Official mapped boundary
                </span>
              </div>
            </div>
          )}

          {/* Environmental Insight */}
          <div className="bg-[#142D3B]/20 border border-white/5 rounded-xl p-4 space-y-2 text-xs text-[#8D9A9A]">
            <h4 className="text-xs font-semibold text-white">Reclamation Feasibility Considerations</h4>
            <p>
              Reclaiming degraded lake buffer zones requires coordinated de-silting, removal of invasive macrophyte weeds,
              restoration of natural raja-kaluve stormwater feeder channels, and secondary sewage treatment plant (STP) inlets.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#142D3B]/20">
          <span className="text-xs text-[#8D9A9A]">
            View the simulated boundary directly on the 3D twin map
          </span>
          <button
            onClick={() => setActiveScreen('command-center')}
            className="flex items-center space-x-1.5 bg-[#329B71] hover:bg-[#329B71]/80 text-white font-medium px-4 py-2 rounded-lg text-xs transition-all"
          >
            <span>Inspect on Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
