'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Hospital, TransitTelemetry } from '../../lib/types';
import {
  getRoadSnappedRoute,
  getRoadSnappedRouteSync,
  splitRouteByCourier,
} from '../../lib/services/routingService';

interface ChennaiLeafletMapProps {
  hospitals: Hospital[];
  telemetry: TransitTelemetry[];
  selectedHospital: Hospital | null;
  onSelectHospital: (h: Hospital | null) => void;
  selectedCourier: TransitTelemetry | null;
  onSelectCourier: (c: TransitTelemetry | null) => void;
  theme: 'light' | 'dark';
  activeFilter: 'all' | 'emergency' | 'stockout' | 'surplus';
  tileProvider: 'osm' | 'hot' | 'satellite';
  showCorridors: boolean;
  mapZoom: number;
}

// Major Chennai Emergency Green Corridors (Waypoints along Anna Salai, Poonamallee Rd, OMR)
const GREEN_CORRIDORS: [number, number][][] = [
  // Anna Salai (Mount Road): Central / Park Town -> Guindy
  [
    [13.0827, 80.2707],
    [13.0734, 80.2608],
    [13.0567, 80.2505],
    [13.0425, 80.2458],
    [13.0210, 80.2235],
    [13.0068, 80.2080],
  ],
  // Poonamallee High Road: Central -> Kilpauk -> Koyambedu -> Porur
  [
    [13.0825, 80.2750],
    [13.0784, 80.2450],
    [13.0720, 80.2100],
    [13.0519, 80.1873],
    [13.0350, 80.1550],
  ],
  // OMR IT Expressway: Adyar -> Tidel Park -> Sholinganallur
  [
    [13.0068, 80.2570],
    [12.9860, 80.2480],
    [12.9540, 80.2440],
    [12.9010, 80.2280],
  ],
];

export default function ChennaiLeafletMap({
  hospitals,
  telemetry,
  selectedHospital,
  onSelectHospital,
  selectedCourier,
  onSelectCourier,
  theme,
  activeFilter,
  tileProvider,
  showCorridors,
  mapZoom,
}: ChennaiLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const corridorsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Runtime road routes cache for dynamically fetched routes
  const [roadRoutes, setRoadRoutes] = useState<Record<string, [number, number][]>>({});
  const isFirstRender = useRef(true);

  const isDark = theme === 'dark';

  // 1. Initialize Leaflet Map on Mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Central Chennai (between Greams Rd, Egmore, and Thousand Lights)
    const initialCenter: [number, number] = [13.0600, 80.2500];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: mapZoom,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false, // Using custom Apple-style controls
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    // Create Layer Groups for clean updates
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    routesLayerGroupRef.current = L.layerGroup().addTo(map);
    corridorsLayerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Synchronize Tile Layer with theme & tileProvider
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = '';
    let attribution = '';
    let subdomains: string | string[] = 'abc';

    if (tileProvider === 'hot') {
      // Humanitarian OpenStreetMap (Emergency & Medical Logistics - 100% Free, No API key)
      tileUrl = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>';
      subdomains = ['a', 'b', 'c'];
    } else if (tileProvider === 'satellite') {
      // ESRI World Imagery (Satellite Hybrid - 100% Free, No API key)
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; OpenStreetMap contributors';
      subdomains = 'abc';
    } else {
      // OpenStreetMap Standard (Official OSM - 100% Free, No API key)
      tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';
      subdomains = 'abc';
    }

    const newTileLayer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
      subdomains,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [tileProvider, isDark]);

  // 3. Render Green Emergency Corridors
  useEffect(() => {
    const layerGroup = corridorsLayerGroupRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    if (!showCorridors) return;

    GREEN_CORRIDORS.forEach((coords) => {
      // Background glow
      L.polyline(coords, {
        color: '#10B981',
        weight: 8,
        opacity: isDark ? 0.25 : 0.2,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup);

      // Core Corridor line
      L.polyline(coords, {
        color: '#059669',
        weight: 3.5,
        opacity: isDark ? 0.85 : 0.75,
        dashArray: '10, 8',
      }).addTo(layerGroup);
    });
  }, [showCorridors, isDark]);

  // 4. Render Regional Hospital Markers
  useEffect(() => {
    const layerGroup = markersLayerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!layerGroup || !map) return;

    layerGroup.clearLayers();

    // Filter hospitals
    const filtered = hospitals.filter((h) => {
      if (activeFilter === 'emergency') return h.status === 'emergency_active';
      if (activeFilter === 'stockout') return h.status === 'stockout_risk';
      if (activeFilter === 'surplus') return h.status === 'surplus';
      return true;
    });

    filtered.forEach((hospital) => {
      const isSelected = selectedHospital?.id === hospital.id;
      const isEmergency = hospital.status === 'emergency_active';
      const isStockout = hospital.status === 'stockout_risk';
      const isSurplus = hospital.status === 'surplus';

      let coreColor = '#3B82F6';
      let ringColor = 'rgba(59, 130, 246, 0.4)';
      let badgeBg = isDark ? 'bg-[#24262E]/90 border-blue-500/30 text-blue-300' : 'bg-white/95 border-blue-200 text-blue-900';
      let riskTagClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';

      if (isEmergency) {
        coreColor = '#FF375F';
        ringColor = 'rgba(255, 55, 95, 0.45)';
        badgeBg = isDark ? 'bg-[#241217]/95 border-rose-500/40 text-rose-200' : 'bg-rose-50/95 border-rose-300 text-rose-900';
        riskTagClass = 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold';
      } else if (isStockout) {
        coreColor = '#FF9F0A';
        ringColor = 'rgba(255, 159, 10, 0.4)';
        badgeBg = isDark ? 'bg-[#241B12]/95 border-amber-500/40 text-amber-200' : 'bg-amber-50/95 border-amber-300 text-amber-900';
        riskTagClass = 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold';
      } else if (isSurplus) {
        coreColor = '#30D158';
        ringColor = 'rgba(48, 209, 88, 0.4)';
        badgeBg = isDark ? 'bg-[#122417]/95 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50/95 border-emerald-300 text-emerald-900';
        riskTagClass = 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold';
      }

      // Generate sleek Apple DivIcon HTML
      const html = `
        <div class="relative group cursor-pointer" style="transform: translate(-14px, -14px);">
          ${
            isEmergency
              ? `<div class="absolute -inset-2.5 rounded-full bg-rose-500/30 animate-ping"></div>
                 <div class="absolute -inset-1 rounded-full bg-rose-500/20 animate-pulse"></div>`
              : isSelected
              ? `<div class="absolute -inset-2 rounded-full border-2 border-white/60 animate-pulse"></div>`
              : ''
          }
          
          <!-- Core Beacon Circle -->
          <div class="relative w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-115"
               style="background-color: ${coreColor}; box-shadow: 0 0 16px ${ringColor};">
            <div class="w-2.5 h-2.5 rounded-full bg-white shadow-xs"></div>
          </div>

          <!-- Apple Frosted Glass Label Tag -->
          <div class="absolute left-8 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl shadow-md backdrop-blur-xl border flex items-center gap-1.5 transition-all duration-200 group-hover:shadow-lg whitespace-nowrap ${badgeBg}"
               style="font-family: system-ui, -apple-system, sans-serif;">
            <span class="text-[11px] font-semibold tracking-tight">${hospital.shortName}</span>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded-md ${riskTagClass}">
              ${hospital.currentStockUnits}u • ${(hospital.stockoutRisk72h * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html,
        className: 'hospital-marker-div',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([hospital.lat, hospital.lng], { icon: customIcon });

      // Click handler with smooth Apple pan/fly
      marker.on('click', () => {
        onSelectHospital(hospital);
        map.flyTo([hospital.lat, hospital.lng], Math.max(map.getZoom(), 13), { duration: 0.6 });
      });

      // Rich Apple-style frosted popup card
      const popupContent = `
        <div class="p-3.5 rounded-2xl border ${isDark ? 'bg-[#222329]/95 text-white border-white/10' : 'bg-white/95 text-slate-900 border-black/10'} backdrop-blur-2xl shadow-xl w-64 select-none font-sans">
          <div class="flex items-center justify-between pb-2 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isEmergency ? 'bg-rose-500/20 text-rose-400' : isStockout ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }">
              Level ${hospital.traumaLevel} Trauma
            </span>
            <span class="text-[10px] font-mono text-slate-400">Node ID: ${hospital.id}</span>
          </div>
          
          <div class="mt-2">
            <h4 class="text-xs font-bold leading-tight">${hospital.name}</h4>
            <p class="text-[10px] text-slate-400 mt-0.5">${hospital.address}</p>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-1.5 text-[10px] font-mono">
            <div class="p-1.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}">
              <span class="text-slate-400 block text-[9px]">Stock</span>
              <span class="font-bold text-xs">${hospital.currentStockUnits} Units</span>
            </div>
            <div class="p-1.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}">
              <span class="text-slate-400 block text-[9px]">72h Risk</span>
              <span class="font-bold text-xs ${hospital.stockoutRisk72h >= 0.4 ? 'text-amber-400' : 'text-emerald-400'}">
                ${(hospital.stockoutRisk72h * 100).toFixed(0)}%
              </span>
            </div>
            <div class="p-1.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}">
              <span class="text-slate-400 block text-[9px]">Storage</span>
              <span class="font-bold text-xs">${hospital.coldStorageTemp}°C</span>
            </div>
            <div class="p-1.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}">
              <span class="text-slate-400 block text-[9px]">ICU Free</span>
              <span class="font-bold text-xs">${hospital.icuBedsAvailable} / ${hospital.totalBeds}</span>
            </div>
          </div>

          <div class="mt-3 pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'} flex items-center justify-between text-[10px]">
            <span class="text-slate-400 font-mono">ER Dispatch:</span>
            <span class="font-mono font-semibold text-rose-500">${hospital.contactPhone}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -10],
      });

      marker.addTo(layerGroup);
    });
  }, [hospitals, activeFilter, selectedHospital, isDark, onSelectHospital]);

  // 5. Asynchronously Pre-resolve Any Missing Road Routes
  useEffect(() => {
    let isCancelled = false;

    telemetry.forEach(async (courier) => {
      const key = `${courier.originFacilityId}_${courier.destinationFacilityId}`;
      if (roadRoutes[key] || getRoadSnappedRouteSync(courier.originFacilityId, courier.destinationFacilityId)) {
        return;
      }

      const originHospital = hospitals.find((h) => h.id === courier.originFacilityId);
      const destHospital = hospitals.find((h) => h.id === courier.destinationFacilityId);
      if (!originHospital || !destHospital) return;

      const pts = await getRoadSnappedRoute(
        courier.originFacilityId,
        courier.destinationFacilityId,
        [originHospital.lat, originHospital.lng],
        [destHospital.lat, destHospital.lng]
      );

      if (!isCancelled && pts && pts.length > 0) {
        setRoadRoutes((prev) => ({ ...prev, [key]: pts }));
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [telemetry, hospitals, roadRoutes]);

  // Helper to render the courier vehicle DivIcon marker
  const renderCourierMarker = useCallback(
    (
      courier: TransitTelemetry,
      courierPos: [number, number],
      isExcursion: boolean,
      isSelected: boolean,
      layerGroup: L.LayerGroup,
      map: L.Map
    ) => {
      const courierHtml = `
        <div class="relative group cursor-pointer" style="transform: translate(-14px, -14px);">
          <!-- Radar Ping -->
          <div class="absolute -inset-2 rounded-full ${
            isExcursion ? 'bg-rose-500/40 animate-ping' : 'bg-blue-500/30 animate-pulse'
          }"></div>
          ${
            isSelected
              ? `<div class="absolute -inset-2.5 rounded-full border-2 border-white animate-pulse"></div>`
              : ''
          }

          <!-- Vehicle Center Icon -->
          <div class="relative w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
            isExcursion ? 'bg-rose-600' : 'bg-[#0071E3]'
          }">
            <span class="text-white text-[11px] font-bold select-none">
              ${courier.vehicleType === 'Drone Carrier' ? '🛸' : '🚐'}
            </span>
          </div>

          <!-- Floating Telemetry Readout Pill -->
          <div class="absolute left-8 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl shadow-md backdrop-blur-xl border flex items-center gap-1.5 whitespace-nowrap ${
            isExcursion
              ? 'bg-rose-950/95 border-rose-500/50 text-white'
              : isDark
              ? 'bg-[#222329]/95 border-blue-500/30 text-white'
              : 'bg-white/95 border-blue-200 text-slate-900'
          }" style="font-family: system-ui, -apple-system, sans-serif;">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold leading-tight">${courier.courierId} • ${courier.velocityKmH} km/h</span>
              <span class="text-[9px] font-mono ${isExcursion ? 'text-rose-300 font-bold' : 'text-[#0071E3] dark:text-[#5AC8FA] font-medium'}">
                ${courier.currentTemperatureC.toFixed(1)}°C • ETA ${courier.etaMinutes}m ${isExcursion ? '⚠️ EXCURSION' : ''}
              </span>
            </div>
          </div>
        </div>
      `;

      const courierIcon = L.divIcon({
        html: courierHtml,
        className: 'courier-marker-div',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const courierMarker = L.marker(courierPos, { icon: courierIcon });

      courierMarker.on('click', () => {
        onSelectCourier(courier);
        map.flyTo(courierPos, Math.max(map.getZoom(), 13), { duration: 0.6 });
      });

      courierMarker.addTo(layerGroup);
    },
    [isDark, onSelectCourier]
  );

  // 6. Render Active Cold-Chain Courier Vehicles & Turn-by-Turn Road Polylines
  useEffect(() => {
    const layerGroup = routesLayerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!layerGroup || !map) return;

    layerGroup.clearLayers();

    telemetry.forEach((courier) => {
      const isExcursion = courier.excursionFlag;
      const isSelected = selectedCourier?.transferId === courier.transferId;

      const originHospital = hospitals.find((h) => h.id === courier.originFacilityId);
      const destHospital = hospitals.find((h) => h.id === courier.destinationFacilityId);

      const courierPos: [number, number] = [
        courier.currentCoordinates.lat,
        courier.currentCoordinates.lng,
      ];

      const routeKey = `${courier.originFacilityId}_${courier.destinationFacilityId}`;
      const fullRoute =
        roadRoutes[routeKey] ||
        getRoadSnappedRouteSync(courier.originFacilityId, courier.destinationFacilityId);

      if (originHospital && destHospital && fullRoute && fullRoute.length >= 2) {
        // Split road-snapped polyline into traversed vs upcoming segments
        const { snappedCourierPos, completedPath, remainingPath } = splitRouteByCourier(
          fullRoute,
          courierPos
        );

        // A. Highlight halo for selected courier route
        if (isSelected) {
          L.polyline(fullRoute, {
            color: isExcursion ? '#FF375F' : '#38BDF8',
            weight: 10,
            opacity: isDark ? 0.38 : 0.28,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(layerGroup);
        }

        // B. Traversed Road Segment (Origin Hospital -> Courier Location)
        if (completedPath.length >= 2) {
          // Luminous background shadow
          L.polyline(completedPath, {
            color: isExcursion ? '#EF4444' : '#0A84FF',
            weight: isSelected ? 6.5 : 5,
            opacity: isDark ? 0.35 : 0.22,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(layerGroup);

          // Solid core path along actual Chennai road network
          L.polyline(completedPath, {
            color: isExcursion ? '#FF375F' : '#0071E3',
            weight: isSelected ? 3.5 : 2.8,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(layerGroup);
        }

        // C. Remaining Road Segment (Courier Location -> Destination Hospital)
        if (remainingPath.length >= 2) {
          // Soft guidance glow
          L.polyline(remainingPath, {
            color: isExcursion ? '#FF453A' : '#5AC8FA',
            weight: isSelected ? 6 : 4.5,
            opacity: isDark ? 0.25 : 0.16,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(layerGroup);

          // Animated flowing dash along actual Chennai turn-by-turn road network
          L.polyline(remainingPath, {
            color: isExcursion ? '#FF375F' : '#0071E3',
            weight: isSelected ? 3.2 : 2.5,
            dashArray: '8, 8',
            className: 'leaflet-route-dash',
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(layerGroup);
        }

        // Render vehicle marker pinned directly on the snapped road point
        renderCourierMarker(courier, snappedCourierPos, isExcursion, isSelected, layerGroup, map);
      } else if (originHospital && destHospital) {
        // Fallback before road network completes loading
        const fallbackWaypoints: [number, number][] = [
          [originHospital.lat, originHospital.lng],
          courierPos,
          [destHospital.lat, destHospital.lng],
        ];

        L.polyline(fallbackWaypoints, {
          color: isExcursion ? '#FF375F' : '#0071E3',
          weight: 2.5,
          className: 'leaflet-route-dash',
          lineCap: 'round',
        }).addTo(layerGroup);

        renderCourierMarker(courier, courierPos, isExcursion, isSelected, layerGroup, map);
      } else {
        // Fallback: render vehicle marker at its GPS position even if facilities are custom
        renderCourierMarker(courier, courierPos, isExcursion, isSelected, layerGroup, map);
      }
    });
  }, [telemetry, hospitals, selectedCourier, isDark, roadRoutes, renderCourierMarker]);

  // 7. Pan to selected courier when changed by user (smooth Apple camera tracking)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const map = mapInstanceRef.current;
    if (!map || !selectedCourier) return;

    map.panTo([selectedCourier.currentCoordinates.lat, selectedCourier.currentCoordinates.lng], {
      animate: true,
      duration: 0.6,
    });
  }, [selectedCourier]);

  // 8. Handle zoom changes from parent pill controls
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (map.getZoom() !== mapZoom) {
      map.setZoom(mapZoom);
    }
  }, [mapZoom]);

  const isDarkOsm = isDark && tileProvider !== 'satellite';

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-full ${isDarkOsm ? 'osm-dark-filter' : ''}`}
      style={{ minHeight: '620px' }}
    />
  );
}
