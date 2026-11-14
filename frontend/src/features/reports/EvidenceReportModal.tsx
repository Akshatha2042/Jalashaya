import React from 'react';
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
    comparisonData
  } = useAppStore();

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
    <div className="fixed inset-0 z-50 bg-[#101A20]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101A20] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#168CC5]" />
            <div>
              <h3 className="text-base font-bold text-white">Scientific Change & Verification Report</h3>
              <p className="text-xs text-[#8D9A9A]">
                Traceable environmental intelligence report for {selectedLake.official_name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="text-[#8D9A9A] hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 bg-[#142D3B]/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <a
              href={htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 bg-[#168CC5] hover:bg-[#168CC5]/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </a>

            <a
              href={geoJsonUrl}
              download={`${selectedLake.id}_differential.geojson`}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#47D4DF]" />
              <span>Download GeoJSON</span>
            </a>

            <a
              href={csvUrl}
              download={`${selectedLake.id}_observations.csv`}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#329B71]" />
              <span>Download CSV Time Series</span>
            </a>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-[#329B71] font-mono">
            <ShieldCheck className="w-4 h-4" />
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
