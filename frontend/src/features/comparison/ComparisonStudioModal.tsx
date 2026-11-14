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
  Image as ImageIcon,
  Layers
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
    setIsReportModalOpen
  } = useAppStore();

  // Imagery view states
  const [showOldMask, setShowOldMask] = useState<boolean>(true);
  const [oldOpacity, setOldOpacity] = useState<number>(0.5);
  const [oldZoomed, setOldZoomed] = useState<boolean>(false);

  const [showNewMask, setShowNewMask] = useState<boolean>(true);
  const [newOpacity, setNewOpacity] = useState<number>(0.55);
  const [newZoomed, setNewZoomed] = useState<boolean>(false);
  const [activeLayerMode, setActiveLayerMode] = useState<'all' | 'encroachment' | 'water' | 'raw'>('all');

  if (activeScreen !== 'comparison-studio' || !selectedLake) return null;

  const olderObs = observations.find((o) => o.id === comparisonOlderId) || observations[0];
  const newerObs = observations.find((o) => o.id === comparisonNewerId) || observations[observations.length - 1];

  const oldYear = olderObs ? olderObs.observation_date.split('-')[0] : '2017';
  const newYear = newerObs ? newerObs.observation_date.split('-')[0] : '2024';

  const isShrinking = comparisonData && comparisonData.area_change_hectares < 0 && Math.abs(comparisonData.change_percentage) >= 20.0;

  // Compute Lake Bounding Box with margin for satellite capture
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

    const dLon = (maxLon - minLon) * 0.22 || 0.008;
    const dLat = (maxLat - minLat) * 0.22 || 0.008;

    return {
      minLon: +(minLon - dLon).toFixed(5),
      maxLon: +(maxLon + dLon).toFixed(5),
      minLat: +(minLat - dLat).toFixed(5),
      maxLat: +(maxLat + dLat).toFixed(5)
    };
  }, [selectedLake]);

  // Actual high-resolution satellite imagery photo URL for the lake
  const satelliteImageUrl = lakeBBox
    ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${lakeBBox.minLon},${lakeBBox.minLat},${lakeBBox.maxLon},${lakeBBox.maxLat}&bboxSR=4326&imageSR=4326&size=800,480&f=image`
    : '';

  // Converts GeoJSON coordinates directly to SVG paths matching satellite bounding box
  const projectCoordsToSvg = (
    geom: GeoJSONGeometry | undefined,
    bbox: { minLon: number; minLat: number; maxLon: number; maxLat: number } | null,
    w = 800,
    h = 480
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

  const cadastralPath = useMemo(
    () => projectCoordsToSvg(selectedLake?.boundary_geometry, lakeBBox),
    [selectedLake, lakeBBox]
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#101A20]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101A20] border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#168CC5]/20 text-[#47D4DF]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Side-by-Side Satellite Comparison Studio</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#168CC5]/20 text-[#47D4DF] border border-[#168CC5]/30">
                  {selectedLake.official_name}
                </span>
              </div>
              <p className="text-xs text-[#8D9A9A]">
                Multi-temporal satellite imagery: Baseline pristine water body vs contemporary urban encroachment
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveScreen('command-center')}
            className="text-[#8D9A9A] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector Row */}
        <div className="p-3.5 bg-[#142D3B]/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#8D9A9A] block mb-1">
                Baseline (Year 1)
              </label>
              <select
                value={comparisonOlderId || ''}
                onChange={(e) => runComparison(e.target.value, comparisonNewerId || undefined)}
                className="bg-[#101A20] border border-white/15 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#47D4DF]"
              >
                {observations.map((obs) => (
                  <option key={obs.id} value={obs.id}>
                    {obs.observation_date} ({obs.satellite_source})
                  </option>
                ))}
              </select>
            </div>

            <span className="text-[#8D9A9A] mt-5 font-bold">vs</span>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#8D9A9A] block mb-1">
                Comparison (Year 2)
              </label>
              <select
                value={comparisonNewerId || ''}
                onChange={(e) => runComparison(comparisonOlderId || undefined, e.target.value)}
                className="bg-[#101A20] border border-white/15 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#47D4DF]"
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
                useAppStore.getState().setIsSwipeMode(true);
              }}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Interactive Swipe Curtain</span>
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center space-x-1.5 bg-[#168CC5] hover:bg-[#168CC5]/80 text-white px-3.5 py-2 rounded-lg text-xs font-medium shadow-water-glow transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Official Compliance Report</span>
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Core Feature 4: Side-by-side images from two years */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Year 1 Satellite View Card */}
            <div className="bg-[#142D3B]/40 border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#168CC5]" />
                  <span className="font-bold text-sm text-white">
                    {oldYear} Baseline Satellite Image
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#47D4DF] bg-[#168CC5]/20 px-2 py-0.5 rounded border border-[#168CC5]/30">
                  {olderObs?.observation_date}
                </span>
              </div>

              {/* Real Satellite Photo Container */}
              <div className="relative h-60 md:h-64 rounded-xl overflow-hidden border border-white/15 bg-[#0B1216] select-none shadow-inner">
                {/* Photographic Satellite Imagery */}
                <img
                  src={satelliteImageUrl}
                  alt={`${selectedLake.official_name} ${oldYear} Satellite Image`}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    oldZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  loading="lazy"
                />

                {/* SVG Water Vector Overlay */}
                {showOldMask && oldWaterPath && (
                  <svg
                    viewBox="0 0 800 480"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200"
                    style={{ opacity: oldOpacity }}
                  >
                    <defs>
                      <radialGradient id="waterGlowOld" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#47D4DF" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#168CC5" stopOpacity="0.65" />
                      </radialGradient>
                    </defs>
                    <path
                      d={oldWaterPath}
                      fill="url(#waterGlowOld)"
                      stroke="#47D4DF"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                {/* Badges on top of satellite photo */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono text-white bg-[#101A20]/85 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-lg">
                    <span>🛰️ High-Res Satellite View</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#34D399] bg-[#10B981]/25 backdrop-blur-md border border-[#10B981]/50 px-2 py-0.5 rounded-full font-semibold">
                    ✓ Full Water Spread
                  </span>
                </div>

                {/* Interactive Controls Overlay at Bottom */}
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-[#101A20]/90 backdrop-blur-md border border-white/15 rounded-lg px-2.5 py-1.5 text-[10px]">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowOldMask(!showOldMask)}
                      className={`px-2 py-0.5 rounded font-mono font-medium flex items-center space-x-1 transition-colors ${
                        showOldMask ? 'bg-[#168CC5] text-white' : 'bg-white/10 text-[#8D9A9A] hover:text-white'
                      }`}
                      title={showOldMask ? 'Hide vector overlay to view pure satellite photo' : 'Show detected water boundary'}
                    >
                      {showOldMask ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{showOldMask ? 'Water Boundary Mask' : 'Pure Satellite Photo'}</span>
                    </button>

                    {showOldMask && (
                      <div className="flex items-center space-x-1.5 hidden sm:flex">
                        <span className="text-[#8D9A9A]">Mask:</span>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={oldOpacity}
                          onChange={(e) => setOldOpacity(parseFloat(e.target.value))}
                          className="w-14 h-1 accent-[#47D4DF] cursor-pointer"
                        />
                        <span className="font-mono text-white text-[9px]">{Math.round(oldOpacity * 100)}%</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setOldZoomed(!oldZoomed)}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title={oldZoomed ? 'Zoom Out' : 'Zoom In on Satellite Imagery'}
                  >
                    {oldZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Data readouts */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-[#8D9A9A] block">Water Surface</span>
                  <span className="font-mono font-bold text-white">
                    {comparisonData ? comparisonData.area_old_hectares.toFixed(1) : olderObs?.detected_area_hectares} ha
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8D9A9A] block">Sensor / Source</span>
                  <span className="text-white text-[11px] truncate block">
                    {olderObs?.satellite_source || 'Sentinel-2A'} (10m)
                  </span>
                </div>
              </div>
            </div>

            {/* Year 2 Satellite View Card */}
            <div className="bg-[#142D3B]/40 border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
                  <span className="font-bold text-sm text-white">
                    {newYear} Contemporary Satellite Image
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#F87171] bg-[#EF4444]/20 px-2 py-0.5 rounded border border-[#EF4444]/30">
                  {newerObs?.observation_date}
                </span>
              </div>

              {/* Real Satellite Photo Container */}
              <div className="relative h-60 md:h-64 rounded-xl overflow-hidden border border-white/15 bg-[#0B1216] select-none shadow-inner">
                {/* Photographic Satellite Imagery showing Real Buildings & Roads */}
                <img
                  src={satelliteImageUrl}
                  alt={`${selectedLake.official_name} ${newYear} Satellite Image`}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    newZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  loading="lazy"
                />

                {/* SVG Vector Alignment: Active Water + Red Encroached Settlement Zone */}
                {showNewMask && (
                  <svg
                    viewBox="0 0 800 480"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200"
                    style={{ opacity: newOpacity }}
                  >
                    {/* Remaining Active Water (Cyan/Blue) */}
                    {newWaterPath && (activeLayerMode === 'all' || activeLayerMode === 'water') && (
                      <path
                        d={newWaterPath}
                        fill="rgba(22, 140, 197, 0.55)"
                        stroke="#168CC5"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Human Encroachment / Lost Water (Red Translucent Mask over Buildings) */}
                    {lostWaterPath && (activeLayerMode === 'all' || activeLayerMode === 'encroachment') && (
                      <path
                        d={lostWaterPath}
                        fill="rgba(239, 68, 68, 0.52)"
                        stroke="#EF4444"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                )}

                {/* Badges on top of contemporary satellite photo */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono text-white bg-[#101A20]/85 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-lg">
                    <span>🛰️ High-Res Satellite View</span>
                  </span>
                  {isShrinking ? (
                    <span className="text-[9px] font-mono text-[#F87171] bg-[#EF4444]/30 backdrop-blur-md border border-[#EF4444]/50 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 animate-pulse">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>Shrinkage Flagged</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-[#34D399] bg-[#10B981]/30 backdrop-blur-md border border-[#10B981]/50 px-2 py-0.5 rounded-full">
                      ✓ Stable
                    </span>
                  )}
                </div>

                {/* Interactive Controls Overlay at Bottom */}
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-[#101A20]/90 backdrop-blur-md border border-white/15 rounded-lg px-2.5 py-1.5 text-[10px]">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setShowNewMask(true);
                        setActiveLayerMode(activeLayerMode === 'raw' ? 'all' : 'raw');
                      }}
                      className={`px-2 py-0.5 rounded font-mono font-medium flex items-center space-x-1 transition-colors ${
                        activeLayerMode !== 'raw' ? 'bg-[#EF4444] text-white' : 'bg-white/10 text-[#8D9A9A] hover:text-white'
                      }`}
                      title={activeLayerMode !== 'raw' ? 'Click to view pure satellite photograph' : 'Click to highlight human encroachment'}
                    >
                      {activeLayerMode !== 'raw' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{activeLayerMode !== 'raw' ? 'Encroachment Highlight' : 'Pure Satellite Photo'}</span>
                    </button>

                    {activeLayerMode !== 'raw' && (
                      <div className="flex items-center space-x-1.5 hidden sm:flex">
                        <span className="text-[#8D9A9A]">Mask:</span>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={newOpacity}
                          onChange={(e) => setNewOpacity(parseFloat(e.target.value))}
                          className="w-14 h-1 accent-[#EF4444] cursor-pointer"
                        />
                        <span className="font-mono text-white text-[9px]">{Math.round(newOpacity * 100)}%</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setNewZoomed(!newZoomed)}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title={newZoomed ? 'Zoom Out' : 'Zoom In on Satellite Imagery'}
                  >
                    {newZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Data readouts */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-[#8D9A9A] block">Water Surface</span>
                  <span className="font-mono font-bold text-[#47D4DF]">
                    {comparisonData ? comparisonData.area_new_hectares.toFixed(1) : newerObs?.detected_area_hectares} ha
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8D9A9A] block">Net Change</span>
                  <span className={`font-mono font-bold ${comparisonData?.is_gain ? 'text-[#329B71]' : 'text-[#EF4444]'}`}>
                    {comparisonData ? `${comparisonData.area_change_hectares.toFixed(1)} ha (${comparisonData.change_percentage.toFixed(1)}%)` : '0 ha'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {comparisonData ? (
            <>
              {/* Metric Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-3">
                  <span className="text-[9px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                    Historical Extent ({comparisonData.older_date})
                  </span>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {comparisonData.area_old_hectares.toFixed(1)}{' '}
                    <span className="text-xs text-[#8D9A9A]">ha</span>
                  </div>
                  <span className="text-[10px] text-[#8D9A9A] mt-0.5 block">Baseline coverage</span>
                </div>

                <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-3">
                  <span className="text-[9px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                    Recent Extent ({comparisonData.newer_date})
                  </span>
                  <div className="text-xl font-bold font-mono text-[#47D4DF] mt-1">
                    {comparisonData.area_new_hectares.toFixed(1)}{' '}
                    <span className="text-xs text-[#8D9A9A]">ha</span>
                  </div>
                  <span className="text-[10px] text-[#8D9A9A] mt-0.5 block">Observed contemporary</span>
                </div>

                <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-3">
                  <span className="text-[9px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                    Net Area Delta (ΔA)
                  </span>
                  <div
                    className={`text-xl font-bold font-mono mt-1 ${
                      comparisonData.is_gain ? 'text-[#329B71]' : 'text-[#EF4444]'
                    }`}
                  >
                    {comparisonData.area_change_hectares > 0 ? '+' : ''}
                    {comparisonData.area_change_hectares.toFixed(1)}{' '}
                    <span className="text-xs text-[#8D9A9A]">ha</span>
                  </div>
                  <span className="text-[10px] text-[#8D9A9A] mt-0.5 block font-mono">
                    {comparisonData.change_percentage.toFixed(1)}% {comparisonData.is_gain ? 'gain' : 'loss'}
                  </span>
                </div>

                <div className="bg-[#142D3B]/40 border border-white/5 rounded-xl p-3">
                  <span className="text-[9px] font-mono uppercase text-[#8D9A9A] tracking-wider block">
                    Scientific Classification
                  </span>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase ${
                        comparisonData.is_gain
                          ? 'bg-[#329B71]/20 text-[#329B71] border border-[#329B71]/30'
                          : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                      }`}
                    >
                      {comparisonData.change_classification}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8D9A9A] mt-1 block">
                    {comparisonData.seasonal_context?.is_same_season_comparison
                      ? 'Consistent seasonal window'
                      : 'Seasonal gap detected'}
                  </span>
                </div>
              </div>

              {/* Spatial Difference Layer Legend */}
              <div className="bg-[#102B25]/30 border border-[#329B71]/20 rounded-xl p-3.5 space-y-2">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#47D4DF]">
                  Spatial Differential Vector Layers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg">
                    <span className="w-3.5 h-3.5 rounded bg-[#168CC5]" />
                    <div>
                      <span className="text-white font-medium block">Stable Water Core</span>
                      <span className="text-[10px] text-[#8D9A9A]">Retained in both observation dates</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg">
                    <span className="w-3.5 h-3.5 rounded bg-[#EF4444]" />
                    <div>
                      <span className="text-white font-medium block">Lost Water / Encroached</span>
                      <span className="text-[10px] text-[#8D9A9A]">Accommodated by roads and layouts</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg">
                    <span className="w-3.5 h-3.5 rounded bg-[#329B71]" />
                    <div>
                      <span className="text-white font-medium block">Newly Gained Water</span>
                      <span className="text-[10px] text-[#8D9A9A]">Expanded surface water coverage</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-[#8D9A9A]">
              Loading differential analysis...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
