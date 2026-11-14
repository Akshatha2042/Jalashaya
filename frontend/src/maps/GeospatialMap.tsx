import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAppStore } from '../stores/useAppStore';

export const GeospatialMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hoverPopupRef = useRef<maplibregl.Popup | null>(null);

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
    selectLake
  } = useAppStore();

  const currentObservation = observations[selectedObservationIndex] || null;

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Dark geospatial style with high-resolution global satellite tiles (Esri World Imagery)
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'esri-satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '© Esri, Maxar, Earthstar Geographics'
          },
          'esri-labels': {
            type: 'raster',
            tiles: [
              'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '© Esri'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            minzoom: 0,
            maxzoom: 20
          },
          {
            id: 'labels-layer',
            type: 'raster',
            source: 'esri-labels',
            minzoom: 8,
            maxzoom: 20
          }
        ]
      },
      center: [77.6300, 12.9600], // Bengaluru Center
      zoom: 11.2,
      pitch: 35,
      bearing: -10,
      antialias: true
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
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

      // Layer 1: All 185 Lake Boundaries (Color-coded: Red for Encroached, Green for Intrusion-Free)
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
          'fill-opacity': 0.28
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
            '#F87171',
            '#34D399'
          ],
          'line-width': 1.6,
          'line-opacity': 0.85
        }
      });

      // Layer 2: Selected Lake Cadastral Basin Boundary
      map.addLayer({
        id: 'selected-cadastre-line',
        type: 'line',
        source: 'selected-lake-cadastre',
        paint: {
          'line-color': '#47D4DF',
          'line-width': 2.8,
          'line-dasharray': [3, 2]
        }
      });

      // Layer 3: Detected Water Extent (Current Observation Year)
      map.addLayer({
        id: 'detected-water-fill',
        type: 'fill',
        source: 'detected-water',
        paint: {
          'fill-color': '#168CC5',
          'fill-opacity': 0.80
        }
      });

      map.addLayer({
        id: 'detected-water-glow',
        type: 'line',
        source: 'detected-water',
        paint: {
          'line-color': '#47D4DF',
          'line-width': 2.0
        }
      });

      // Layer 4: Difference Layers (Accommodated by Human Encroachment / Lost Lakebed)
      map.addLayer({
        id: 'lost-water-fill',
        type: 'fill',
        source: 'comparison-lost',
        paint: {
          'fill-color': '#EF4444',
          'fill-opacity': 0.65
        }
      });

      map.addLayer({
        id: 'lost-water-line',
        type: 'line',
        source: 'comparison-lost',
        paint: {
          'line-color': '#DC2626',
          'line-width': 2.4
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

      // Hover Tooltip Popup for All 185 Lakes
      const hoverPopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'lake-hover-popup'
      });
      hoverPopupRef.current = hoverPopup;

      map.on('mousemove', 'all-lakes-fill', (e) => {
        if (e.features && e.features[0]) {
          map.getCanvas().style.cursor = 'pointer';
          const p = e.features[0].properties;
          const isEnc = p?.isEncroached;
          const statusBadge = isEnc
            ? `<div style="display:inline-flex;align-items:center;gap:4px;padding:3px 7px;border-radius:4px;background:rgba(239,68,68,0.25);color:#F87171;font-size:10px;font-weight:700;border:1px solid rgba(239,68,68,0.5);">
                <span>⚠️ ${p?.status || 'Encroached'}</span>
                <span>(${p?.encroached_area} ha lost)</span>
               </div>`
            : `<div style="display:inline-flex;align-items:center;gap:4px;padding:3px 7px;border-radius:4px;background:rgba(16,185,129,0.25);color:#34D399;font-size:10px;font-weight:700;border:1px solid rgba(16,185,129,0.5);">
                <span>✓ ${p?.status || 'Free of Intrusion (Restored)'}</span>
               </div>`;

          hoverPopup
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="background:#101A20;color:#fff;padding:8px 12px;border-radius:8px;font-size:11px;border:1px solid rgba(255,255,255,0.15);box-shadow:0 8px 24px rgba(0,0,0,0.6);font-family:sans-serif;min-width:180px;">
                <div style="font-weight:700;font-size:12px;color:#F2F5F2;margin-bottom:2px;">${p?.name}</div>
                <div style="color:#8D9A9A;font-size:10px;margin-bottom:6px;">Zone: ${p?.zone || 'Bengaluru'} • Basin: ${p?.area} ha</div>
                ${statusBadge}
                <div style="margin-top:6px;font-size:9.5px;color:#6B7280;">Click to zoom & inspect encroachment history</div>
              </div>
            `)
            .addTo(map);
        }
      });

      map.on('mouseleave', 'all-lakes-fill', () => {
        map.getCanvas().style.cursor = '';
        hoverPopup.remove();
      });

      // Click on any lake polygon to select and fly directly to it
      map.on('click', 'all-lakes-fill', (e) => {
        if (e.features && e.features[0]) {
          const featureId = e.features[0].properties?.id;
          if (featureId) selectLake(featureId);
        }
      });

      // Click on lost water / human encroachment zone for detailed breakdown
      map.on('click', 'lost-water-fill', (e) => {
        new maplibregl.Popup({ closeButton: true, className: 'encroachment-popup' })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="background:#101A20;color:#fff;padding:10px 12px;border-radius:8px;font-size:11px;border:1px solid rgba(239,68,68,0.6);box-shadow:0 8px 30px rgba(0,0,0,0.6);font-family:sans-serif;max-width:260px;">
              <div style="font-weight:bold;color:#F87171;margin-bottom:4px;display:flex;align-items:center;gap:6px;font-size:12px;">
                <span>⚠️ Human Encroachment / Built-up Area</span>
              </div>
              <div style="color:#E5E7EB;line-height:1.45;font-size:10.5px;">
                Verified open lake water in the 2017 baseline observation, progressively accommodated by unauthorized residential layouts, roads, and commercial developments.
              </div>
            </div>
          `)
          .addTo(map);
      });

      map.on('mouseenter', 'lost-water-fill', () => {
        map.getCanvas().style.cursor = 'help';
      });
      map.on('mouseleave', 'lost-water-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Update All 185 Lakes GeoJSON Source
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
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

  // 3. Update Camera Target with smooth flyTo
  useEffect(() => {
    if (!mapRef.current || !cameraTarget) return;
    mapRef.current.flyTo({
      center: cameraTarget.center,
      zoom: cameraTarget.zoom,
      pitch: cameraTarget.pitch,
      bearing: cameraTarget.bearing,
      duration: 2000,
      essential: true
    });
  }, [cameraTarget]);

  // 4. Update Selected Lake Cadastre & Detected Water Extent
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (!map.isStyleLoaded()) return;

    // A. Update Cadastral Boundary
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

    // B. Update Detected Water Extent (Current Observation)
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
  }, [selectedLake, currentObservation]);

  // 5. Update Comparison Differences (Encroachment Overlay)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
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

  // 6. Update Restoration Simulation Extent
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
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

  // 7. Layer visibility toggling
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (!map.isStyleLoaded()) return;

    if (map.getLayer('satellite-layer')) {
      map.setLayoutProperty('satellite-layer', 'visibility', layers.satellite ? 'visible' : 'none');
    }
    if (map.getLayer('labels-layer')) {
      map.setLayoutProperty('labels-layer', 'visibility', layers.labels ? 'visible' : 'none');
    }
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

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* City-Wide Civic Encroachment Audit HUD (Top Right) */}
      <div className="absolute top-4 right-16 z-10 pointer-events-auto bg-[#101A20]/90 backdrop-blur-xl border border-white/10 rounded-xl px-3.5 py-2 shadow-2xl flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
          <span className="font-semibold text-white">136 Encroached</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span className="font-semibold text-white">49 Intrusion-Free</span>
        </div>
        <span className="text-white/20">|</span>
        <span className="font-mono text-[#8D9A9A] text-[11px]">185 BBMP Lakes</span>
      </div>
    </div>
  );
};
