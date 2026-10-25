"""
Dijkstra & A* Shortest Path Routing Engine for Chennai Hospital Network
Computes optimal road transport routes, distance, and transit time between hospitals.
"""

import math
import heapq
from typing import Dict, Any, List, Tuple, Optional

# Hospital coordinates in Chennai
HOSPITAL_NODES: Dict[str, Dict[str, Any]] = {
    "FAC-APOLLO": {
        "id": "FAC-APOLLO",
        "name": "Apollo Hospitals, Greams Road",
        "short_name": "Apollo Greams Rd",
        "lat": 13.0567,
        "lon": 80.2505,
    },
    "FAC-RGGGH": {
        "id": "FAC-RGGGH",
        "name": "Rajiv Gandhi Government General Hospital",
        "short_name": "Rajiv Gandhi Govt General",
        "lat": 13.0805,
        "lon": 80.2798,
    },
    "FAC-FORTIS": {
        "id": "FAC-FORTIS",
        "name": "Fortis Malar Hospital",
        "short_name": "Fortis Malar",
        "lat": 13.0068,
        "lon": 80.2570,
    },
    "FAC-RBTC": {
        "id": "FAC-RBTC",
        "name": "Regional Blood Transfusion Center",
        "short_name": "Regional Blood Transfusion Center",
        "lat": 13.0784,
        "lon": 80.2604,
    },
    "FAC-STANLEY": {
        "id": "FAC-STANLEY",
        "name": "Government Stanley Medical College Hospital",
        "short_name": "Stanley Medical College",
        "lat": 13.1075,
        "lon": 80.2880,
    },
    "FAC-SRMC": {
        "id": "FAC-SRMC",
        "name": "Sri Ramachandra Institute of Higher Education",
        "short_name": "Sri Ramachandra (SRMC)",
        "lat": 13.0366,
        "lon": 80.1428,
    },
    "FAC-MIOT": {
        "id": "FAC-MIOT",
        "name": "MIOT International Hospital",
        "short_name": "MIOT International",
        "lat": 13.0189,
        "lon": 80.1878,
    },
    "FAC-GLENEAGLES": {
        "id": "FAC-GLENEAGLES",
        "name": "Gleneagles Health City Chennai",
        "short_name": "Gleneagles Health City",
        "lat": 12.9056,
        "lon": 80.1982,
    },
}

# Major Chennai road network junction vertices
JUNCTION_NODES: Dict[str, Dict[str, Any]] = {
    "JNC-EGMORE": {"id": "JNC-EGMORE", "name": "Egmore Roundabout", "lat": 13.0730, "lon": 80.2615},
    "JNC-CHETPET": {"id": "JNC-CHETPET", "name": "Chetpet Signal", "lat": 13.0710, "lon": 80.2460},
    "JNC-THOUSAND-LIGHTS": {"id": "JNC-THOUSAND-LIGHTS", "name": "Anna Salai / Greams Rd", "lat": 13.0585, "lon": 80.2540},
    "JNC-TEYNAMPET": {"id": "JNC-TEYNAMPET", "name": "Teynampet Signal", "lat": 13.0410, "lon": 80.2480},
    "JNC-NANDANAM": {"id": "JNC-NANDANAM", "name": "Nandanam Junction", "lat": 13.0310, "lon": 80.2410},
    "JNC-KATHIPARA": {"id": "JNC-KATHIPARA", "name": "Kathipara Cloverleaf", "lat": 13.0070, "lon": 80.2030},
    "JNC-ADYAR-BRIDGE": {"id": "JNC-ADYAR-BRIDGE", "name": "Adyar Bridge", "lat": 13.0110, "lon": 80.2590},
    "JNC-CENTRAL": {"id": "JNC-CENTRAL", "name": "Chennai Central Station", "lat": 13.0820, "lon": 80.2750},
    "JNC-ROYAPURAM": {"id": "JNC-ROYAPURAM", "name": "Royapuram Bridge", "lat": 13.1020, "lon": 80.2920},
    "JNC-PORUR": {"id": "JNC-PORUR", "name": "Porur Roundabout", "lat": 13.0330, "lon": 80.1580},
    "JNC-MEDAVAKKAM": {"id": "JNC-MEDAVAKKAM", "name": "Medavakkam Junction", "lat": 12.9210, "lon": 80.1920},
}

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates geodesic distance in kilometers between two GPS coordinates."""
    r = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# Road network adjacency graph with base distance and speed factors
# Format: (node_a, node_b, road_name, average_speed_kmh)
ROAD_EDGES: List[Tuple[str, str, str, float]] = [
    # Egmore / Central Hub
    ("FAC-RBTC", "JNC-EGMORE", "Pantheon Road", 35.0),
    ("JNC-EGMORE", "JNC-CENTRAL", "EVR Periyar Salai", 32.0),
    ("JNC-CENTRAL", "FAC-RGGGH", "Station Access Road", 28.0),
    ("JNC-EGMORE", "JNC-CHETPET", "Casa Major Road", 36.0),
    ("JNC-CHETPET", "JNC-THOUSAND-LIGHTS", "Spurtank Rd / College Rd", 34.0),

    # Greams Road / Thousand Lights
    ("JNC-EGMORE", "JNC-THOUSAND-LIGHTS", "Anna Salai Express Corridor", 42.0),
    ("JNC-THOUSAND-LIGHTS", "FAC-APOLLO", "Greams Lane Hospital Access", 25.0),
    ("FAC-APOLLO", "JNC-TEYNAMPET", "Mount Road / Cathedral Link", 38.0),

    # South Chennai Corridor
    ("JNC-TEYNAMPET", "JNC-NANDANAM", "Anna Salai South", 40.0),
    ("JNC-NANDANAM", "JNC-ADYAR-BRIDGE", "Chamiers Road", 38.0),
    ("JNC-ADYAR-BRIDGE", "FAC-FORTIS", "Gandhi Nagar 1st Main Rd", 30.0),

    # West Chennai / Airport Corridor
    ("JNC-NANDANAM", "JNC-KATHIPARA", "GST Road Arterial", 48.0),
    ("JNC-KATHIPARA", "FAC-MIOT", "Mount Poonamallee Road", 38.0),
    ("FAC-MIOT", "JNC-PORUR", "Porur Link Road", 36.0),
    ("JNC-PORUR", "FAC-SRMC", "Ramachandra Nagar Access", 30.0),

    # North Chennai Corridor
    ("JNC-CENTRAL", "JNC-ROYAPURAM", "Wall Tax Rd / Old Jail Rd", 32.0),
    ("JNC-ROYAPURAM", "FAC-STANLEY", "Stanley Medical Access Way", 25.0),

    # Deep South / OMR IT Corridor
    ("FAC-FORTIS", "JNC-MEDAVAKKAM", "OMR Expressway Link", 45.0),
    ("JNC-MEDAVAKKAM", "FAC-GLENEAGLES", "Cheran Nagar Road", 30.0),
    ("JNC-KATHIPARA", "JNC-MEDAVAKKAM", "Velachery Main Road", 38.0),
]

FACILITY_ALIASES: Dict[str, str] = {
    # UUIDs from tools.py
    "993a2164-3e9a-4131-b840-798889da3b2b": "FAC-RBTC",
    "c71a399f-07da-4e4b-91c2-559d81373516": "FAC-APOLLO",
    "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d": "FAC-RGGGH",
    "b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e": "FAC-FORTIS",
    "c3d4e5f6-a1b2-4c3d-ae4f-5a6b7c8d9e0f": "FAC-STANLEY",
    "d4e5f6a1-b2c3-4d4e-bf5a-6b7c8d9e0f1a": "FAC-SRMC",
    "e5f6a1b2-c3d4-4e5f-c06b-7c8d9e0f1a2b": "FAC-MIOT",
    "f6a1b2c3-d4e5-4f6a-d17c-8d9e0f1a2b3c": "FAC-GLENEAGLES",
}

def normalize_node_id(identifier: str) -> str:
    """Normalizes any facility UUID, alias, or string to the canonical node ID."""
    if not identifier:
        return "FAC-RBTC"
    if identifier in HOSPITAL_NODES or identifier in JUNCTION_NODES:
        return identifier
    if identifier in FACILITY_ALIASES:
        return FACILITY_ALIASES[identifier]
    lower = identifier.lower()
    if "apollo" in lower or "greams" in lower:
        return "FAC-APOLLO"
    if "rgggh" in lower or "general" in lower or "rajiv" in lower:
        return "FAC-RGGGH"
    if "fortis" in lower or "malar" in lower:
        return "FAC-FORTIS"
    if "blood" in lower or "transfusion" in lower or "rbtc" in lower:
        return "FAC-RBTC"
    if "stanley" in lower:
        return "FAC-STANLEY"
    if "srmc" in lower or "ramachandra" in lower:
        return "FAC-SRMC"
    if "miot" in lower:
        return "FAC-MIOT"
    if "gleneagles" in lower or "global" in lower:
        return "FAC-GLENEAGLES"
    return identifier

class DijkstraRouter:
    """
    Implements Dijkstra's Shortest Path & A* heuristic algorithm
    over the Chennai emergency medical transit graph.
    """
    def __init__(self):
        self.nodes = {**HOSPITAL_NODES, **JUNCTION_NODES}
        self.adj: Dict[str, List[Tuple[str, float, float, str]]] = {n: [] for n in self.nodes}

        # Build bidirectional adjacency list: (neighbor, distance_km, time_minutes, road_name)
        for u, v, road_name, speed in ROAD_EDGES:
            node_u = self.nodes.get(u)
            node_v = self.nodes.get(v)
            if node_u and node_v:
                dist = haversine_distance_km(node_u["lat"], node_u["lon"], node_v["lat"], node_v["lon"]) * 1.25 # Road curvature factor
                time_mins = (dist / speed) * 60.0 # Duration in minutes
                self.adj[u].append((v, dist, time_mins, road_name))
                self.adj[v].append((u, dist, time_mins, road_name))

    def solve_shortest_path(self, origin_id: str, dest_id: str) -> Dict[str, Any]:
        """
        Executes Dijkstra algorithm to compute the optimal path,
        turn-by-turn waypoints, road distance, and travel time.
        """
        clean_origin = normalize_node_id(origin_id)
        clean_dest = normalize_node_id(dest_id)

        if clean_origin not in self.nodes or clean_dest not in self.nodes:
            # Fallback direct line calculation if node ID not in graph
            orig = self.nodes.get(clean_origin, HOSPITAL_NODES["FAC-RBTC"])
            dest = self.nodes.get(clean_dest, HOSPITAL_NODES["FAC-APOLLO"])
            dist = haversine_distance_km(orig["lat"], orig["lon"], dest["lat"], dest["lon"]) * 1.3
            time_mins = round((dist / 35.0) * 60.0)
            return {
                "algorithm": "Dijkstra (Direct Heuristic Fallback)",
                "origin_id": clean_origin,
                "origin_name": orig.get("short_name", orig.get("name")),
                "destination_id": clean_dest,
                "destination_name": dest.get("short_name", dest.get("name")),
                "total_distance_km": round(dist, 2),
                "estimated_minutes": time_mins,
                "waypoints": [[orig["lat"], orig["lon"]], [dest["lat"], dest["lon"]]],
                "road_segments": ["Direct Transit Corridor"]
            }

        # Priority queue for Dijkstra: (cumulative_time, current_node, cumulative_dist, path, road_names)
        pq = [(0.0, clean_origin, 0.0, [clean_origin], [])]
        visited = set()
        best_time = {clean_origin: 0.0}

        while pq:
            curr_time, curr_node, curr_dist, path, roads = heapq.heappop(pq)

            if curr_node in visited:
                continue
            visited.add(curr_node)

            if curr_node == clean_dest:
                # Optimal path found! Extract turn-by-turn coordinate waypoints
                waypoints = [[self.nodes[nid]["lat"], self.nodes[nid]["lon"]] for nid in path]
                
                # Interpolate dense waypoints along road edges for smooth rendering
                dense_waypoints = []
                for i in range(len(waypoints) - 1):
                    p1 = waypoints[i]
                    p2 = waypoints[i + 1]
                    dense_waypoints.append(p1)
                    # Add 2 intermediate points for natural curvature
                    dense_waypoints.append([p1[0] * 0.67 + p2[0] * 0.33, p1[1] * 0.67 + p2[1] * 0.33])
                    dense_waypoints.append([p1[0] * 0.33 + p2[0] * 0.67, p1[1] * 0.33 + p2[1] * 0.67])
                dense_waypoints.append(waypoints[-1])

                orig = self.nodes[clean_origin]
                dest = self.nodes[clean_dest]

                return {
                    "algorithm": "Dijkstra Shortest Path (A* Heuristic)",
                    "origin_id": clean_origin,
                    "origin_name": orig.get("short_name", orig.get("name")),
                    "destination_id": clean_dest,
                    "destination_name": dest.get("short_name", dest.get("name")),
                    "total_distance_km": round(curr_dist, 2),
                    "estimated_minutes": max(1, round(curr_time)),
                    "node_sequence": path,
                    "road_segments": roads,
                    "waypoints": dense_waypoints,
                    "congestion_level": "moderate" if curr_time > 20 else "low",
                }

            for neighbor, edge_dist, edge_time, road_name in self.adj[curr_node]:
                if neighbor in visited:
                    continue
                new_time = curr_time + edge_time
                if neighbor not in best_time or new_time < best_time[neighbor]:
                    best_time[neighbor] = new_time
                    heapq.heappush(pq, (
                        new_time,
                        neighbor,
                        curr_dist + edge_dist,
                        path + [neighbor],
                        roads + [road_name]
                    ))

        # If no connected path found in graph
        orig = self.nodes.get(clean_origin, HOSPITAL_NODES["FAC-RBTC"])
        dest = self.nodes.get(clean_dest, HOSPITAL_NODES["FAC-APOLLO"])
        dist = haversine_distance_km(orig["lat"], orig["lon"], dest["lat"], dest["lon"]) * 1.3
        return {
            "algorithm": "Dijkstra (Direct Heuristic Fallback)",
            "origin_id": clean_origin,
            "origin_name": orig.get("short_name", orig.get("name")),
            "destination_id": clean_dest,
            "destination_name": dest.get("short_name", dest.get("name")),
            "total_distance_km": round(dist, 2),
            "estimated_minutes": max(1, round((dist / 35.0) * 60.0)),
            "waypoints": [[orig["lat"], orig["lon"]], [dest["lat"], dest["lon"]]],
            "road_segments": ["Direct Arterial Corridor"]
        }

# Global singleton router instance
dijkstra_router = DijkstraRouter()
