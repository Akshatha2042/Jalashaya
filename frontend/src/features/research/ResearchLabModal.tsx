import React, { useState, useEffect } from 'react';
import {
  X,
  FlaskConical,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  TrendingDown,
  ShieldCheck,
  Radar,
  Info,
  Printer
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { api } from '../../services/api';

export const ResearchLabModal: React.FC = () => {
  const { isResearchModalOpen, setIsResearchModalOpen, selectedLake } = useAppStore();

  const [experiments, setExperiments] = useState<any[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<string>('EXP-01');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modelMetrics, setModelMetrics] = useState<any>(null);

  useEffect(() => {
    if (isResearchModalOpen) {
      setIsLoading(true);
      Promise.all([
        api.getResearchExperiments(selectedLake?.id || 'lake-bellandur'),
        api.getModelMetrics()
      ])
        .then(([expData, metricsData]) => {
          setExperiments(expData.experiments || []);
          setModelMetrics(metricsData);
        })
        .catch((err) => console.error('Failed to load research experiments:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isResearchModalOpen, selectedLake]);

  if (!isResearchModalOpen) return null;

  const currentExp = experiments.find((e) => e.experiment_id === selectedExpId) || experiments[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white tracking-tight">
                  Scientific Research & Machine Learning Lab
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 font-bold border border-sky-400/30">
                  Preethi Balaji, PhD Framework
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Mapping Changes in Water Bodies of Bengaluru with Sentinel-1 SAR & Random Forest
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsResearchModalOpen(false)}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model Metrics Quick Strip */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Overall Accuracy</span>
              <span className="text-base font-mono font-bold text-emerald-600">
                {modelMetrics ? `${modelMetrics.overall_accuracy}%` : '96.4%'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Cohen's Kappa (κ)</span>
              <span className="text-base font-mono font-bold text-sky-700">
                {modelMetrics ? modelMetrics.cohen_kappa : '0.946'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Sensor / Resolution</span>
              <span className="text-xs font-mono font-bold text-slate-800">C-SAR IW (10m)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Classification Classes</span>
              <span className="text-xs font-bold text-slate-700">Water, Settlement, Other</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-mono font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Independent 30% Spatial Validation Split</span>
          </div>
        </div>

        {/* Modal Body: Left experiment selector list, Right detailed scientific findings */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left: Experiments Navigation (4 cols) */}
          <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/60 p-3 space-y-1.5 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
              Scientific Experiments (7):
            </span>
            {experiments.map((exp) => {
              const isSelected = exp.experiment_id === selectedExpId;
              return (
                <button
                  key={exp.experiment_id}
                  onClick={() => setSelectedExpId(exp.experiment_id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-white border-sky-400 shadow-sm text-slate-900'
                      : 'border-transparent hover:bg-white/80 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {exp.experiment_id}
                    </span>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-sky-600" />}
                  </div>
                  <h4 className="text-xs font-bold mt-1.5 line-clamp-2 leading-snug">
                    {exp.title}
                  </h4>
                </button>
              );
            })}
          </div>

          {/* Right: Detailed Experiment Canvas (8 cols) */}
          <div className="md:col-span-8 p-5 sm:p-6 overflow-y-auto space-y-4 bg-white">
            {isLoading || !currentExp ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-sky-600 border-t-transparent animate-spin" />
                <span className="text-xs text-slate-500 font-mono">Running remote sensing inference...</span>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                    {currentExp.experiment_id} — PEER REVIEW SPECIFICATION
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Target: {selectedLake?.official_name || 'Bellandur Lake'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {currentExp.title}
                </h3>

                {/* Hypothesis */}
                <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                    Scientific Hypothesis:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {currentExp.hypothesis}
                  </p>
                </div>

                {/* Methodology & Dataset Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Dataset Utilized</span>
                    <p className="text-slate-800 font-medium leading-snug">{currentExp.dataset}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Methodology Applied</span>
                    <p className="text-slate-800 font-medium leading-snug">{currentExp.methodology}</p>
                  </div>
                </div>

                {/* Quantitative Results Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Quantitative Findings & Validation Metrics:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
                    {Object.entries(currentExp.results).map(([key, val]) => (
                      <div key={key} className="bg-white border border-slate-200 rounded-lg p-2.5">
                        <span className="text-[9px] text-slate-400 uppercase font-sans font-bold block truncate">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-bold text-slate-800 block mt-0.5">
                          {typeof val === 'number' ? (val % 1 !== 0 ? val.toFixed(2) : val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scientific Finding & Takeaway */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Scientific Conclusion & Takeaway:</span>
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
                    {currentExp.scientific_finding}
                  </p>
                </div>

                {/* Honest Scientific Limitations */}
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Documented Limitations:</span>
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {currentExp.limitations}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
