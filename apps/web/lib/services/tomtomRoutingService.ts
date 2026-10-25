/**
 * TomTom Routing & Hospital Search Integration Service for Vitalis
 * Combines TomTom Traffic-Aware Routing API with local Dijkstra shortest path fallback.
 * Works seamlessly 100% offline or online with live TomTom API keys.
 */

import { Hospital } from '../types';
import { solveDijkstraLocal, normalizeFacilityId } from './dijkstraRouting';

interface TomTomRawPoiItem {
  id?: string;
  position: { lat: number; lon: number };
  poi?: { name?: string; phone?: string };
  address?: { freeformAddress?: string; municipalitySubdivision?: string };
}

interface TomTomRawInstruction {
  message?: string;
  street?: string;
  routeOffsetInMeters?: number;
  travelTimeInSeconds?: number;
}

export interface RouteStepInstruction {
  instruction: string;
  street?: string;
  distanceMeters: number;
  timeSeconds: number;
}

export interface TomTomRouteResult {
  engine: 'tomtom' | 'dijkstra' | 'osrm';
  engineLabel: string;
  originId?: string;
  originName: string;
  destinationId?: string;
  destinationName: string;
  destName?: string; // Compatibility alias
  totalDistanceKm: number;
  estimatedMinutes: number;
  trafficDelayMinutes: number;
  waypoints: [number, number][]; // [lat, lng]
  instructions: RouteStepInstruction[];
  congestionLevel: 'low' | 'moderate' | 'heavy' | 'high';
}

export interface HospitalSearchResult {
  id: string;
  name: string;
  shortName: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  traumaLevel?: number;
  status?: string;
  currentStockUnits?: number;
  isRegisteredHospital: boolean;
  distanceFromUserKm?: number;
  phone?: string;
}

const STORAGE_KEY_TOMTOM_KEY = 'vitalis_tomtom_api_key';

/**
 * Retrieves configured TomTom API Key from environment or local storage.
 */
export function getTomTomApiKey(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_TOMTOM_KEY);
    if (saved && saved.trim().length > 0) return saved.trim();
  }
  return process.env.NEXT_PUBLIC_TOMTOM_API_KEY || '';
}

/**
 * Saves a TomTom API key into browser localStorage for immediate use.
 */
export function setTomTomApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key && key.trim().length > 0) {
      localStorage.setItem(STORAGE_KEY_TOMTOM_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_TOMTOM_KEY);
    }
  }
}

/**
 * Synchronous local hospital filter across registered Chennai network facilities.
 */
export function searchHospitals(
  query: string,
  registeredHospitals: Hospital[]
): HospitalSearchResult[] {
  const cleanQ = query.trim().toLowerCase();

  return registeredHospitals
    .filter((h) => {
      if (!cleanQ) return true;
      return (
        h.name.toLowerCase().includes(cleanQ) ||
        h.shortName.toLowerCase().includes(cleanQ) ||
        h.area.toLowerCase().includes(cleanQ) ||
        h.address.toLowerCase().includes(cleanQ) ||
        h.id.toLowerCase().includes(cleanQ) ||
        `level ${h.traumaLevel}`.includes(cleanQ)
      );
    })
    .map((h) => ({
      id: h.id,
      name: h.name,
      shortName: h.shortName,
      address: h.address,
      area: h.area,
      lat: h.lat,
      lng: h.lng,
      traumaLevel: h.traumaLevel,
      status: h.status,
      currentStockUnits: h.currentStockUnits,
      isRegisteredHospital: true,
      phone: h.contactPhone,
    }));
}

/**
 * Asynchronous hospital search: combines registered network with TomTom POI search.
 */
export async function searchHospitalsOnline(
  query: string,
  registeredHospitals: Hospital[]
): Promise<HospitalSearchResult[]> {
  const localMatches = searchHospitals(query, registeredHospitals);
  const cleanQ = query.trim().toLowerCase();
  const apiKey = getTomTomApiKey();

  if (apiKey && cleanQ.length >= 3) {
    try {
      const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(
        cleanQ
      )}.json?key=${apiKey}&lat=13.0827&lon=80.2707&radius=45000&categorySet=7321,7322&limit=5`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const results: TomTomRawPoiItem[] = data.results || [];
        const externalMatches: HospitalSearchResult[] = results
          .filter((item: TomTomRawPoiItem) => {
            const pos = item.position;
            return !localMatches.some(
              (m) =>
                Math.abs(m.lat - pos.lat) < 0.005 && Math.abs(m.lng - pos.lon) < 0.005
            );
          })
          .map((item: TomTomRawPoiItem) => ({
            id: `TOMTOM-${item.id || Math.random().toString(36).substring(2, 8)}`,
            name: item.poi?.name || item.address?.freeformAddress || 'Medical Facility',
            shortName: item.poi?.name?.substring(0, 30) || 'Clinic',
            address: item.address?.freeformAddress || 'Chennai, Tamil Nadu',
            area: item.address?.municipalitySubdivision || 'Greater Chennai',
            lat: item.position.lat,
            lng: item.position.lon,
            traumaLevel: 2,
            isRegisteredHospital: false,
            phone: item.poi?.phone,
          }));

        return [...localMatches, ...externalMatches];
      }
    } catch {
      // TomTom search error: fallback to local matches
    }
  }

  return localMatches;
}

/**
 * Calculates vehicle route between two coordinates using TomTom Routing API.
 * Gracefully falls back to Dijkstra Shortest Path or OSRM if TomTom is offline or unkeyed.
 */
export async function calculateTomTomRoute(
  originCoords: [number, number],
  destCoords: [number, number],
  originName = 'Origin Facility',
  destName = 'Destination Hospital',
  originId?: string,
  destId?: string,
  preferredEngine: 'tomtom' | 'dijkstra' | 'osrm' = 'tomtom'
): Promise<TomTomRouteResult> {
  const apiKey = getTomTomApiKey();

  // If user explicitly chose Dijkstra or no TomTom key exists, use Dijkstra
  if (preferredEngine === 'dijkstra' || (!apiKey && preferredEngine === 'tomtom')) {
    const oId = originId || normalizeFacilityId(originName);
    const dId = destId || normalizeFacilityId(destName);
    const dijkstra = solveDijkstraLocal(oId, dId);

    return {
      engine: 'dijkstra',
      engineLabel: 'Dijkstra Shortest Path Engine',
      originId: oId,
      originName: dijkstra.originName || originName,
      destinationId: dId,
      destinationName: dijkstra.destinationName || destName,
      totalDistanceKm: dijkstra.totalDistanceKm,
      estimatedMinutes: dijkstra.estimatedMinutes,
      trafficDelayMinutes: 0,
      waypoints: dijkstra.waypoints,
      instructions: dijkstra.roadSegments.map((road, idx) => ({
        instruction: idx === 0 ? `Depart via ${road}` : `Continue on ${road}`,
        street: road,
        distanceMeters: Math.round((dijkstra.totalDistanceKm / dijkstra.roadSegments.length) * 1000),
        timeSeconds: Math.round((dijkstra.estimatedMinutes / dijkstra.roadSegments.length) * 60),
      })),
      congestionLevel: dijkstra.congestionLevel,
    };
  }

  // 1. Attempt Live TomTom Routing API
  if (apiKey) {
    try {
      const url = `https://api.tomtom.com/routing/1/calculateRoute/${originCoords[0]},${originCoords[1]}:${destCoords[0]},${destCoords[1]}/json?key=${apiKey}&traffic=true&travelMode=car&routeType=fastest&instructionsType=text`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const route = data.routes?.[0];
        if (route) {
          const summary = route.summary;
          const leg = route.legs?.[0];
          const rawPoints = leg?.points || [];
          const waypoints: [number, number][] = rawPoints.map(
            (p: { latitude: number; longitude: number }) => [p.latitude, p.longitude]
          );

          const distanceKm = Number((summary.lengthInMeters / 1000).toFixed(2));
          const travelMinutes = Math.max(1, Math.round(summary.travelTimeInSeconds / 60));
          const delayMinutes = Math.round((summary.trafficDelayInSeconds || 0) / 60);

          const instructions: RouteStepInstruction[] = (leg?.instructions || []).map(
            (inst: TomTomRawInstruction) => ({
              instruction: inst.message || 'Continue straight',
              street: inst.street,
              distanceMeters: inst.routeOffsetInMeters || 0,
              timeSeconds: inst.travelTimeInSeconds || 0,
            })
          );

          return {
            engine: 'tomtom',
            engineLabel: 'TomTom Live Traffic Routing',
            originId,
            originName,
            destinationId: destId,
            destinationName: destName,
            destName,
            totalDistanceKm: distanceKm,
            estimatedMinutes: travelMinutes,
            trafficDelayMinutes: delayMinutes,
            waypoints: waypoints.length > 0 ? waypoints : [originCoords, destCoords],
            instructions,
            congestionLevel: delayMinutes > 5 ? 'heavy' : delayMinutes > 1 ? 'moderate' : 'low',
          };
        }
      }
    } catch (err) {
      console.warn('[Vitalis TomTom] API query failed, falling back to OSRM road routing:', err);
    }
  }

  // 2. High-precision Real Road Routing via OSRM (100% Free, Zero API Key)
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords[1]},${originCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const route = data.routes?.[0];
      if (route?.geometry?.coordinates?.length > 1) {
        // Convert OSRM GeoJSON [lng, lat] to [lat, lng]
        const waypoints: [number, number][] = route.geometry.coordinates.map(
          (pt: [number, number]) => [pt[1], pt[0]]
        );
        const distanceKm = Number((route.distance / 1000).toFixed(2));
        const travelMinutes = Math.max(1, Math.round(route.duration / 60));

        return {
          engine: 'osrm',
          engineLabel: 'OSRM Turn-by-Turn Road Navigation',
          originId,
          originName,
          destinationId: destId,
          destinationName: destName,
          destName,
          totalDistanceKm: distanceKm,
          estimatedMinutes: travelMinutes,
          trafficDelayMinutes: 0,
          waypoints,
          instructions: [
            {
              instruction: `Follow active emergency transit road corridor to ${destName}`,
              distanceMeters: Math.round(distanceKm * 1000),
              timeSeconds: travelMinutes * 60,
            },
          ],
          congestionLevel: 'low',
        };
      }
    }
  } catch {
    // OSRM failed or network offline: proceed to cached real road corridor
  }

  // 3. Automatic Fallback to Dijkstra Algorithm (with Cached Road Corridors)
  const oId = originId || normalizeFacilityId(originName);
  const dId = destId || normalizeFacilityId(destName);
  const dijkstra = solveDijkstraLocal(oId, dId);

  return {
    engine: 'dijkstra',
    engineLabel: 'Dijkstra Shortest Path Engine (Active Fallback)',
    originId: oId,
    originName: dijkstra.originName || originName,
    destinationId: dId,
    destinationName: dijkstra.destinationName || destName,
    destName: dijkstra.destinationName || destName,
    totalDistanceKm: dijkstra.totalDistanceKm,
    estimatedMinutes: dijkstra.estimatedMinutes,
    trafficDelayMinutes: 0,
    waypoints: dijkstra.waypoints,
    instructions: dijkstra.roadSegments.map((road, idx) => ({
      instruction: idx === 0 ? `Depart via ${road}` : `Continue on ${road}`,
      street: road,
      distanceMeters: Math.round((dijkstra.totalDistanceKm / dijkstra.roadSegments.length) * 1000),
      timeSeconds: Math.round((dijkstra.estimatedMinutes / dijkstra.roadSegments.length) * 60),
    })),
    congestionLevel: dijkstra.congestionLevel,
  };
}
