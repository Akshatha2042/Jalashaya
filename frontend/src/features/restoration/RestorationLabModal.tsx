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
    restorationData,
    lakes,
    selectLake
  } = useAppStore();

  useEffect(() => {
    if (activeScreen === 'restoration-lab') {
      if (!selectedLake && lakes.length > 0) {
        const bellandur = lakes.find((l) => l.official_name.toLowerCase().includes('bellandur')) || lakes[0];
        selectLake(bellandur.id);
      } else if (selectedLake) {
        updateRestorationSlider(restorationTargetPct);
      }
    }
  }, [activeScreen, selectedLake, lakes, selectLake]);

  if (activeScreen !== 'restoration-lab') return null;

  if (!selectedLake) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-700">Loading Basin Restoration Lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header in Light Theme */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">What-If: Basin Restoration Lab</h3>
                <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                  Simulation Model
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Hypothetical basin reclamation scenario — {selectedLake.official_name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveScreen('command-center')}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-start space-x-2 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p>
            <strong>Scientific Guardrail:</strong> This is a scenario exploration tool, NOT an observed satellite measurement.
            It geometrically extrapolates hypothetical water capacity towards the cadastral basin boundary.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Target Slider Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-slate-600 tracking-wider font-bold">
                Hypothetical Basin Restoration Target
              </label>
              <span className="text-2xl font-extrabold font-mono text-emerald-600">
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
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-emerald-600"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0% (Current Satellite Extent)</span>
              <span>50% (Core Reclamation)</span>
              <span>100% (Full Cadastral Basin)</span>
            </div>
          </div>

          {/* Metric Comparison Cards */}
          {restorationData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block font-semibold">
                  Current Observed Water
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  {restorationData.current_water_area_hectares.toFixed(1)}{' '}
                  <span className="text-xs text-slate-500 font-normal">ha</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Contemporary satellite pass</span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                <span className="text-[10px] font-mono uppercase text-emerald-700 tracking-wider block font-semibold">
                  Simulated Water Extent
                </span>
                <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                  {restorationData.simulated_water_area_hectares.toFixed(1)}{' '}
                  <span className="text-xs text-emerald-600 font-normal">ha</span>
                </div>
                <span className="text-[10px] text-emerald-600 mt-0.5 block font-semibold">
                  +{restorationData.area_delta_hectares.toFixed(1)} ha reclaimed (+{restorationTargetPct}%)
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block font-semibold">
                  Full Cadastral Basin
                </span>
                <div className="text-2xl font-bold font-mono text-slate-800 mt-1">
                  {restorationData.reference_basin_area_hectares.toFixed(1)}{' '}
                  <span className="text-xs text-slate-500 font-normal">ha</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Legal reference boundary</span>
              </div>
            </div>
          )}

          {/* Environmental Benefits Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Hydrological Impact Projection ({restorationTargetPct}% Reclamation)</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-500 block text-[10px]">Flood Buffer Capacity</span>
                <span className="font-mono font-bold text-slate-900">
                  +{((restorationData?.area_delta_hectares || 0) * 15000).toLocaleString('en-IN', { maximumFractionDigits: 0 })} m³
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Aquifer Recharge Potential</span>
                <span className="font-mono font-bold text-emerald-700">
                  +{((restorationData?.area_delta_hectares || 0) * 0.45).toFixed(1)} MLD
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Urban Heat Island Abatement</span>
                <span className="font-mono font-bold text-sky-700">
                  -{(restorationTargetPct * 0.015).toFixed(1)} °C microclimate
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Hydraulic Risk Score</span>
                <span className={`font-mono font-bold ${restorationTargetPct >= 60 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {restorationTargetPct >= 60 ? 'OPTIMAL' : 'MODERATE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Target polygon rendered in cyan vector on map view
          </span>
          <button
            onClick={() => setActiveScreen('command-center')}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md shadow-sky-600/20 transition-all"
          >
            <span>View 3D Simulated Basin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
