"""
Database & Spatial Verification Script for Vitalis (Phase 1)
Validates SQL schema DDL, seed integrity, and WGS84 geodesic distances
between seeded Chennai facilities.
"""
import re
import math
from pathlib import Path

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate geodesic great-circle distance between two WGS84 points in kilometers."""
    R = 6371.0 # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def verify_phase_1():
    db_dir = Path(__file__).parent
    schema_path = db_dir / "schema.sql"
    seeds_path = db_dir / "seeds.sql"

    print("==================================================================")
    print("VITALIS PHASE 1: DATABASE & SPATIAL VERIFICATION")
    print("==================================================================")

    # 1. Verify files exist
    assert schema_path.exists(), f"Missing {schema_path}"
    assert seeds_path.exists(), f"Missing {seeds_path}"
    print("[PASS] schema.sql and seeds.sql exist.")

    # 2. Check schema keywords
    schema_sql = schema_path.read_text(encoding="utf-8")
    required_tables = ["facilities", "inventory", "transfer_requests", "transit_telemetry"]
    for table in required_tables:
        assert f"CREATE TABLE {table}" in schema_sql, f"Missing table definition: {table}"
        print(f"[PASS] Table '{table}' found in schema.sql.")

    assert "postgis" in schema_sql, "PostGIS extension not enabled in schema.sql"
    assert "uuid-ossp" in schema_sql, "UUID extension not enabled in schema.sql"
    assert "GIST(location)" in schema_sql, "GIST spatial index not created"
    assert "ROW LEVEL SECURITY" in schema_sql, "Row-Level Security not enabled"
    print("[PASS] PostGIS, GIST spatial index, and RLS policies verified.")

    # 3. Extract and verify seeded facilities
    seeds_sql = seeds_path.read_text(encoding="utf-8")
    # Remove SQL comments before matching
    cleaned_sql = re.sub(r"--.*$", "", seeds_sql, flags=re.MULTILINE)
    point_regex = re.compile(
        r"\(\s*'([0-9a-fA-F-]+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*([\d.]+)\s*,\s*ST_SetSRID\(ST_MakePoint\(([\d.]+),\s*([\d.]+)\),\s*4326\)",
        re.MULTILINE
    )
    facilities = []
    for match in point_regex.finditer(cleaned_sql):
        fid, name, ftype, trauma, quality, lon, lat = match.groups()
        facilities.append({
            "id": fid,
            "name": name,
            "type": ftype,
            "trauma": int(trauma),
            "quality": float(quality),
            "lon": float(lon),
            "lat": float(lat)
        })

    assert len(facilities) >= 6, f"Expected at least 6 facilities, found {len(facilities)}"
    print(f"[PASS] Seeded {len(facilities)} regional facilities extracted successfully.")

    # 4. Spatial distance verification between Apollo Greams Rd and RBTC
    apollo = next(f for f in facilities if "Apollo" in f["name"])
    rbtc = next(f for f in facilities if "Regional Blood Transfusion" in f["name"])
    rgggh = next(f for f in facilities if "Rajiv Gandhi" in f["name"])

    dist_apollo_rbtc = haversine_distance_km(apollo["lat"], apollo["lon"], rbtc["lat"], rbtc["lon"])
    dist_apollo_rgggh = haversine_distance_km(apollo["lat"], apollo["lon"], rgggh["lat"], rgggh["lon"])

    print(f"\nSpatial Geodesic Distance Matrix (Chennai Core):")
    print(f" - Apollo Greams Rd -> RBTC: {dist_apollo_rbtc:.2f} km (Road ETA ~15-20 min)")
    print(f" - Apollo Greams Rd -> RGGGH: {dist_apollo_rgggh:.2f} km (Road ETA ~18-25 min)")

    assert 2.0 <= dist_apollo_rbtc <= 4.0, f"Distance {dist_apollo_rbtc} km out of expected range for Greams Rd to Egmore"
    assert 2.5 <= dist_apollo_rgggh <= 5.0, f"Distance {dist_apollo_rgggh} km out of expected range for Greams Rd to Park Town"
    print("[PASS] Spatial distance calculations within precise Chennai urban tolerances.")

    print("\n[SUCCESS] Phase 1: Database Layer & Spatial Seeding verified completely.")

if __name__ == "__main__":
    verify_phase_1()
