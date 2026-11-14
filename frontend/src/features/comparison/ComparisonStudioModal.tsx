import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
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
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

// Multi-Temporal Sentinel-2 Earth Engine Tile Endpoints by Year
const SATELLITE_YEAR_TILES: Record<string, string> = {
  '2017': 'https://earthengine.googleapis.com/v1/projects/lofty-voyage-514704-s5/maps/a8627d48c6f5b5770d0a6caee378b758-f342b72bc846fed06e5b377eeeb1778d/tiles/{z}/{x}/{y}',
  '2019': 'https://earthengine.googleapis.com/v1/projects/lofty-voyage-514704-s5/maps/e4fd1c803cb99632c055db244f332f81-82d54ebf1d65ef66f5e0fd3ba85eccde/tiles/{z}/{x}/{y}',
  '2021': 'https://earthengine.googleapis.com/v1/projects/lofty-voyage-514704-s5/maps/4672992e2608c7723bf2d4ae0a19f8f1-d97bbbc563ed8b4b550b750010d39eff/tiles/{z}/{x}/{y}',
  '2023': 'https://earthengine.googleapis.com/v1/projects/lofty-voyage-514704-s5/maps/515bc66b96e4617167c1d9fa967d020b-9828741dc7d78bd99c07e50c468864b0/tiles/{z}/{x}/{y}',
  '2024': 'https://earthengine.googleapis.com/v1/projects/lofty-voyage-514704-s5/maps/0e703e567f846f665fe9887974793aac-813199d4a413cbaeea7990a6af498696/tiles/{z}/{x}/{y}'
};

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

  const mapLeftContainerRef = useRef<HTMLDivElement>(null);
  const mapRightContainerRef = useRef<HTMLDivElement>(null);
  const mapLeftRef = useRef<maplibregl.Map | null>(null);
  const mapRightRef = useRef<maplibregl.Map | null>(null);
  const isSyncingRef = useRef<boolean>(false);

  const [showOldMask, setShowOldMask] = useState<boolean>(true);
  const [showNewMask, setShowNewMask] = useState<boolean>(true);

  if (activeScreen !== 'comparison-studio' || !selectedLake) return null;

  const olderObs = observations.find((o) => o.id === comparisonOlderId) || observations[0];
  const newerObs = observations.find((o) => o.id === comparisonNewerId) || observations[observations.length - 1];

  const oldYear = olderObs ? olderObs.observation_date.split('-')[0] : '2017';
  const newYear = newerObs ? newerObs.observation_date.split('-')[0] : '2024';

  const isShrinking = comparisonData && comparisonData.area_change_hectares < 0 && Math.abs(comparisonData.change_percentage) >= 20.0;

  // Initialize and Synchronize Both Multi-Temporal Satellite Maps
  useEffect(() => {
    if (!mapLeftContainerRef.current || !mapRightContainerRef.current) return;

    const center: [number, number] = [selectedLake.longitude, selectedLake.latitude];
    const initialZoom = 14.2;

    const leftTileUrl = SATELLITE_YEAR_TILES[oldYear] || SATELLITE_YEAR_TILES['2017'];
    const rightTileUrl = SATELLITE_YEAR_TILES[newYear] || SATELLITE_YEAR_TILES['2024'];

    // 1. Left Map: Baseline Year Satellite Observation
    const mapLeft = new maplibregl.Map({
      container: mapLeftContainerRef.current,
      style: {
        version: 8,
        sources: {
          'gee-satellite-left': {
            type: 'raster',
            tiles: [leftTileUrl],
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'gee-satellite-layer-left',
            type: 'raster',
            source: 'gee-satellite-left'
          }
        ]
      },
      center: center,
      zoom: initialZoom,
      attributionControl: false
    });

    // 2. Right Map: Comparison Year Satellite Observation
    const mapRight = new maplibregl.Map({
      container: mapRightContainerRef.current,
      style: {
        version: 8,
        sources: {
          'gee-satellite-right': {
            type: 'raster',
            tiles: [rightTileUrl],
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'gee-satellite-layer-right',
            type: 'raster',
            source: 'gee-satellite-right'
          }
        ]
      },
      center: center,
      zoom: initialZoom,
      attributionControl: false
    });

    mapLeftRef.current = mapLeft;
    mapRightRef.current = mapRight;

    // Synchronize cameras across both viewports
    const syncView = (source: maplibregl.Map, target: maplibregl.Map) => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      const c = source.getCenter();
      const z = source.getZoom();
      target.jumpTo({ center: [c.lng, c.lat], zoom: z });
      isSyncingRef.current = false;
    };

    mapLeft.on('move', () => syncView(mapLeft, mapRight));
    mapRight.on('move', () => syncView(mapRight, mapLeft));

    // Add Vector Polygons when loaded
    mapLeft.on('load', () => {
      const waterGeom = olderObs?.water_extent_geometry || selectedLake.boundary_geometry;
      if (waterGeom) {
        mapLeft.addSource('water-old', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: waterGeom as any,
            properties: {}
          }
        });

        mapLeft.addLayer({
          id: 'water-old-fill',
          type: 'fill',
          source: 'water-old',
          paint: {
            'fill-color': '#168CC5',
            'fill-opacity': 0.45
          }
        });

        mapLeft.addLayer({
          id: 'water-old-stroke',
          type: 'line',
          source: 'water-old',
          paint: {
            'line-color': '#47D4DF',
            'line-width': 2.5
          }
        });
      }
      mapLeft.resize();
    });

    mapRight.on('load', () => {
      // 1. Current Water Remaining (Blue)
      if (newerObs?.water_extent_geometry) {
        mapRight.addSource('water-new', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: newerObs.water_extent_geometry as any,
            properties: {}
          }
        });

        mapRight.addLayer({
          id: 'water-new-fill',
          type: 'fill',
          source: 'water-new',
          paint: {
            'fill-color': '#168CC5',
            'fill-opacity': 0.5
          }
        });

        mapRight.addLayer({
          id: 'water-new-stroke',
          type: 'line',
          source: 'water-new',
          paint: {
            'line-color': '#38BDF8',
            'line-width': 2
          }
        });
      }

      // 2. Lost Water / Encroached Settlement (Red)
      if (comparisonData?.lost_water_geometry) {
        mapRight.addSource('water-lost', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: comparisonData.lost_water_geometry as any,
            properties: {}
          }
        });

        mapRight.addLayer({
          id: 'water-lost-fill',
          type: 'fill',
          source: 'water-lost',
          paint: {
            'fill-color': '#EF4444',
            'fill-opacity': 0.52
          }
        });

        mapRight.addLayer({
          id: 'water-lost-stroke',
          type: 'line',
          source: 'water-lost',
          paint: {
            'line-color': '#EF4444',
            'line-width': 2.5,
            'line-dasharray': [3, 2]
          }
        });
      }
      mapRight.resize();
    });

    // Handle initial modal layout expansion
    const resizeTimer = setTimeout(() => {
      mapLeft.resize();
      mapRight.resize();
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
      mapLeft.remove();
      mapRight.remove();
      mapLeftRef.current = null;
      mapRightRef.current = null;
    };
  }, [selectedLake, oldYear, newYear, comparisonOlderId, comparisonNewerId]);

  // Toggle vector masks on and off
  const toggleOldMask = () => {
    const next = !showOldMask;
    setShowOldMask(next);
    const map = mapLeftRef.current;
    if (map && map.getLayer('water-old-fill')) {
      map.setLayoutProperty('water-old-fill', 'visibility', next ? 'visible' : 'none');
      map.setLayoutProperty('water-old-stroke', 'visibility', next ? 'visible' : 'none');
    }
  };

  const toggleNewMask = () => {
    const next = !showNewMask;
    setShowNewMask(next);
    const map = mapRightRef.current;
    if (map) {
      if (map.getLayer('water-lost-fill')) {
        map.setLayoutProperty('water-lost-fill', 'visibility', next ? 'visible' : 'none');
        map.setLayoutProperty('water-lost-stroke', 'visibility', next ? 'visible' : 'none');
      }
      if (map.getLayer('water-new-fill')) {
        map.setLayoutProperty('water-new-fill', 'visibility', next ? 'visible' : 'none');
        map.setLayoutProperty('water-new-stroke', 'visibility', next ? 'visible' : 'none');
      }
    }
  };

  const handleZoom = (delta: number) => {
    if (mapLeftRef.current) {
      mapLeftRef.current.zoomTo(mapLeftRef.current.getZoom() + delta);
    }
  };

  const handleResetCamera = () => {
    if (mapLeftRef.current && selectedLake) {
      mapLeftRef.current.flyTo({
        center: [selectedLake.longitude, selectedLake.latitude],
        zoom: 14.2
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#101A20]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101A20] border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#168CC5]/20 text-[#47D4DF]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Side-by-Side Satellite Comparison Studio</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#168CC5]/20 text-[#47D4DF] border border-[#168CC5]/30">
                  {selectedLake.official_name}
                </span>
              </div>
              <p className="text-xs text-[#8D9A9A]">
                Multi-temporal Sentinel-2 imagery: {oldYear} pristine baseline pass vs {newYear} contemporary urban encroachment
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
          {/* Synchronized Side-by-Side Satellite Viewports */}
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

              {/* MapLibre Synchronized Satellite Map Container */}
              <div className="relative h-64 md:h-72 rounded-xl overflow-hidden border border-white/15 bg-[#0B1216] shadow-inner">
                <div ref={mapLeftContainerRef} className="w-full h-full" />

                {/* Badges on top of satellite photo */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 pointer-events-none">
                  <span className="text-[10px] font-mono text-white bg-[#101A20]/85 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-lg">
                    <span>🛰️ Sentinel-2 {oldYear} True-Color Pass</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#34D399] bg-[#10B981]/25 backdrop-blur-md border border-[#10B981]/50 px-2 py-0.5 rounded-full font-semibold">
                    Full Water Body Extent
                  </span>
                </div>

                {/* Interactive Controls Overlay at Bottom */}
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-[#101A20]/90 backdrop-blur-md border border-white/15 rounded-lg px-2.5 py-1.5 text-[10px]">
                  <button
                    onClick={toggleOldMask}
                    className={`px-2.5 py-1 rounded font-mono font-medium flex items-center space-x-1.5 transition-colors ${
                      showOldMask ? 'bg-[#168CC5] text-white' : 'bg-white/10 text-[#8D9A9A] hover:text-white'
                    }`}
                    title={showOldMask ? 'Click to see 100% pure photographic satellite imagery' : 'Click to show detected water boundary'}
                  >
                    {showOldMask ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{showOldMask ? 'Water Boundary Mask' : 'Pure Satellite Photo'}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleZoom(0.5)}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleZoom(-0.5)}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleResetCamera}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Reset Center"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
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
                  <span className="text-[10px] text-[#8D9A9A] block">Sensor / Resolution</span>
                  <span className="text-white text-[11px] truncate block font-mono">
                    Sentinel-2 MSI • 10m Ground Res
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

              {/* MapLibre Synchronized Satellite Map Container */}
              <div className="relative h-64 md:h-72 rounded-xl overflow-hidden border border-white/15 bg-[#0B1216] shadow-inner">
                <div ref={mapRightContainerRef} className="w-full h-full" />

                {/* Badges on top of contemporary satellite photo */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 pointer-events-none">
                  <span className="text-[10px] font-mono text-white bg-[#101A20]/85 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-lg">
                    <span>🛰️ Sentinel-2 {newYear} True-Color Pass</span>
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
                  <button
                    onClick={toggleNewMask}
                    className={`px-2.5 py-1 rounded font-mono font-medium flex items-center space-x-1.5 transition-colors ${
                      showNewMask ? 'bg-[#EF4444] text-white' : 'bg-white/10 text-[#8D9A9A] hover:text-white'
                    }`}
                    title={showNewMask ? 'Click to see 100% pure photographic satellite imagery' : 'Click to highlight human encroachment'}
                  >
                    {showNewMask ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{showNewMask ? 'Encroachment Highlight' : 'Pure Satellite Photo'}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleZoom(0.5)}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleZoom(-0.5)}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleResetCamera}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Reset Center"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
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
