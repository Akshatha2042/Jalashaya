import React from 'react';
import { X, BookOpen, Layers, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const MethodologyView: React.FC = () => {
  const { activeScreen, setActiveScreen } = useAppStore();

  if (activeScreen !== 'methodology') return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header in Light Mode */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Scientific Methodology & Data Governance</h3>
              <p className="text-xs text-slate-500 font-medium">
                Remote sensing algorithms, data provenance, and civic verification protocols
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Section 1: Water Detection Engine */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-sky-700">
              <Cpu className="w-4 h-4" />
              <span>1. Automated Water Detection Engine (NDWI)</span>
            </div>
            <p className="text-slate-600">
              JALASHAYA utilizes the McFeeters Normalized Difference Water Index (NDWI) to differentiate open surface
              water bodies from terrestrial vegetation and urban impervious surfaces using Sentinel-2 MSI Multi-Spectral Instrument:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl font-mono text-center text-sky-700 border border-slate-200 font-bold">
              NDWI = (Band 3 [Green, 560nm] - Band 8 [NIR, 842nm]) / (Band 3 + Band 8)
            </div>
            <p className="text-slate-600">
              A dynamic zero-threshold (NDWI &gt; 0.0) is applied after cloud/shadow masking. A 3x3 morphological spatial filter suppresses single-pixel noise.
            </p>
          </div>

          {/* Section 2: Projected Coordinate Reference System */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-sky-700">
              <Layers className="w-4 h-4" />
              <span>2. Metric Precision: Projected Coordinate Reference System (UTM Zone 43N)</span>
            </div>
            <p className="text-slate-600">
              Surface areas in degree coordinates (EPSG:4326) suffer from severe latitudinal distortion at Bengaluru's latitude (~12.97°N).
              All vector geometries are projected to <strong>UTM Zone 43N (EPSG:32643)</strong> prior to metric planar calculation:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
              <li>Input Geographic Coordinates: <strong>WGS84 (EPSG:4326)</strong></li>
              <li>Calculated Planar Metric Projection: <strong>UTM Zone 43N (EPSG:32643)</strong></li>
              <li>Surface Area Units: Hectares (1 ha = 10,000 m²)</li>
              <li>Area Precision: Accurate to ±0.01 hectares at 10m Sentinel-2 ground sampling distance.</li>
            </ul>
          </div>

          {/* Section 3: Seasonal Intelligence Engine */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-sky-700">
              <CheckCircle className="w-4 h-4" />
              <span>3. Seasonal Intelligence & Drawdown Differentiation</span>
            </div>
            <p className="text-slate-600">
              To eliminate false alarms caused by natural pre-monsoonal evaporation, comparisons pair observations from
              similar meteorological seasons or compute explicit multi-year baselines:
            </p>
            <div className="grid grid-cols-2 gap-3 text-slate-600">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">Pre-Monsoon Dry (Mar - May)</span>
                Characterized by maximum solar irradiance and peak seasonal contraction.
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">Post-Monsoon Peak (Oct - Dec)</span>
                Maximum surface water retention following the Southwest Monsoon.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex justify-end">
          <button
            onClick={() => setActiveScreen('command-center')}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
          >
            Back to Digital Twin
          </button>
        </div>
      </div>
    </div>
  );
};
