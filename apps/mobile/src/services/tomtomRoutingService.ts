/**
 * Mobile TomTom Routing & Hospital Search Integration Service for Vitalis
 * Combines TomTom Traffic-Aware Routing API with local Dijkstra shortest path fallback.
 * Works seamlessly 100% offline or online in React Native / Expo.
 */

import { solveDijkstraLocal, normalizeFacilityId, CHENNAI_GRAPH_NODES } from './dijkstraRouting';

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
  totalDistanceKm: number;
  estimatedMinutes: number;
  trafficDelayMinutes: number;
  waypoints: [number, number][]; // [lat, lng]
  instructions: RouteStepInstruction[];
  congestionLevel: 'low' | 'moderate' | 'heavy';
}

export interface MobileHospitalSearchItem {
  id: string;
  name: string;
  shortName: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  traumaLevel: number;
  isRegisteredHospital: boolean;
}

export const REGISTERED_CHENNAI_HOSPITALS: MobileHospitalSearchItem[] = [
  {
    id: 'FAC-APOLLO',
    name: 'Apollo Hospitals, Greams Road',
    shortName: 'Apollo Greams Rd',
    address: '21 Greams Lane, Thousand Lights',
    area: 'Central Chennai',
    lat: 13.0567,
    lng: 80.2505,
    traumaLevel: 1,
    isRegisteredHospital: true,
  },
  {
    id: 'FAC-RGGGH',
    name: 'Rajiv Gandhi Government General Hospital',
    shortName: 'Rajiv Gandhi Govt General',
    address: 'EVR Periyar Salai, Park Town',
    area: 'Central Hub',
    lat: 13.0805,
    lng: 80.2798,
    traumaLevel: 1,
    isRegisteredHospital: true,
  },
  {
    id: 'FAC-FORTIS',
    name: 'Fortis Malar Hospital',
    shortName: 'Fortis Malar',
    address: '52 1st Main Rd, Gandhi Nagar, Adyar',
    area: 'South Chennai',
    lat: 13.0068,
    lng: 80.257,
    traumaLevel: 2,
    isRegisteredHospital: true,
  },
  {
    id: 'FAC-RBTC',
    name: 'Regional Blood Transfusion Center',
    shortName: 'Regional Blood Transfusion Center',
    address: 'Pantheon Road, Egmore',
    area: 'Central Repository',
    lat: 13.0784,
    lng: 80.2604,
    traumaLevel: 1,
    isRegisteredHospital: true,
  },
  {
    id: 'FAC-STANLEY',
    name: 'Government Stanley Medical College Hospital',
    shortName: 'Stanley Medical College',
    address: 'Old Jail Rd, Royapuram',
    area: 'North Chennai',
    lat: 13.1075,
    lng: 80.288,
    traumaLevel: 1,
    isRegisteredHospital: true,
  },
  {
    id: 'FAC-SRMC',
    name: 'Sri Ramachandra Institute of Higher Education',
    shortName: 'Sri Ramachandra (SRMC)',
    address: 'No.1 Ramachandra Nagar, Porur',
    area: 'West Chennai',
    lat: 13.0366,
    lng: 80.1428,
    traumaLevel: 1,
    isRegisteredHospital: true,
  },
  {
    id: 'FAC-MIOT',
    name: 'MIOT International Hospital',
    shortName: 'MIOT International',
    address: '4/112 Mount Poonamallee Rd, Manapakkam',
    area: 'Airport Corridor',
    lat: 13.0189,
    lng: 80.1878,
    traumaLevel: 1,
    isRegisteredHospital: true,
  },
  {
    id: 'FAC-GLENEAGLES',
    name: 'Gleneagles Health City Chennai',
    shortName: 'Gleneagles Health City',
    address: '439 Cheran Nagar, Perumbakkam',
    area: 'OMR IT Corridor',
    lat: 12.9056,
    lng: 80.1982,
    traumaLevel: 1,
    isRegisteredHospital: true,
  },
];

export function getTomTomApiKey(): string {
  return (
    process.env.EXPO_PUBLIC_TOMTOM_API_KEY ||
    process.env.TOMTOM_API_KEY ||
    ''
  );
}

/**
 * Filter hospitals by name, area, or address with instant typeahead.
 */
export function searchHospitalsMobile(query: string): MobileHospitalSearchItem[] {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return REGISTERED_CHENNAI_HOSPITALS;

  return REGISTERED_CHENNAI_HOSPITALS.filter(
    (h) =>
      h.name.toLowerCase().includes(cleanQ) ||
      h.shortName.toLowerCase().includes(cleanQ) ||
      h.area.toLowerCase().includes(cleanQ) ||
      h.address.toLowerCase().includes(cleanQ) ||
      h.id.toLowerCase().includes(cleanQ)
  );
}

/**
 * Calculates vehicle route using TomTom Routing API or Dijkstra Shortest Path.
 */
export async function calculateTomTomRoute(
  originCoords: [number, number],
  destCoords: [number, number],
  originName = 'Origin Facility',
  destName = 'Destination Hospital',
  originId?: string,
  destId?: string
): Promise<TomTomRouteResult> {
  const apiKey = getTomTomApiKey();

  if (apiKey) {
    try {
      const url = `https://api.tomtom.com/routing/1/calculateRoute/${originCoords[0]},${originCoords[1]}:${destCoords[0]},${destCoords[1]}/json?key=${apiKey}&traffic=true&travelMode=car&routeType=fastest`;

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

          return {
            engine: 'tomtom',
            engineLabel: 'TomTom Live Traffic Routing',
            originId,
            originName,
            destinationId: destId,
            destinationName: destName,
            totalDistanceKm: distanceKm,
            estimatedMinutes: travelMinutes,
            trafficDelayMinutes: delayMinutes,
            waypoints: waypoints.length > 0 ? waypoints : [originCoords, destCoords],
            instructions: [],
            congestionLevel: delayMinutes > 5 ? 'heavy' : delayMinutes > 1 ? 'moderate' : 'low',
          };
        }
      }
    } catch {
      // TomTom failed: proceed to OSRM
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
          totalDistanceKm: distanceKm,
          estimatedMinutes: travelMinutes,
          trafficDelayMinutes: 0,
          waypoints,
          instructions: [],
          congestionLevel: 'low',
        };
      }
    }
  } catch {
    // OSRM failed or network offline: fallback to cached real road corridor
  }

  // Fallback to client-side Dijkstra
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
    instructions: [],
    congestionLevel: dijkstra.congestionLevel === 'high' ? 'heavy' : dijkstra.congestionLevel,
  };
}
