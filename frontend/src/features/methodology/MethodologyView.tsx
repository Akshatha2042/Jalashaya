import React from 'react';
import { X, BookOpen, Layers, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const MethodologyView: React.FC = () => {
  const { activeScreen, setActiveScreen } = useAppStore();

  if (activeScreen !== 'methodology') return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#101A20]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101A20] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#47D4DF]" />
            <div>
              <h3 className="text-base font-bold text-white">Scientific Methodology & Data Governance</h3>
              <p className="text-xs text-[#8D9A9A]">
                Remote sensing algorithms, data provenance, and scientific integrity protocols
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#F2F5F2] leading-relaxed">
          {/* Section 1: Water Detection Engine */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-[#47D4DF]">
              <Cpu className="w-4 h-4" />
              <span>1. Automated Water Detection Engine (NDWI)</span>
            </div>
            <p className="text-[#8D9A9A]">
              JALASHAYA utilizes the McFeeters Normalized Difference Water Index (NDWI) to differentiate open surface
              water bodies from terrestrial vegetation and urban impervious surfaces using Sentinel-2 MSI Multi-Spectral Instrument:
            </p>
            <div className="bg-[#142D3B]/60 p-4 rounded-xl font-mono text-center text-[#47D4DF] border border-white/5">
              NDWI = (Band 3 [Green, 560nm] - Band 8 [NIR, 842nm]) / (Band 3 + Band 8)
            </div>
            <p className="text-[#8D9A9A]">
              A dynamic zero-threshold (NDWI &gt; 0.0) is applied after cloud/shadow masking. A 3x3 morphological spatial filter suppresses single-pixel noise.
            </p>
          </div>

          {/* Section 2: Lake Reference vs Observed Water */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-[#329B71]">
              <Layers className="w-4 h-4" />
              <span>2. Scientific Distinction: Cadastral Basin vs. Observed Water</span>
            </div>
            <p className="text-[#8D9A9A]">
              A foundational rule of JALASHAYA is that the mapped administrative or cadastral lake boundary (the basin)
              is fundamentally distinct from the contemporary water surface detected during a satellite overpass:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#8D9A9A] pl-2">
              <li>
                <strong className="text-white">Lake Reference Cadastre:</strong> The officially mapped cadastral or revenue boundary from BBMP and revenue surveys.
              </li>
              <li>
                <strong className="text-white">Observed Water Extent:</strong> The real-time water-covered surface detected by Sentinel-2 at 10m spatial resolution.
              </li>
            </ul>
          </div>

          {/* Section 3: Geodetic Area Projection */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-[#168CC5]">
              <CheckCircle className="w-4 h-4" />
              <span>3. Geodetic Projection & Accurate Area Calculations</span>
            </div>
            <p className="text-[#8D9A9A]">
              Area calculations are strictly forbidden from spherical degree math. All vector polygons are projected into
              Universal Transverse Mercator (UTM) Zone 43N (EPSG:32643), which precisely covers the Bengaluru plateau
              (77.5°E, 12.9°N) with minimal spatial distortion. 1 Hectare = 10,000 square meters.
            </p>
          </div>

          {/* Section 4: Data Integrity & Guardrails */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-[#E6A84B]">
              <ShieldAlert className="w-4 h-4" />
              <span>4. Data Integrity Rules & Guardrails</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="font-semibold text-white block mb-1">No Speculative Encroachment Claims</span>
                <p className="text-[#8D9A9A]">
                  A reduction in detected water extent indicates surface desiccation, sediment accumulation, or seasonal drawdown. It cannot prove illegal encroachment without ground cadastre survey.
                </p>
              </div>

              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="font-semibold text-white block mb-1">Seasonal Intelligence Normalization</span>
                <p className="text-[#8D9A9A]">
                  Comparisons between pre-monsoon dry months (March-May) and post-monsoon months (October-November) are tagged with seasonal warning notes to prevent misattributing natural climatic fluctuations to structural lake decline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
