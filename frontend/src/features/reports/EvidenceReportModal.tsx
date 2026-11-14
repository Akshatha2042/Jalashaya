import React, { useEffect } from 'react';
import { X, FileText, Download, Printer, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { api } from '../../services/api';

export const EvidenceReportModal: React.FC = () => {
  const {
    isReportModalOpen,
    setIsReportModalOpen,
    selectedLake,
    comparisonOlderId,
    comparisonNewerId,
    comparisonData,
    lakes,
    selectLake
  } = useAppStore();

  useEffect(() => {
    if (isReportModalOpen && !selectedLake && lakes.length > 0) {
      const bellandur = lakes.find((l) => l.official_name.toLowerCase().includes('bellandur')) || lakes[0];
      selectLake(bellandur.id);
    }
  }, [isReportModalOpen, selectedLake, lakes, selectLake]);

  if (!isReportModalOpen || !selectedLake) return null;

  const htmlUrl = api.getReportHtmlUrl(
    selectedLake.id,
    comparisonOlderId || undefined,
    comparisonNewerId || undefined
  );

  const geoJsonUrl = api.getReportGeoJsonUrl(
    selectedLake.id,
    comparisonOlderId || undefined,
    comparisonNewerId || undefined
  );

  const csvUrl = api.getCsvObservationsUrl(selectedLake.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header in Light Theme */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Scientific Change & Verification Report</h3>
              <p className="text-xs text-slate-500 font-medium">
                Traceable environmental compliance dossier for {selectedLake.official_name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <a
              href={htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </a>

            <a
              href={geoJsonUrl}
              download={`${selectedLake.id}_differential.geojson`}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium px-3 py-1.5 rounded-lg shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>Download GeoJSON</span>
            </a>

            <a
              href={csvUrl}
              download={`${selectedLake.id}_observations.csv`}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium px-3 py-1.5 rounded-lg shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download CSV Time Series</span>
            </a>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-mono font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Traceable Copernicus & BBMP Data</span>
          </div>
        </div>

        {/* Report Preview Frame */}
        <div className="flex-1 bg-white overflow-hidden">
          <iframe
            src={htmlUrl}
            title="Scientific Report"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};
