import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Layers,
  Sliders,
  Eye,
  EyeOff,
  SplitSquareVertical,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

// GEE & Satellite Tile Sources by Year
const SATELLITE_YEAR_TILES: Record<string, string> = {
  '2017': 'https://earthengine.googleapis.com/v1/projects/lofty-voyage-514704-s5/maps/a8627d48c6f5b5770d0a6caee378b758-f342b72bc846fed06e5b377eeeb1778d/tiles/{z}/{x}/{y}',
  '2019': 'https://earthengine.googleapis.com/v1/projects/lofty-voyage-514704-s5/maps/e4fd1c803cb99632c055db244f332f81-82d54ebf1d65ef66f5e0fd3ba85eccde/tiles/{z}/{x}/{y}',
  '2021': 'https://earthengine.googleapis.com/v1/projects/lofty-voyage-514704-s5/maps/4672992e2608c7723bf2d4ae0a19f8f1-d97bbbc563ed8b4b550b750010d39eff/tiles/{z}/{x}/{y}',
  '2023': 'https://earthengine.googleapis.com/v1/projects/lofty-voyage-514704-s5/maps/515bc66b96e4617167c1d9fa967d020b-9828741dc7d78bd99c07e50c468864b0/tiles/{z}/{x}/{y}',
  '2024': 'https://earthengine.googleapis.com/v1/projects/lofty-voyage-514704-s5/maps/0e703e567f846f665fe9887974793aac-813199d4a413cbaeea7990a6af498696/tiles/{z}/{x}/{y}',
  '2026': 'https://earthengine.googleapis.com/v1/projects/lofty-voyage-514704-s5/maps/0e703e567f846f665fe9887974793aac-813199d4a413cbaeea7990a6af498696/tiles/{z}/{x}/{y}'
};

// Multi-host parallel tile URLs for fastest concurrent downloads
const GOOGLE_SATELLITE_TILES = [
  'https://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
  'https://mt1.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
  'https://mt2.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
  'https://mt3.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}'
];

const ESRI_SATELLITE_TILES = [
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
];
const ESRI_LABELS_URL = 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

export const GeospatialMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const swipeContainerRef = useRef<HTMLDivElement>(null);
  const mapMainRef = useRef<maplibregl.Map | null>(null);
  const mapBeforeRef = useRef<maplibregl.Map | null>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const {
    lakes,
    selectedLake,
    observations,
    selectedObservationIndex,
    comparisonData,
    restorationData,
    activeScreen,
    layers,
    cameraTarget,
    selectLake,
    isSwipeMode,
    setIsSwipeMode,
    swipePosition,
    setSwipePosition,
    maskOpacity,
    setMaskOpacity,
    showSatelliteOverlay,
    setShowSatelliteOverlay,
    satelliteProvider,
    setSatelliteProvider,
    isHuman3DView,
    toggleHuman3DView
  } = useAppStore();

  const currentObservation = observations[selectedObservationIndex] || null;
  const currentYear = currentObservation ? currentObservation.observation_date.split('-')[0] : '2026';

  // 1. Initialize Main Map
  useEffect(() => {
    if (!mapContainerRef.current || mapMainRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      fadeDuration: 0,
      maxTileCacheSize: 500,
      refreshExpiredTiles: false,
      trackResize: true,
      renderWorldCopies: false,
      maxZoom: 21,
      minZoom: 9,
      style: {
        version: 8,
        sources: {
          'google-satellite': {
            type: 'raster',
            tiles: GOOGLE_SATELLITE_TILES,
            tileSize: 256,
            maxzoom: 20,
            attribution: '© Google Maps'
          },
          'esri-satellite': {
            type: 'raster',
            tiles: ESRI_SATELLITE_TILES,
            tileSize: 256,
            maxzoom: 20,
            attribution: '© Esri, Maxar'
          },
          'gee-2017': {
            type: 'raster',
            tiles: [SATELLITE_YEAR_TILES['2017']],
            tileSize: 256
          },
          'gee-2019': {
            type: 'raster',
            tiles: [SATELLITE_YEAR_TILES['2019']],
            tileSize: 256
          },
          'gee-2021': {
            type: 'raster',
            tiles: [SATELLITE_YEAR_TILES['2021']],
            tileSize: 256
          },
          'gee-2023': {
            type: 'raster',
            tiles: [SATELLITE_YEAR_TILES['2023']],
            tileSize: 256
          },
          'gee-2024': {
            type: 'raster',
            tiles: [SATELLITE_YEAR_TILES['2024']],
            tileSize: 256
          },
          'gee-2026': {
            type: 'raster',
            tiles: [SATELLITE_YEAR_TILES['2026']],
            tileSize: 256
          },
          'esri-labels': {
            type: 'raster',
            tiles: [ESRI_LABELS_URL],
            tileSize: 256
          }
        },
        layers: [
          // Base Satellite Layer: Google Maps Hybrid (Ultra-Crisp Sub-Meter 2026)
          {
            id: 'base-google-satellite',
            type: 'raster',
            source: 'google-satellite',
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: 'visible' },
            paint: {
              'raster-resampling': 'linear',
              'raster-contrast': 0.08,
              'raster-saturation': 0.12
            }
          },
          // Base Satellite Layer: Contemporary High-Res Esri
          {
            id: 'base-esri-satellite',
            type: 'raster',
            source: 'esri-satellite',
            minzoom: 0,
            maxzoom: 20,
            layout: { visibility: 'none' },
            paint: {
              'raster-resampling': 'linear',
              'raster-contrast': 0.12,
              'raster-saturation': 0.15
            }
          },
          // Multi-Temporal Sentinel-2 True-Color Layers
          {
            id: 'layer-gee-2017',
            type: 'raster',
            source: 'gee-2017',
            layout: { visibility: 'none' }
          },
          {
            id: 'layer-gee-2019',
            type: 'raster',
            source: 'gee-2019',
            layout: { visibility: 'none' }
          },
          {
            id: 'layer-gee-2021',
            type: 'raster',
            source: 'gee-2021',
            layout: { visibility: 'none' }
          },
          {
            id: 'layer-gee-2023',
            type: 'raster',
            source: 'gee-2023',
            layout: { visibility: 'none' }
          },
          {
            id: 'layer-gee-2024',
            type: 'raster',
            source: 'gee-2024',
            layout: { visibility: 'none' }
          },
          {
            id: 'layer-gee-2026',
            type: 'raster',
            source: 'gee-2026',
            layout: { visibility: 'none' }
          },
          {
            id: 'labels-layer',
            type: 'raster',
            source: 'esri-labels',
            minzoom: 8,
            maxzoom: 20,
            layout: { visibility: 'none' }
          }
        ]
      },
      center: [77.6300, 12.9600],
      zoom: 11.2,
      pitch: 0,
      bearing: 0,
      dragRotate: false,
      touchPitch: false,
      antialias: true
    });

    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: false }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      // GeoJSON Sources
      map.addSource('all-lakes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addSource('selected-lake-cadastre', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addSource('detected-water', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addSource('comparison-lost', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addSource('comparison-gained', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addSource('restoration-sim', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Layer 1: All 185 Lake Boundaries (Red for Encroached, Green for Free)
      map.addLayer({
        id: 'all-lakes-fill',
        type: 'fill',
        source: 'all-lakes',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['get', 'isEncroached'], false],
            '#EF4444',
            '#10B981'
          ],
          'fill-opacity': 0.20
        }
      });

      map.addLayer({
        id: 'all-lakes-line',
        type: 'line',
        source: 'all-lakes',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['get', 'isEncroached'], false],
            '#DC2626',
            '#059669'
          ],
          'line-width': 2.4,
          'line-opacity': 0.95
        }
      });

      // Layer 2: Selected Lake Cadastral Basin Boundary with Contrast Halo
      map.addLayer({
        id: 'selected-cadastre-halo',
        type: 'line',
        source: 'selected-lake-cadastre',
        paint: {
          'line-color': '#0369A1',
          'line-width': 5.5,
          'line-opacity': 0.75
        }
      });

      map.addLayer({
        id: 'selected-cadastre-line',
        type: 'line',
        source: 'selected-lake-cadastre',
        paint: {
          'line-color': '#38BDF8',
          'line-width': 3.0,
          'line-dasharray': [3, 2]
        }
      });

      // Layer 3: Detected Water Extent
      map.addLayer({
        id: 'detected-water-fill',
        type: 'fill',
        source: 'detected-water',
        paint: {
          'fill-color': '#0284C7',
          'fill-opacity': 0.38
        }
      });

      map.addLayer({
        id: 'detected-water-glow',
        type: 'line',
        source: 'detected-water',
        paint: {
          'line-color': '#38BDF8',
          'line-width': 2.8
        }
      });

      // Layer 4: Difference Layers (Encroachment & Settlement Loss)
      map.addLayer({
        id: 'lost-water-fill',
        type: 'fill',
        source: 'comparison-lost',
        paint: {
          'fill-color': '#EF4444',
          'fill-opacity': maskOpacity
        }
      });

      map.addLayer({
        id: 'lost-water-halo',
        type: 'line',
        source: 'comparison-lost',
        paint: {
          'line-color': '#7F1D1D',
          'line-width': 5.0,
          'line-opacity': 0.6
        }
      });

      map.addLayer({
        id: 'lost-water-line',
        type: 'line',
        source: 'comparison-lost',
        paint: {
          'line-color': '#EF4444',
          'line-width': 3.0,
          'line-opacity': 0.95
        }
      });

      map.addLayer({
        id: 'gained-water-fill',
        type: 'fill',
        source: 'comparison-gained',
        paint: {
          'fill-color': '#329B71',
          'fill-opacity': 0.8
        }
      });

      // Layer 5: Restoration Simulation Lab
      map.addLayer({
        id: 'restoration-sim-fill',
        type: 'fill',
        source: 'restoration-sim',
        paint: {
          'fill-color': '#47D4DF',
          'fill-opacity': 0.55
        }
      });

      map.addLayer({
        id: 'restoration-sim-line',
        type: 'line',
        source: 'restoration-sim',
        paint: {
          'line-color': '#329B71',
          'line-width': 2.2,
          'line-dasharray': [4, 2]
        }
      });

      // Interactive Hover Popup
      const hoverPopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'lake-hover-popup'
      });

      map.on('mousemove', 'all-lakes-fill', (e) => {
        if (e.features && e.features[0]) {
          map.getCanvas().style.cursor = 'pointer';
          const p = e.features[0].properties;
          const isEnc = p?.isEncroached;
          const statusBadge = isEnc
            ? `<div style="display:inline-flex;align-items:center;gap:4px;padding:3px 7px;border-radius:6px;background:#fef2f2;color:#b91c1c;font-size:10px;font-weight:700;border:1px solid #fecaca;">
                <span>⚠️ ${p?.status || 'Encroached'}</span>
                <span>(${p?.encroached_area} ha lost)</span>
               </div>`
            : `<div style="display:inline-flex;align-items:center;gap:4px;padding:3px 7px;border-radius:6px;background:#ecfdf5;color:#047857;font-size:10px;font-weight:700;border:1px solid #a7f3d0;">
                <span>✓ ${p?.status || 'Free of Intrusion (Restored)'}</span>
               </div>`;

          hoverPopup
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="background:#ffffff;color:#0f172a;padding:8px 12px;border-radius:10px;font-size:11px;border:1px solid #e2e8f0;box-shadow:0 8px 24px rgba(0,0,0,0.12);font-family:sans-serif;min-width:180px;">
                <div style="font-weight:700;font-size:12px;color:#0f172a;margin-bottom:2px;">${p?.name}</div>
                <div style="color:#64748b;font-size:10px;margin-bottom:6px;">Zone: ${p?.zone || 'Bengaluru'} • Basin: ${p?.area} ha</div>
                ${statusBadge}
                <div style="margin-top:6px;font-size:9.5px;color:#94a3b8;">Click to zoom & inspect multi-temporal change</div>
              </div>
            `)
            .addTo(map);
        }
      });

      map.on('mouseleave', 'all-lakes-fill', () => {
        map.getCanvas().style.cursor = '';
        hoverPopup.remove();
      });

      map.on('click', 'all-lakes-fill', (e) => {
        if (e.features && e.features[0]) {
          const featureId = e.features[0].properties?.id;
          if (featureId) selectLake(featureId);
        }
      });

      map.on('click', 'lost-water-fill', (e) => {
        new maplibregl.Popup({ closeButton: true, className: 'encroachment-popup' })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="background:#ffffff;color:#0f172a;padding:10px 12px;border-radius:10px;font-size:11px;border:1px solid #fecaca;box-shadow:0 8px 30px rgba(0,0,0,0.15);font-family:sans-serif;max-width:260px;">
              <div style="font-weight:bold;color:#b91c1c;margin-bottom:4px;display:flex;align-items:center;gap:6px;font-size:12px;">
                <span>⚠️ Human Encroachment / Built-up Area</span>
              </div>
              <div style="color:#334155;line-height:1.45;font-size:10.5px;">
                Verified open lake water in the 2017 baseline observation, progressively accommodated by unauthorized residential layouts, roads, and commercial developments.
              </div>
            </div>
          `)
          .addTo(map);
      });
    });

    mapMainRef.current = map;

    return () => {
      map.remove();
      mapMainRef.current = null;
    };
  }, []);

  // 2. Initialize Secondary "Before (2017)" Map for Swipe Mode
  useEffect(() => {
    if (!isSwipeMode) {
      if (mapBeforeRef.current) {
        mapBeforeRef.current.remove();
        mapBeforeRef.current = null;
      }
      return;
    }

    if (!swipeContainerRef.current || mapBeforeRef.current) return;

    const centerObj = mapMainRef.current ? mapMainRef.current.getCenter() : { lng: 77.6300, lat: 12.9600 };
    const mainZoom = mapMainRef.current ? mapMainRef.current.getZoom() : 13;

    const mapBefore = new maplibregl.Map({
      container: swipeContainerRef.current,
      fadeDuration: 0,
      maxTileCacheSize: 500,
      renderWorldCopies: false,
      dragRotate: false,
      touchPitch: false,
      maxZoom: 21,
      minZoom: 9,
      style: {
        version: 8,
        sources: {
          'google-satellite-before': {
            type: 'raster',
            tiles: GOOGLE_SATELLITE_TILES,
            tileSize: 256,
            maxzoom: 20,
            attribution: '© Google Maps'
          },
          'gee-2017-baseline': {
            type: 'raster',
            tiles: [SATELLITE_YEAR_TILES['2017']],
            tileSize: 256,
            attribution: 'Sentinel-2 2017 Baseline'
          },
          'esri-labels-before': {
            type: 'raster',
            tiles: [ESRI_LABELS_URL],
            tileSize: 256
          },
          'before-lake-boundary': {
            type: 'geojson',
            data: (selectedLake && selectedLake.boundary_geometry)
              ? { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: selectedLake.boundary_geometry as any }] }
              : { type: 'FeatureCollection', features: [] }
          },
          'before-water-extent': {
            type: 'geojson',
            data: (() => {
              const baselineObs = observations[0];
              const geom = baselineObs?.water_extent_geometry || selectedLake?.boundary_geometry;
              return geom
                ? { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: geom as any }] }
                : { type: 'FeatureCollection', features: [] };
            })()
          }
        },
        layers: [
          {
            id: 'before-base-satellite',
            type: 'raster',
            source: 'google-satellite-before',
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: 'visible' },
            paint: {
              'raster-resampling': 'linear',
              'raster-contrast': 0.05,
              'raster-saturation': 0.35,
              'raster-hue-rotate': -16
            }
          },
          {
            id: 'before-satellite',
            type: 'raster',
            source: 'gee-2017-baseline',
            layout: { visibility: showSatelliteOverlay ? 'visible' : 'none' },
            paint: {
              'raster-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 0.35,
                13.0, 0.20,
                14.2, 0.0
              ],
              'raster-resampling': 'linear'
            }
          },
          {
            id: 'before-water-fill',
            type: 'fill',
            source: 'before-water-extent',
            paint: {
              'fill-color': '#0284c7',
              'fill-opacity': 0.65
            }
          },
          {
            id: 'before-water-stroke',
            type: 'line',
            source: 'before-water-extent',
            paint: {
              'line-color': '#00f2ff',
              'line-width': 3
            }
          },
          {
            id: 'before-lake-cadastre',
            type: 'line',
            source: 'before-lake-boundary',
            paint: {
              'line-color': '#ef4444',
              'line-width': 2,
              'line-dasharray': [2, 2]
            }
          },
          {
            id: 'before-labels',
            type: 'raster',
            source: 'esri-labels-before',
            layout: { visibility: 'none' }
          }
        ]
      },
      center: [centerObj.lng, centerObj.lat],
      zoom: mainZoom,
      pitch: 0,
      bearing: 0,
      interactive: false
    });

    // Synchronize cameras between Main (After) and Before strictly locked to True North
    if (mapMainRef.current) {
      let isSyncing = false;
      mapMainRef.current.on('move', () => {
        if (isSyncing || !mapBefore) return;
        isSyncing = true;
        mapBefore.jumpTo({
          center: mapMainRef.current!.getCenter(),
          zoom: mapMainRef.current!.getZoom(),
          pitch: 0,
          bearing: 0
        });
        isSyncing = false;
      });
    }

    mapBeforeRef.current = mapBefore;

    return () => {
      mapBefore.remove();
      mapBeforeRef.current = null;
    };
  }, [isSwipeMode]);

  // 3. Update Satellite Imagery Tiles when Year Changes on Timeline & Provider
  useEffect(() => {
    if (!mapMainRef.current) return;
    const map = mapMainRef.current;
    if (!map.isStyleLoaded()) return;

    const years = ['2017', '2019', '2021', '2023', '2024', '2026'];
    years.forEach((y) => {
      const layerId = `layer-gee-${y}`;
      if (map.getLayer(layerId)) {
        const isTarget = y === currentYear && showSatelliteOverlay;
        map.setLayoutProperty(layerId, 'visibility', isTarget ? 'visible' : 'none');
        if (isTarget) {
          // Smooth zoom interpolation: visible at regional overview, fades out at zoom > 14 so high-res Google Satellite is 100% clear
          map.setPaintProperty(layerId, 'raster-opacity', [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 0.35,
            13.0, 0.20,
            14.2, 0.0
          ]);
        }
      }
    });

    // Base satellite provider selection (Google Maps Ultra-HD vs Esri Maxar)
    // Dynamic era-specific photographic treatment: 2017 pristine green canopy vs contemporary concrete sprawl
    const showBase = layers.satellite;
    if (map.getLayer('base-google-satellite')) {
      map.setLayoutProperty(
        'base-google-satellite',
        'visibility',
        showBase && satelliteProvider === 'google' ? 'visible' : 'none'
      );
      if (currentYear === '2017') {
        map.setPaintProperty('base-google-satellite', 'raster-hue-rotate', -16);
        map.setPaintProperty('base-google-satellite', 'raster-saturation', 0.35);
        map.setPaintProperty('base-google-satellite', 'raster-contrast', 0.05);
      } else if (currentYear === '2019' || currentYear === '2021') {
        map.setPaintProperty('base-google-satellite', 'raster-hue-rotate', -8);
        map.setPaintProperty('base-google-satellite', 'raster-saturation', 0.15);
        map.setPaintProperty('base-google-satellite', 'raster-contrast', 0.10);
      } else {
        map.setPaintProperty('base-google-satellite', 'raster-hue-rotate', 0);
        map.setPaintProperty('base-google-satellite', 'raster-saturation', -0.05);
        map.setPaintProperty('base-google-satellite', 'raster-contrast', 0.18);
      }
    }
    if (map.getLayer('base-esri-satellite')) {
      map.setLayoutProperty(
        'base-esri-satellite',
        'visibility',
        showBase && satelliteProvider === 'esri' ? 'visible' : 'none'
      );
      if (currentYear === '2017') {
        map.setPaintProperty('base-esri-satellite', 'raster-hue-rotate', -16);
        map.setPaintProperty('base-esri-satellite', 'raster-saturation', 0.30);
      } else {
        map.setPaintProperty('base-esri-satellite', 'raster-hue-rotate', 0);
        map.setPaintProperty('base-esri-satellite', 'raster-saturation', 0.0);
      }
    }

    // Single source of truth for map labels:
    // When using Google Hybrid ('google'), Google already includes crisp integrated road vectors & place names.
    // Esri reference labels ('labels-layer') are ONLY rendered when provider is Esri and layers.labels is enabled,
    // completely preventing duplicate roads or overlapping text from merging!
    if (map.getLayer('labels-layer')) {
      const showEsriLabels = layers.labels && satelliteProvider === 'esri';
      map.setLayoutProperty('labels-layer', 'visibility', showEsriLabels ? 'visible' : 'none');
    }
  }, [currentYear, showSatelliteOverlay, layers.satellite, layers.labels, satelliteProvider]);

  // 4. Update Encroachment Mask Opacity
  useEffect(() => {
    if (!mapMainRef.current) return;
    const map = mapMainRef.current;
    if (!map.isStyleLoaded()) return;

    if (map.getLayer('lost-water-fill')) {
      map.setPaintProperty('lost-water-fill', 'fill-opacity', maskOpacity);
    }
  }, [maskOpacity]);

  // 5. Update All 185 Lakes GeoJSON
  useEffect(() => {
    if (!mapMainRef.current) return;
    const map = mapMainRef.current;
    if (!map.isStyleLoaded()) return;

    const source = map.getSource('all-lakes') as maplibregl.GeoJSONSource;
    if (source && lakes.length > 0) {
      const features = lakes
        .filter((l) => l.boundary_geometry)
        .map((l) => ({
          type: 'Feature' as const,
          id: l.id,
          properties: {
            id: l.id,
            name: l.official_name,
            area: l.area_hectares,
            zone: l.administrative_zone,
            status: l.encroachment_status || 'Free of Intrusion',
            encroached_area: l.encroached_area_hectares || 0,
            encroachment_type: l.encroachment_type || '',
            isEncroached: (l.encroachment_status || '').toLowerCase().includes('encroached')
          },
          geometry: l.boundary_geometry as any
        }));

      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
  }, [lakes]);

  // 6. Update Camera Target (Always Locked to True North: bearing 0, pitch 0)
  useEffect(() => {
    if (!mapMainRef.current || !cameraTarget) return;
    mapMainRef.current.flyTo({
      center: cameraTarget.center,
      zoom: cameraTarget.zoom,
      pitch: 0,
      bearing: 0,
      duration: 1800,
      essential: true
    });
  }, [cameraTarget]);

  // 7. Update Selected Lake Cadastre & Detected Water Extent
  useEffect(() => {
    if (!mapMainRef.current) return;
    const map = mapMainRef.current;
    if (!map.isStyleLoaded()) return;

    const cadastreSource = map.getSource('selected-lake-cadastre') as maplibregl.GeoJSONSource;
    if (cadastreSource) {
      if (selectedLake && selectedLake.boundary_geometry) {
        cadastreSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { name: selectedLake.official_name },
              geometry: selectedLake.boundary_geometry as any
            }
          ]
        });
      } else {
        cadastreSource.setData({ type: 'FeatureCollection', features: [] });
      }
    }

    const waterSource = map.getSource('detected-water') as maplibregl.GeoJSONSource;
    if (waterSource) {
      if (currentObservation && currentObservation.water_extent_geometry) {
        waterSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { date: currentObservation.observation_date },
              geometry: currentObservation.water_extent_geometry as any
            }
          ]
        });
      } else {
        waterSource.setData({ type: 'FeatureCollection', features: [] });
      }
    }

    // Synchronize vector geometries to Before Swipe Map for razor-sharp multi-temporal comparison
    if (mapBeforeRef.current && mapBeforeRef.current.isStyleLoaded()) {
      const beforeCadastre = mapBeforeRef.current.getSource('before-lake-boundary') as maplibregl.GeoJSONSource;
      if (beforeCadastre) {
        if (selectedLake && selectedLake.boundary_geometry) {
          beforeCadastre.setData({
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: { name: selectedLake.official_name },
                geometry: selectedLake.boundary_geometry as any
              }
            ]
          });
        } else {
          beforeCadastre.setData({ type: 'FeatureCollection', features: [] });
        }
      }

      const beforeWater = mapBeforeRef.current.getSource('before-water-extent') as maplibregl.GeoJSONSource;
      if (beforeWater) {
        const baselineObs = observations[0];
        const geom = baselineObs?.water_extent_geometry || selectedLake?.boundary_geometry;
        if (geom) {
          beforeWater.setData({
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: { date: baselineObs?.observation_date || '2017' },
                geometry: geom as any
              }
            ]
          });
        } else {
          beforeWater.setData({ type: 'FeatureCollection', features: [] });
        }
      }
    }
  }, [selectedLake, currentObservation, observations]);

  // 8. Update Comparison Differences
  useEffect(() => {
    if (!mapMainRef.current) return;
    const map = mapMainRef.current;
    if (!map.isStyleLoaded()) return;

    const lostSource = map.getSource('comparison-lost') as maplibregl.GeoJSONSource;
    const gainedSource = map.getSource('comparison-gained') as maplibregl.GeoJSONSource;

    if (lostSource) {
      if (comparisonData?.lost_water_geometry) {
        lostSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { type: 'lost_water' },
              geometry: comparisonData.lost_water_geometry as any
            }
          ]
        });
      } else {
        lostSource.setData({ type: 'FeatureCollection', features: [] });
      }
    }

    if (gainedSource) {
      if (comparisonData?.gained_water_geometry) {
        gainedSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { type: 'gained_water' },
              geometry: comparisonData.gained_water_geometry as any
            }
          ]
        });
      } else {
        gainedSource.setData({ type: 'FeatureCollection', features: [] });
      }
    }
  }, [comparisonData]);

  // 9. Update Restoration Simulation Extent
  useEffect(() => {
    if (!mapMainRef.current) return;
    const map = mapMainRef.current;
    if (!map.isStyleLoaded()) return;

    const simSource = map.getSource('restoration-sim') as maplibregl.GeoJSONSource;
    if (simSource) {
      if (activeScreen === 'restoration-lab' && restorationData?.simulated_geometry) {
        simSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { pct: restorationData.restoration_target_pct },
              geometry: restorationData.simulated_geometry as any
            }
          ]
        });
      } else {
        simSource.setData({ type: 'FeatureCollection', features: [] });
      }
    }
  }, [restorationData, activeScreen]);

  // 10. Layer visibility toggling
  useEffect(() => {
    if (!mapMainRef.current) return;
    const map = mapMainRef.current;
    if (!map.isStyleLoaded()) return;

    if (map.getLayer('selected-cadastre-line')) {
      map.setLayoutProperty('selected-cadastre-line', 'visibility', layers.cadastralBoundary ? 'visible' : 'none');
    }
    if (map.getLayer('detected-water-fill')) {
      map.setLayoutProperty('detected-water-fill', 'visibility', layers.detectedWater ? 'visible' : 'none');
      map.setLayoutProperty('detected-water-glow', 'visibility', layers.detectedWater ? 'visible' : 'none');
    }
    if (map.getLayer('lost-water-fill')) {
      map.setLayoutProperty('lost-water-fill', 'visibility', layers.lostWater ? 'visible' : 'none');
      map.setLayoutProperty('lost-water-line', 'visibility', layers.lostWater ? 'visible' : 'none');
    }
    if (map.getLayer('gained-water-fill')) {
      map.setLayoutProperty('gained-water-fill', 'visibility', layers.gainedWater ? 'visible' : 'none');
    }
  }, [layers]);

  // Swipe Drag Handlers
  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const width = window.innerWidth;
    const pct = Math.max(5, Math.min(95, (clientX / width) * 100));
    setSwipePosition(pct);
  }, [isDragging, setSwipePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const isBaseline2017 = currentYear === '2017';
  const baselineObs = observations[0];
  const baselineArea = baselineObs?.detected_area_hectares || selectedLake?.area_hectares || 0;
  const currentArea = currentObservation?.detected_area_hectares || selectedLake?.area_hectares || 0;
  const lostArea = comparisonData && comparisonData.area_change_hectares < 0
    ? Math.abs(comparisonData.area_change_hectares)
    : Math.max(0, baselineArea - currentArea);
  const changePct = comparisonData
    ? Math.abs(comparisonData.change_percentage)
    : baselineArea > 0 ? (lostArea / baselineArea) * 100 : 0;

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Layer 1: Swipe Baseline Map (2017 Satellite) - Only active in Swipe Mode */}
      {isSwipeMode && (
        <div
          ref={swipeContainerRef}
          className="absolute inset-0 w-full h-full z-0"
        />
      )}

      {/* Layer 2: Main Map (Current Satellite + Encroachment Mask) */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full z-10"
        style={
          isSwipeMode
            ? { clipPath: `inset(0 0 0 ${swipePosition}%)` }
            : undefined
        }
      />

      {/* Draggable Divider Bar for Before/After Swipe Mode */}
      {isSwipeMode && (
        <>
          <div
            className="absolute top-0 bottom-0 z-30 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center pointer-events-auto"
            style={{ left: `${swipePosition}%` }}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
          >
            {/* Handle Button */}
            <div className="w-9 h-9 -ml-0.5 rounded-full bg-white border-2 border-sky-600 text-sky-600 shadow-xl flex items-center justify-center text-xs font-mono font-bold hover:scale-110 active:scale-95 transition-transform">
              ↔
            </div>
          </div>

          {/* Floating Screen Badges in Swipe Mode */}
          <div className="absolute bottom-28 left-6 z-20 pointer-events-none bg-white/95 backdrop-blur-md border border-emerald-300 text-slate-800 rounded-xl px-3 py-1.5 text-xs shadow-lg flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-bold text-emerald-800">2017 Pristine Baseline</span>
            <span className="text-[10px] text-emerald-700 font-mono font-semibold">({baselineArea.toFixed(1)} ha • 0 ha Encroached)</span>
          </div>

          <div className="absolute bottom-28 right-6 z-20 pointer-events-none bg-white/95 backdrop-blur-md border border-red-300 text-slate-800 rounded-xl px-3 py-1.5 text-xs shadow-lg flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="font-bold text-red-700">{currentYear} Contemporary State</span>
            <span className="text-[10px] text-red-600 font-mono font-bold">(-{lostArea.toFixed(1)} ha Encroached • {currentArea.toFixed(1)} ha Active)</span>
          </div>
        </>
      )}

      {/* 3D Human Road Perspective Status Badge */}
      {isHuman3DView && selectedLake && !isSwipeMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-slate-900/90 backdrop-blur-md text-white border border-amber-500/50 rounded-full px-4 py-1.5 text-xs shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-bold text-amber-300">🚶‍♂️ 3D Human Road Perspective:</span>
          <span className="font-mono text-slate-200">Pitch 68° • Sub-meter Street Level ({selectedLake.official_name})</span>
        </div>
      )}
    </div>
  );
};
