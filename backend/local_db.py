"""
Local SQLite Database Layer for Vitalis Platform
Enables 100% offline, local-first operation without requiring external PostgreSQL servers.
Synchronizes transfers, telemetry, and inventory state between Web and Mobile clients.
"""

import sqlite3
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional

DB_PATH = Path(__file__).resolve().parent.parent / "database" / "vitalis.db"

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes local SQLite tables and seeds baseline demo records if empty."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_connection() as conn:
        cursor = conn.cursor()

        # 1. System Metadata & Synced Server Time
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_meta (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)

        # 2. Transfer Requests Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transfer_requests (
                id TEXT PRIMARY KEY,
                origin_facility_id TEXT,
                origin_facility_name TEXT,
                destination_facility_id TEXT,
                destination_facility_name TEXT,
                resource_type TEXT NOT NULL,
                blood_group TEXT NOT NULL,
                units_requested INTEGER NOT NULL,
                urgency_tier INTEGER NOT NULL,
                priority_score REAL DEFAULT 0.0,
                status TEXT NOT NULL,
                approved_by TEXT,
                rejection_reason TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT,
                reasoning_trace TEXT
            )
        """)

        # 3. Transit Telemetry Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transit_telemetry (
                id TEXT PRIMARY KEY,
                transfer_id TEXT NOT NULL,
                courier_id TEXT NOT NULL,
                location_json TEXT,
                temperature_celsius REAL NOT NULL,
                excursion_flag INTEGER NOT NULL,
                alert TEXT,
                recorded_at TEXT NOT NULL
            )
        """)

        # 4. Biological Inventory Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS inventory_batches (
                batch_uuid TEXT PRIMARY KEY,
                facility_id TEXT NOT NULL,
                facility_name TEXT NOT NULL,
                trauma_level INTEGER NOT NULL,
                resource_type TEXT NOT NULL,
                blood_group TEXT NOT NULL,
                units_available INTEGER NOT NULL,
                live_temp_c REAL NOT NULL,
                temp_status TEXT NOT NULL,
                expiry_date TEXT NOT NULL,
                hours_until_expiry REAL NOT NULL,
                donor_hash TEXT,
                storage_chamber_id TEXT,
                updated_at TEXT NOT NULL
            )
        """)

        # Check if transfers table is seeded
        cursor.execute("SELECT COUNT(*) FROM transfer_requests")
        count = cursor.fetchone()[0]

        now = datetime.now()
        now_iso = now.isoformat()

        if count == 0:
            # Seed initial demo transfer matching web and mobile
            cursor.execute("""
                INSERT INTO transfer_requests (
                    id, origin_facility_id, origin_facility_name,
                    destination_facility_id, destination_facility_name,
                    resource_type, blood_group, units_requested,
                    urgency_tier, priority_score, status, approved_by,
                    created_at, reasoning_trace
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            """, (
                "84d59a58-6923-41bb-a5a4-9e32f053dc9a",
                "993a2164-3e9a-4131-b840-798889da3b2b",
                "Regional Blood Transfusion Center",
                "c71a399f-07da-4e4b-91c2-559d81373516",
                "Apollo Hospitals, Greams Road",
                "PRBC",
                "O-",
                4,
                1,
                9.791,
                "in_transit",
                "Dr. Aishwarya Raman",
                now_iso,
                "Candidate holds 28 units of O- PRBC with zero projected 72h stockout risk. Transit time (13 mins) falls well within viability envelope. Quality score is 98.4/100."
            ))

        # Update system meta timestamp
        cursor.execute("""
            INSERT OR REPLACE INTO system_meta (key, value, updated_at)
            VALUES ('network_anchor_date', ?, ?)
        """, (now.strftime("%Y-%m-%d"), now_iso))

        conn.commit()

def get_system_sync_metadata() -> Dict[str, Any]:
    """Returns synchronized system time, calendar date, and active transfers."""
    init_db()
    now = datetime.now()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transfer_requests ORDER BY created_at DESC")
        transfers = [dict(row) for row in cursor.fetchall()]

        cursor.execute("SELECT * FROM transit_telemetry ORDER BY recorded_at DESC LIMIT 15")
        telemetry = []
        for r in cursor.fetchall():
            d = dict(r)
            if d.get("location_json"):
                try:
                    d["location"] = json.loads(d["location_json"])
                except Exception:
                    d["location"] = d["location_json"]
            telemetry.append(d)

    return {
        "server_date": now.strftime("%Y-%m-%d"),
        "server_date_formatted": now.strftime("%a, %b %d, %Y"),
        "server_time_ist": now.strftime("%H:%M:%S") + " IST",
        "server_timestamp": now.isoformat(),
        "transfers": transfers,
        "telemetry": telemetry,
        "active_mission": transfers[0] if transfers else None,
        "database_engine": "SQLite 3 (Local-First Synchronized)"
    }

def upsert_transfer(transfer: Dict[str, Any]):
    """Inserts or updates a transfer request in SQLite."""
    init_db()
    now_iso = datetime.now().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO transfer_requests (
                id, origin_facility_id, origin_facility_name,
                destination_facility_id, destination_facility_name,
                resource_type, blood_group, units_requested,
                urgency_tier, priority_score, status, approved_by,
                rejection_reason, created_at, updated_at, reasoning_trace
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                status = excluded.status,
                approved_by = excluded.approved_by,
                rejection_reason = excluded.rejection_reason,
                updated_at = excluded.updated_at
        """, (
            transfer["id"],
            transfer.get("origin_facility_id"),
            transfer.get("origin_facility_name"),
            transfer.get("destination_facility_id"),
            transfer.get("destination_facility_name"),
            transfer.get("resource_type", "PRBC"),
            transfer.get("blood_group", "O-"),
            transfer.get("units_requested", 4),
            transfer.get("urgency_tier", 1),
            transfer.get("priority_score", 0.0),
            transfer.get("status", "pending_approval"),
            transfer.get("approved_by"),
            transfer.get("rejection_reason"),
            transfer.get("created_at", now_iso),
            now_iso,
            transfer.get("reasoning_trace")
        ))
        conn.commit()

def log_telemetry_reading(reading: Dict[str, Any]):
    """Records courier cold-chain GPS and temperature reading into SQLite."""
    init_db()
    loc = reading.get("location")
    loc_str = json.dumps(loc) if isinstance(loc, (dict, list)) else str(loc) if loc else None
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO transit_telemetry (
                id, transfer_id, courier_id, location_json,
                temperature_celsius, excursion_flag, alert, recorded_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            reading["id"],
            reading.get("transfer_id", "84d59a58-6923-41bb-a5a4-9e32f053dc9a"),
            reading.get("courier_id", "COU-CH-104"),
            loc_str,
            reading.get("temperature_celsius", 3.8),
            1 if reading.get("excursion_flag") else 0,
            reading.get("alert"),
            reading.get("recorded_at", datetime.now().isoformat())
        ))
        conn.commit()

# Self-initialize on load
init_db()
