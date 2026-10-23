import { PRECOMPUTED_ROAD_ROUTES } from '../data/precomputedRoadRoutes';

// In-memory runtime cache for dynamically resolved OSRM road routes
const routeCache: Map<string, [number, number][]> = new Map();

/**
 * Calculates euclidean distance squared between two geo points for fast nearest-point lookup
 */
function distSq(p1: [number, number], p2: [number, number]): number {
  const dLat = p1[0] - p2[0];
  const dLng = p1[1] - p2[1];
  return dLat * dLat + dLng * dLng;
}

/**
 * Synchronous road lookup for instant (0ms) zero-flicker rendering.
 * Checks precomputed Chennai road network and runtime memory cache (both forward and reverse directions).
 */
export function getRoadSnappedRouteSync(
  originId: string,
  destId: string
): [number, number][] | null {
  const forwardKey = `${originId}_${destId}`;
  const reverseKey = `${destId}_${originId}`;

  // 1. Check precomputed road catalog
  if (PRECOMPUTED_ROAD_ROUTES[forwardKey]?.length > 0) {
    return PRECOMPUTED_ROAD_ROUTES[forwardKey];
  }
  if (PRECOMPUTED_ROAD_ROUTES[reverseKey]?.length > 0) {
    return [...PRECOMPUTED_ROAD_ROUTES[reverseKey]].reverse();
  }

  // 2. Check memory cache
  if (routeCache.has(forwardKey)) {
    return routeCache.get(forwardKey)!;
  }
  if (routeCache.has(reverseKey)) {
    return [...routeCache.get(reverseKey)!].reverse();
  }

  return null;
}

/**
 * Resolves a turn-by-turn road path between two coordinates, snapped to the OpenStreetMap road network.
 * 1. Checks precomputed real Chennai roads (instant, 0ms).
 * 2. Checks in-memory runtime cache.
 * 3. Fetches from free public OpenStreetMap OSRM routing API.
 * 4. Fallbacks to interpolated waypoints if network is unavailable.
 */
export async function getRoadSnappedRoute(
  originId: string,
  destId: string,
  originCoords: [number, number],
  destCoords: [number, number]
): Promise<[number, number][]> {
  // Check instant sync cache
  const syncRoute = getRoadSnappedRouteSync(originId, destId);
  if (syncRoute) {
    return syncRoute;
  }

  const forwardKey = `${originId}_${destId}`;

  // Dynamic OSRM API lookup (100% Free, Zero API Key)
  try {
    const [origLat, origLng] = originCoords;
    const [destLat, destLng] = destCoords;
    const url = `https://router.project-osrm.org/route/v1/driving/${origLng},${origLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const roadPoints: [number, number][] = data.routes[0].geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [Number(lat.toFixed(6)), Number(lng.toFixed(6))]
        );
        routeCache.set(forwardKey, roadPoints);
        return roadPoints;
      }
    }
  } catch (err) {
    console.warn('[Vitalis Routing] OSRM live query fallback:', err);
  }

  // Fallback: smooth corridor path
  const fallbackPoints: [number, number][] = [
    originCoords,
    [
      (originCoords[0] + destCoords[0]) / 2 + 0.002,
      (originCoords[1] + destCoords[1]) / 2 - 0.002,
    ],
    destCoords,
  ];
  routeCache.set(forwardKey, fallbackPoints);
  return fallbackPoints;
}

/**
 * Splits a full road route into completed (traversed) and remaining segments based on the courier's location.
 * Snaps the courier to the nearest point on the road route so the vehicle marker and path join seamlessly.
 */
export function splitRouteByCourier(
  fullRoute: [number, number][],
  courierPos: [number, number]
): {
  snappedCourierPos: [number, number];
  completedPath: [number, number][];
  remainingPath: [number, number][];
  progressPercent: number;
} {
  if (fullRoute.length < 2) {
    return {
      snappedCourierPos: courierPos,
      completedPath: [fullRoute[0] || courierPos, courierPos],
      remainingPath: [courierPos, fullRoute[1] || courierPos],
      progressPercent: 50,
    };
  }

  // Find index of the closest road waypoint to the courier
  let closestIdx = 0;
  let minD = Infinity;

  for (let i = 0; i < fullRoute.length; i++) {
    const d = distSq(fullRoute[i], courierPos);
    if (d < minD) {
      minD = d;
      closestIdx = i;
    }
  }

  const snappedCourierPos = fullRoute[closestIdx];
  const completedPath = fullRoute.slice(0, closestIdx + 1);
  const remainingPath = fullRoute.slice(closestIdx);

  const progressPercent = Math.round((closestIdx / (fullRoute.length - 1)) * 100);

  return {
    snappedCourierPos,
    completedPath,
    remainingPath,
    progressPercent,
  };
}
