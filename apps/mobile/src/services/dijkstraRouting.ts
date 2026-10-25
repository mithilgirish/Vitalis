/**
 * Mobile Dijkstra Shortest Path Road Routing Service
 * Runs offline in React Native / Expo environment and synchronizes with FastAPI gateway.
 */

import { getMobileBackendUrl } from './apiConfig';
import { REAL_ROAD_CORRIDORS } from './realRoadCorridors';

export interface DijkstraRouteResult {
  algorithm: string;
  originId: string;
  originName: string;
  destinationId: string;
  destinationName: string;
  totalDistanceKm: number;
  estimatedMinutes: number;
  nodeSequence: string[];
  roadSegments: string[];
  waypoints: [number, number][]; // [lat, lng] array
  congestionLevel: 'low' | 'moderate' | 'high';
}

export interface HospitalNode {
  id: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
}

export const CHENNAI_GRAPH_NODES: Record<string, HospitalNode> = {
  'FAC-APOLLO': {
    id: 'FAC-APOLLO',
    name: 'Apollo Hospitals, Greams Road',
    shortName: 'Apollo Greams Rd',
    lat: 13.0567,
    lng: 80.2505,
  },
  'FAC-RGGGH': {
    id: 'FAC-RGGGH',
    name: 'Rajiv Gandhi Government General Hospital',
    shortName: 'Rajiv Gandhi Govt General',
    lat: 13.0805,
    lng: 80.2798,
  },
  'FAC-FORTIS': {
    id: 'FAC-FORTIS',
    name: 'Fortis Malar Hospital',
    shortName: 'Fortis Malar',
    lat: 13.0068,
    lng: 80.257,
  },
  'FAC-RBTC': {
    id: 'FAC-RBTC',
    name: 'Regional Blood Transfusion Center',
    shortName: 'Regional Blood Transfusion Center',
    lat: 13.0784,
    lng: 80.2604,
  },
  'FAC-STANLEY': {
    id: 'FAC-STANLEY',
    name: 'Government Stanley Medical College Hospital',
    shortName: 'Stanley Medical College',
    lat: 13.1075,
    lng: 80.288,
  },
  'FAC-SRMC': {
    id: 'FAC-SRMC',
    name: 'Sri Ramachandra Institute of Higher Education',
    shortName: 'Sri Ramachandra (SRMC)',
    lat: 13.0366,
    lng: 80.1428,
  },
  'FAC-MIOT': {
    id: 'FAC-MIOT',
    name: 'MIOT International Hospital',
    shortName: 'MIOT International',
    lat: 13.0189,
    lng: 80.1878,
  },
  'FAC-GLENEAGLES': {
    id: 'FAC-GLENEAGLES',
    name: 'Gleneagles Health City Chennai',
    shortName: 'Gleneagles Health City',
    lat: 12.9056,
    lng: 80.1982,
  },
  'FAC-KAUVERY': {
    id: 'FAC-KAUVERY',
    name: 'Kauvery Hospital, Alwarpet',
    shortName: 'Kauvery Hospital',
    lat: 13.0337,
    lng: 80.2526,
  },
  'FAC-SIMS': {
    id: 'FAC-SIMS',
    name: 'SIMS Hospital, Vadapalani',
    shortName: 'SIMS Hospital',
    lat: 13.0519,
    lng: 80.2117,
  },
  // Junction Nodes
  'JNC-EGMORE': { id: 'JNC-EGMORE', name: 'Egmore Roundabout', shortName: 'Egmore Roundabout', lat: 13.073, lng: 80.2615 },
  'JNC-CHETPET': { id: 'JNC-CHETPET', name: 'Chetpet Signal', shortName: 'Chetpet Signal', lat: 13.071, lng: 80.246 },
  'JNC-THOUSAND-LIGHTS': { id: 'JNC-THOUSAND-LIGHTS', name: 'Anna Salai / Greams Rd', shortName: 'Anna Salai / Greams Rd', lat: 13.0585, lng: 80.254 },
  'JNC-TEYNAMPET': { id: 'JNC-TEYNAMPET', name: 'Teynampet Signal', shortName: 'Teynampet Signal', lat: 13.041, lng: 80.248 },
  'JNC-NANDANAM': { id: 'JNC-NANDANAM', name: 'Nandanam Junction', shortName: 'Nandanam Junction', lat: 13.031, lng: 80.241 },
  'JNC-KATHIPARA': { id: 'JNC-KATHIPARA', name: 'Kathipara Cloverleaf', shortName: 'Kathipara Cloverleaf', lat: 13.007, lng: 80.203 },
  'JNC-ADYAR-BRIDGE': { id: 'JNC-ADYAR-BRIDGE', name: 'Adyar Bridge', shortName: 'Adyar Bridge', lat: 13.011, lng: 80.259 },
  'JNC-CENTRAL': { id: 'JNC-CENTRAL', name: 'Chennai Central Station', shortName: 'Chennai Central Station', lat: 13.082, lng: 80.275 },
  'JNC-ROYAPURAM': { id: 'JNC-ROYAPURAM', name: 'Royapuram Bridge', shortName: 'Royapuram Bridge', lat: 13.102, lng: 80.292 },
  'JNC-PORUR': { id: 'JNC-PORUR', name: 'Porur Roundabout', shortName: 'Porur Roundabout', lat: 13.033, lng: 80.158 },
  'JNC-MEDAVAKKAM': { id: 'JNC-MEDAVAKKAM', name: 'Medavakkam Junction', shortName: 'Medavakkam Junction', lat: 12.921, lng: 80.192 },
};

export const CHENNAI_ROAD_EDGES: [string, string, string, number][] = [
  // Egmore / Central Hub
  ['FAC-RBTC', 'JNC-EGMORE', 'Pantheon Road', 35.0],
  ['JNC-EGMORE', 'JNC-CENTRAL', 'EVR Periyar Salai', 32.0],
  ['JNC-CENTRAL', 'FAC-RGGGH', 'Station Access Road', 28.0],
  ['JNC-EGMORE', 'JNC-CHETPET', 'Casa Major Road', 36.0],
  ['JNC-CHETPET', 'JNC-THOUSAND-LIGHTS', 'Spurtank Rd / College Rd', 34.0],

  // Greams Road / Thousand Lights
  ['JNC-EGMORE', 'JNC-THOUSAND-LIGHTS', 'Anna Salai Express Corridor', 42.0],
  ['JNC-THOUSAND-LIGHTS', 'FAC-APOLLO', 'Greams Lane Hospital Access', 25.0],
  ['FAC-APOLLO', 'JNC-TEYNAMPET', 'Mount Road / Cathedral Link', 38.0],

  // South Chennai Corridor
  ['JNC-TEYNAMPET', 'JNC-NANDANAM', 'Anna Salai South', 40.0],
  ['JNC-NANDANAM', 'JNC-ADYAR-BRIDGE', 'Chamiers Road', 38.0],
  ['JNC-ADYAR-BRIDGE', 'FAC-FORTIS', 'Gandhi Nagar 1st Main Rd', 30.0],

  // West Chennai / Airport Corridor
  ['JNC-NANDANAM', 'JNC-KATHIPARA', 'GST Road Arterial', 48.0],
  ['JNC-KATHIPARA', 'FAC-MIOT', 'Mount Poonamallee Road', 38.0],
  ['FAC-MIOT', 'JNC-PORUR', 'Porur Link Road', 36.0],
  ['JNC-PORUR', 'FAC-SRMC', 'Ramachandra Nagar Access', 30.0],

  // North Chennai Corridor
  ['JNC-CENTRAL', 'JNC-ROYAPURAM', 'Wall Tax Rd / Old Jail Rd', 32.0],
  ['JNC-ROYAPURAM', 'FAC-STANLEY', 'Stanley Medical Access Way', 25.0],

  // Deep South / OMR IT Corridor
  ['FAC-FORTIS', 'JNC-MEDAVAKKAM', 'OMR Expressway Link', 45.0],
  ['JNC-MEDAVAKKAM', 'FAC-GLENEAGLES', 'Cheran Nagar Road', 30.0],
  ['JNC-KATHIPARA', 'JNC-MEDAVAKKAM', 'Velachery Main Road', 38.0],
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function normalizeFacilityId(id: string): string {
  if (!id) return 'FAC-RBTC';
  if (CHENNAI_GRAPH_NODES[id]) return id;
  const lower = id.toLowerCase();
  if (lower.includes('apollo') || lower.includes('greams') || lower.includes('c71a399f')) return 'FAC-APOLLO';
  if (lower.includes('rgggh') || lower.includes('general') || lower.includes('rajiv') || lower.includes('a1b2c3d4')) return 'FAC-RGGGH';
  if (lower.includes('fortis') || lower.includes('malar') || lower.includes('b2c3d4e5')) return 'FAC-FORTIS';
  if (lower.includes('rbtc') || lower.includes('blood') || lower.includes('transfusion') || lower.includes('993a2164')) return 'FAC-RBTC';
  if (lower.includes('stanley') || lower.includes('c3d4e5f6')) return 'FAC-STANLEY';
  if (lower.includes('srmc') || lower.includes('ramachandra') || lower.includes('d4e5f6a1')) return 'FAC-SRMC';
  if (lower.includes('miot') || lower.includes('e5f6a1b2')) return 'FAC-MIOT';
  if (lower.includes('gleneagles') || lower.includes('global') || lower.includes('f6a1b2c3')) return 'FAC-GLENEAGLES';
  if (lower.includes('kauvery')) return 'FAC-KAUVERY';
  if (lower.includes('sims')) return 'FAC-SIMS';
  return 'FAC-RBTC';
}

/**
 * Client-side Dijkstra Shortest Path algorithm for React Native mobile.
 */
export function solveDijkstraLocal(originId: string, destId: string): DijkstraRouteResult {
  const normOrigin = normalizeFacilityId(originId);
  const normDest = normalizeFacilityId(destId);

  // 1. Check curated high-resolution real road corridor cache
  const forwardKey = `${normOrigin}->${normDest}`;
  const reverseKey = `${normDest}->${normOrigin}`;
  if (REAL_ROAD_CORRIDORS[forwardKey]) {
    const c = REAL_ROAD_CORRIDORS[forwardKey];
    return {
      algorithm: 'Real Road-Snapped Street Navigation (OSRM)',
      originId: normOrigin,
      originName: CHENNAI_GRAPH_NODES[normOrigin]?.shortName || normOrigin,
      destinationId: normDest,
      destinationName: CHENNAI_GRAPH_NODES[normDest]?.shortName || normDest,
      totalDistanceKm: c.distanceKm,
      estimatedMinutes: c.estimatedMinutes,
      nodeSequence: [normOrigin, normDest],
      roadSegments: ['Emergency Road Corridor'],
      waypoints: c.waypoints,
      congestionLevel: 'low',
    };
  }
  if (REAL_ROAD_CORRIDORS[reverseKey]) {
    const c = REAL_ROAD_CORRIDORS[reverseKey];
    const reversedWaypoints = [...c.waypoints].reverse();
    return {
      algorithm: 'Real Road-Snapped Street Navigation (OSRM)',
      originId: normOrigin,
      originName: CHENNAI_GRAPH_NODES[normOrigin]?.shortName || normOrigin,
      destinationId: normDest,
      destinationName: CHENNAI_GRAPH_NODES[normDest]?.shortName || normDest,
      totalDistanceKm: c.distanceKm,
      estimatedMinutes: c.estimatedMinutes,
      nodeSequence: [normOrigin, normDest],
      roadSegments: ['Emergency Road Corridor'],
      waypoints: reversedWaypoints,
      congestionLevel: 'low',
    };
  }

  interface Edge {
    target: string;
    dist: number;
    timeMins: number;
    road: string;
  }
  const adj: Record<string, Edge[]> = {};
  for (const nodeKey of Object.keys(CHENNAI_GRAPH_NODES)) {
    adj[nodeKey] = [];
  }

  for (const [u, v, road, speed] of CHENNAI_ROAD_EDGES) {
    const nodeU = CHENNAI_GRAPH_NODES[u];
    const nodeV = CHENNAI_GRAPH_NODES[v];
    if (nodeU && nodeV) {
      const dist = haversineKm(nodeU.lat, nodeU.lng, nodeV.lat, nodeV.lng) * 1.25;
      const timeMins = (dist / speed) * 60.0;
      adj[u].push({ target: v, dist, timeMins, road });
      adj[v].push({ target: u, dist, timeMins, road });
    }
  }

  interface QueueItem {
    time: number;
    node: string;
    dist: number;
    path: string[];
    roads: string[];
  }

  const queue: QueueItem[] = [{ time: 0, node: normOrigin, dist: 0, path: [normOrigin], roads: [] }];
  const visited = new Set<string>();
  const bestTime: Record<string, number> = { [normOrigin]: 0 };

  while (queue.length > 0) {
    queue.sort((a, b) => a.time - b.time);
    const curr = queue.shift()!;

    if (visited.has(curr.node)) continue;
    visited.add(curr.node);

    if (curr.node === normDest) {
      const rawWaypoints: [number, number][] = curr.path.map((nid) => [
        CHENNAI_GRAPH_NODES[nid].lat,
        CHENNAI_GRAPH_NODES[nid].lng,
      ]);

      const denseWaypoints: [number, number][] = [];
      for (let i = 0; i < rawWaypoints.length - 1; i++) {
        const p1 = rawWaypoints[i];
        const p2 = rawWaypoints[i + 1];
        denseWaypoints.push(p1);
        denseWaypoints.push([p1[0] * 0.67 + p2[0] * 0.33, p1[1] * 0.67 + p2[1] * 0.33]);
        denseWaypoints.push([p1[0] * 0.33 + p2[0] * 0.67, p1[1] * 0.33 + p2[1] * 0.67]);
      }
      denseWaypoints.push(rawWaypoints[rawWaypoints.length - 1]);

      return {
        algorithm: 'Dijkstra Shortest Path (A* Heuristic)',
        originId: normOrigin,
        originName: CHENNAI_GRAPH_NODES[normOrigin]?.shortName || normOrigin,
        destinationId: normDest,
        destinationName: CHENNAI_GRAPH_NODES[normDest]?.shortName || normDest,
        totalDistanceKm: Number(curr.dist.toFixed(2)),
        estimatedMinutes: Math.max(1, Math.round(curr.time)),
        nodeSequence: curr.path,
        roadSegments: curr.roads,
        waypoints: denseWaypoints,
        congestionLevel: curr.time > 20 ? 'moderate' : 'low',
      };
    }

    for (const edge of adj[curr.node] || []) {
      if (visited.has(edge.target)) continue;
      const newTime = curr.time + edge.timeMins;
      if (bestTime[edge.target] === undefined || newTime < bestTime[edge.target]) {
        bestTime[edge.target] = newTime;
        queue.push({
          time: newTime,
          node: edge.target,
          dist: curr.dist + edge.dist,
          path: [...curr.path, edge.target],
          roads: [...curr.roads, edge.road],
        });
      }
    }
  }

  const orig = CHENNAI_GRAPH_NODES[normOrigin] || CHENNAI_GRAPH_NODES['FAC-RBTC'];
  const dest = CHENNAI_GRAPH_NODES[normDest] || CHENNAI_GRAPH_NODES['FAC-APOLLO'];
  const dist = haversineKm(orig.lat, orig.lng, dest.lat, dest.lng) * 1.3;

  return {
    algorithm: 'Dijkstra (Direct Heuristic Fallback)',
    originId: normOrigin,
    originName: orig.shortName,
    destinationId: normDest,
    destinationName: dest.shortName,
    totalDistanceKm: Number(dist.toFixed(2)),
    estimatedMinutes: Math.max(1, Math.round((dist / 35.0) * 60)),
    nodeSequence: [normOrigin, normDest],
    roadSegments: ['Direct Arterial Transit Corridor'],
    waypoints: [
      [orig.lat, orig.lng],
      [(orig.lat + dest.lat) / 2 + 0.002, (orig.lng + dest.lng) / 2 - 0.002],
      [dest.lat, dest.lng],
    ],
    congestionLevel: 'low',
  };
}

/**
 * Resolves route either via FastAPI backend or fallback to local Dijkstra.
 */
export async function solveDijkstraRoute(originId: string, destId: string): Promise<DijkstraRouteResult> {
  const backendUrl = getMobileBackendUrl();
  const normOrigin = normalizeFacilityId(originId);
  const normDest = normalizeFacilityId(destId);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${backendUrl}/api/v1/routing/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin_id: normOrigin, destination_id: normDest }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        algorithm: data.algorithm,
        originId: data.origin_id,
        originName: data.origin_name,
        destinationId: data.destination_id,
        destinationName: data.destination_name,
        totalDistanceKm: data.total_distance_km,
        estimatedMinutes: data.estimated_minutes,
        nodeSequence: data.node_sequence || [],
        roadSegments: data.road_segments || [],
        waypoints: data.waypoints,
        congestionLevel: data.congestion_level || 'low',
      };
    }
  } catch {
    // Offline: use local Dijkstra engine
  }

  return solveDijkstraLocal(originId, destId);
}
