import React, { useState, useMemo } from 'react';
import {
  X,
  Sliders,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { GeoJSONGeometry } from '../../types';

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
    setIsReportModalOpen,
    setIsSwipeMode
  } = useAppStore();

  const [showOldMask, setShowOldMask] = useState<boolean>(true);
  const [oldZoom, setOldZoom] = useState<number>(1);
  const [showNewMask, setShowNewMask] = useState<boolean>(true);
  const [newZoom, setNewZoom] = useState<number>(1);
  const [maskOpacity, setMaskOpacity] = useState<number>(0.6);

  if (activeScreen !== 'comparison-studio' || !selectedLake) return null;

  const olderObs = observations.find((o) => o.id === comparisonOlderId) || observations[0];
  const newerObs = observations.find((o) => o.id === comparisonNewerId) || observations[observations.length - 1];

  const oldYear = olderObs ? olderObs.observation_date.split('-')[0] : '2017';
  const newYear = newerObs ? newerObs.observation_date.split('-')[0] : '2024';

  const isShrinking = comparisonData && comparisonData.area_change_hectares < 0 && Math.abs(comparisonData.change_percentage) >= 20.0;

  // Calculate sharp geographic bounding box for the lake
  const lakeBBox = useMemo(() => {
    if (!selectedLake) return null;
    let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;

    const extract = (coords: any[]) => {
      if (!Array.isArray(coords)) return;
      if (typeof coords[0] === 'number') {
        const [lon, lat] = coords;
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      } else {
        coords.forEach(extract);
      }
    };

    if (selectedLake.boundary_geometry?.coordinates) {
      extract(selectedLake.boundary_geometry.coordinates);
    }

    if (minLon === 180) {
      const d = 0.015;
      return {
        minLon: selectedLake.longitude - d,
        maxLon: selectedLake.longitude + d,
        minLat: selectedLake.latitude - d,
        maxLat: selectedLake.latitude + d
      };
    }

    const dLon = (maxLon - minLon) * 0.2 || 0.008;
    const dLat = (maxLat - minLat) * 0.2 || 0.008;

    return {
      minLon: +(minLon - dLon).toFixed(5),
      maxLon: +(maxLon + dLon).toFixed(5),
      minLat: +(minLat - dLat).toFixed(5),
      maxLat: +(maxLat + dLat).toFixed(5)
    };
  }, [selectedLake]);

  // High-Resolution Satellite imagery URL (Sub-meter ground resolution, ultra-clear)
  const highResSatelliteUrl = lakeBBox
    ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${lakeBBox.minLon},${lakeBBox.minLat},${lakeBBox.maxLon},${lakeBBox.maxLat}&bboxSR=4326&imageSR=4326&size=1024,640&f=image`
    : '';

  // Project vector geometries accurately onto the satellite image coordinate frame
  const projectCoordsToSvg = (
    geom: GeoJSONGeometry | undefined,
    bbox: { minLon: number; minLat: number; maxLon: number; maxLat: number } | null,
    w = 1024,
    h = 640
  ): string => {
    if (!geom || !geom.coordinates || !bbox) return '';

    const projectPoint = (lon: number, lat: number): [number, number] => {
      const x = ((lon - bbox.minLon) / (bbox.maxLon - bbox.minLon)) * w;
      const y = ((bbox.maxLat - lat) / (bbox.maxLat - bbox.minLat)) * h;
      return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
    };

    const ringToPath = (ring: number[][]): string => {
      if (!Array.isArray(ring) || ring.length === 0) return '';
      const pts = ring.map((pt) => projectPoint(pt[0], pt[1]));
      return `M ${pts[0][0]},${pts[0][1]} ` + pts.slice(1).map((p) => `L ${p[0]},${p[1]}`).join(' ') + ' Z';
    };

    try {
      if (geom.type === 'Polygon') {
        return geom.coordinates.map(ringToPath).join(' ');
      } else if (geom.type === 'MultiPolygon') {
        return geom.coordinates.map((poly: any) => poly.map(ringToPath).join(' ')).join(' ');
      }
    } catch {
      return '';
    }
    return '';
  };

  const oldWaterPath = useMemo(
    () => projectCoordsToSvg(olderObs?.water_extent_geometry || selectedLake?.boundary_geometry, lakeBBox),
    [olderObs, selectedLake, lakeBBox]
  );

  const newWaterPath = useMemo(
    () => projectCoordsToSvg(newerObs?.water_extent_geometry, lakeBBox),
    [newerObs, lakeBBox]
  );

  const lostWaterPath = useMemo(
    () => projectCoordsToSvg(comparisonData?.lost_water_geometry, lakeBBox),
    [comparisonData, lakeBBox]
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header in Clean Light Theme */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">Side-by-Side Satellite Comparison Studio</h3>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                  {selectedLake.official_name}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                High-definition photographic comparison: {oldYear} pristine baseline vs {newYear} contemporary urban encroachment
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

        {/* Date Selector Row */}
        <div className="p-3.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
                Baseline (Year 1)
              </label>
              <select
                value={comparisonOlderId || ''}
                onChange={(e) => runComparison(e.target.value, comparisonNewerId || undefined)}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500 shadow-sm font-medium"
              >
                {observations.map((obs) => (
                  <option key={obs.id} value={obs.id}>
                    {obs.observation_date} ({obs.satellite_source})
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-400 mt-5 font-bold">vs</span>

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
                Comparison (Year 2)
              </label>
              <select
                value={comparisonNewerId || ''}
                onChange={(e) => runComparison(comparisonOlderId || undefined, e.target.value)}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500 shadow-sm font-medium"
              >
                {observations.map((obs) => (
                  <option key={obs.id} value={obs.id}>
                    {obs.observation_date} ({obs.satellite_source})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setActiveScreen('command-center');
                setIsSwipeMode(true);
              }}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Full-Screen Curtain Swipe</span>
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-md shadow-sky-600/20 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Civic Compliance Report</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Side-by-Side High-Definition Image Inspection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Year 1 Card (Baseline Pristine View) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                  <span className="font-bold text-sm text-slate-900">
                    {oldYear} Baseline Satellite Image
                  </span>
                </div>
                <span className="text-[10px] font-mono text-sky-700 bg-sky-100 px-2 py-0.5 rounded font-semibold border border-sky-200">
                  {olderObs?.observation_date}
                </span>
              </div>

              {/* High-Definition Satellite Canvas */}
              <div className="relative h-64 md:h-72 rounded-xl overflow-hidden border border-slate-300 bg-slate-900 select-none shadow-inner group">
                <img
                  src={highResSatelliteUrl}
                  alt={`${selectedLake.official_name} ${oldYear}`}
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={{ transform: `scale(${oldZoom})` }}
                  loading="eager"
                />

                {/* Pristine Full Lake Water Polygon Overlay */}
                {showOldMask && oldWaterPath && (
                  <svg
                    viewBox="0 0 1024 640"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-150"
                    style={{
                      opacity: maskOpacity,
                      transform: `scale(${oldZoom})`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <path
                      d={oldWaterPath}
                      fill="rgba(2, 132, 199, 0.55)"
                      stroke="#0284C7"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 pointer-events-none">
                  <span className="text-[10px] font-mono text-slate-900 bg-white/95 backdrop-blur-md border border-slate-200 px-2.5 py-0.5 rounded-full font-bold shadow-md">
                    🛰️ {oldYear} Pristine Baseline
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    ✓ Full Water Extent
                  </span>
                </div>

                {/* Bottom Controls Bar */}
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs shadow-md">
                  <button
                    onClick={() => setShowOldMask(!showOldMask)}
                    className={`px-2.5 py-1 rounded font-mono font-semibold flex items-center space-x-1.5 transition-colors ${
                      showOldMask ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {showOldMask ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showOldMask ? 'Water Mask (On)' : 'Pure Photo'}</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-500 font-mono">Zoom:</span>
                    <button
                      onClick={() => setOldZoom(oldZoom === 1 ? 1.5 : oldZoom === 1.5 ? 2 : 1)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold"
                    >
                      {oldZoom}x
                    </button>
                  </div>
                </div>
              </div>

              {/* Data readouts */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Water Surface</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {comparisonData ? comparisonData.area_old_hectares.toFixed(1) : olderObs?.detected_area_hectares} ha
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Observation Pass</span>
                  <span className="text-slate-700 text-xs font-mono truncate block">
                    Sentinel-2 MSI Level-2A
                  </span>
                </div>
              </div>
            </div>

            {/* Year 2 Card (Contemporary Encroached View) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                  <span className="font-bold text-sm text-slate-900">
                    {newYear} Contemporary Satellite Image
                  </span>
                </div>
                <span className="text-[10px] font-mono text-red-700 bg-red-100 px-2 py-0.5 rounded font-semibold border border-red-200">
                  {newerObs?.observation_date}
                </span>
              </div>

              {/* High-Definition Satellite Canvas */}
              <div className="relative h-64 md:h-72 rounded-xl overflow-hidden border border-slate-300 bg-slate-900 select-none shadow-inner group">
                <img
                  src={highResSatelliteUrl}
                  alt={`${selectedLake.official_name} ${newYear}`}
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={{ transform: `scale(${newZoom})` }}
                  loading="eager"
                />

                {/* Contemporary Water + Red Encroachment Highlight */}
                {showNewMask && (
                  <svg
                    viewBox="0 0 1024 640"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-150"
                    style={{
                      opacity: maskOpacity,
                      transform: `scale(${newZoom})`,
                      transformOrigin: 'center center'
                    }}
                  >
                    {/* Remaining Active Water (Blue) */}
                    {newWaterPath && (
                      <path
                        d={newWaterPath}
                        fill="rgba(2, 132, 199, 0.5)"
                        stroke="#0284C7"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Encroached Human Settlement Zone (Red) */}
                    {lostWaterPath && (
                      <path
                        d={lostWaterPath}
                        fill="rgba(220, 38, 38, 0.58)"
                        stroke="#DC2626"
                        strokeWidth="3"
                        strokeDasharray="4 2"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 pointer-events-none">
                  <span className="text-[10px] font-mono text-slate-900 bg-white/95 backdrop-blur-md border border-slate-200 px-2.5 py-0.5 rounded-full font-bold shadow-md">
                    🛰️ {newYear} Contemporary View
                  </span>
                  {isShrinking ? (
                    <span className="text-[10px] font-mono text-red-800 bg-red-100/95 border border-red-300 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span>Shrinkage Flagged</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      ✓ Boundary Stable
                    </span>
                  )}
                </div>

                {/* Bottom Controls Bar */}
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs shadow-md">
                  <button
                    onClick={() => setShowNewMask(!showNewMask)}
                    className={`px-2.5 py-1 rounded font-mono font-semibold flex items-center space-x-1.5 transition-colors ${
                      showNewMask ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {showNewMask ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showNewMask ? 'Encroachment Highlight' : 'Pure Photo'}</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-500 font-mono">Zoom:</span>
                    <button
                      onClick={() => setNewZoom(newZoom === 1 ? 1.5 : newZoom === 1.5 ? 2 : 1)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold"
                    >
                      {newZoom}x
                    </button>
                  </div>
                </div>
              </div>

              {/* Data readouts */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Water Surface</span>
                  <span className="font-mono font-bold text-sky-700 text-sm">
                    {comparisonData ? comparisonData.area_new_hectares.toFixed(1) : newerObs?.detected_area_hectares} ha
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Net Change</span>
                  <span className={`font-mono font-bold text-sm ${comparisonData?.is_gain ? 'text-emerald-600' : 'text-red-600'}`}>
                    {comparisonData ? `${comparisonData.area_change_hectares.toFixed(1)} ha (${comparisonData.change_percentage.toFixed(1)}%)` : '0 ha'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Highlights in Light Theme */}
          {comparisonData && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Historical Extent ({comparisonData.older_date})
                </span>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                  {comparisonData.area_old_hectares.toFixed(1)} <span className="text-xs text-slate-500 font-normal">ha</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Baseline measurement</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Recent Extent ({comparisonData.newer_date})
                </span>
                <div className="text-xl font-bold font-mono text-sky-700 mt-1">
                  {comparisonData.area_new_hectares.toFixed(1)} <span className="text-xs text-slate-500 font-normal">ha</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Contemporary water spread</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Net Delta (ΔA)
                </span>
                <div className={`text-xl font-bold font-mono mt-1 ${comparisonData.is_gain ? 'text-emerald-600' : 'text-red-600'}`}>
                  {comparisonData.area_change_hectares > 0 ? '+' : ''}{comparisonData.area_change_hectares.toFixed(1)} <span className="text-xs font-normal">ha</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                  {comparisonData.change_percentage.toFixed(1)}% {comparisonData.is_gain ? 'gain' : 'loss'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Civic Audit Status
                </span>
                <div className="mt-1">
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-mono font-bold uppercase ${
                    comparisonData.is_gain
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {comparisonData.change_classification}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {comparisonData.seasonal_context?.is_same_season_comparison ? 'Consistent seasonal window' : 'Seasonal gap detected'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
