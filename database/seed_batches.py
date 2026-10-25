import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).resolve().parent / "vitalis.db"

INITIAL_BATCHES = [
  {
    "batchUuid": "PRBC-84d5-9a58",
    "facilityId": "FAC-FORTIS",
    "facilityName": "Fortis Malar Hospital",
    "traumaLevel": 2,
    "resourceType": "PRBC",
    "bloodGroup": "O-",
    "unitsAvailable": 4,
    "liveStorageTempC": 7.4,
    "tempStatus": "critical",
    "expiryDate": "2026-10-22",
    "hoursUntilExpiry": 96.0,
    "donorHash": "SHA256:d8a9...41c2",
    "storageChamberId": "CHAMBER-E1-SOUTH",
  },
  {
    "batchUuid": "PRBC-192a-3301",
    "facilityId": "FAC-APOLLO",
    "facilityName": "Apollo Hospitals, Greams Road",
    "traumaLevel": 1,
    "resourceType": "PRBC",
    "bloodGroup": "O-",
    "unitsAvailable": 2,
    "liveStorageTempC": 5.2,
    "tempStatus": "warning",
    "expiryDate": "2026-10-19",
    "hoursUntilExpiry": 18.5,
    "donorHash": "SHA256:fa31...99bc",
    "storageChamberId": "CHAMBER-A3-MAIN",
  },
  {
    "batchUuid": "PRBC-7721-e940",
    "facilityId": "FAC-RBTC",
    "facilityName": "Regional Blood Transfusion Center",
    "traumaLevel": 1,
    "resourceType": "PRBC",
    "bloodGroup": "O-",
    "unitsAvailable": 28,
    "liveStorageTempC": 3.2,
    "tempStatus": "safe",
    "expiryDate": "2026-11-12",
    "hoursUntilExpiry": 580.0,
    "donorHash": "SHA256:12bc...33aa",
    "storageChamberId": "CENTRAL-VAULT-01",
  },
  {
    "batchUuid": "PLT-6029-bb11",
    "facilityId": "FAC-RGGGH",
    "facilityName": "Rajiv Gandhi Govt General Hospital",
    "traumaLevel": 1,
    "resourceType": "Platelets",
    "bloodGroup": "O+",
    "unitsAvailable": 12,
    "liveStorageTempC": 21.8,
    "tempStatus": "safe",
    "expiryDate": "2026-10-18",
    "hoursUntilExpiry": 22.0,
    "donorHash": "SHA256:9901...44ff",
    "storageChamberId": "AGITATOR-BAY-4",
  },
  {
    "batchUuid": "PRBC-4412-aa09",
    "facilityId": "FAC-MIOT",
    "facilityName": "MIOT International Hospital",
    "traumaLevel": 2,
    "resourceType": "PRBC",
    "bloodGroup": "B+",
    "unitsAvailable": 18,
    "liveStorageTempC": 3.9,
    "tempStatus": "safe",
    "expiryDate": "2026-11-04",
    "hoursUntilExpiry": 412.0,
    "donorHash": "SHA256:55aa...11cc",
    "storageChamberId": "CHAMBER-M2-WEST",
  },
  {
    "batchUuid": "FFP-3011-dd78",
    "facilityId": "FAC-STANLEY",
    "facilityName": "Stanley Medical College Hospital",
    "traumaLevel": 1,
    "resourceType": "FFP",
    "bloodGroup": "AB+",
    "unitsAvailable": 15,
    "liveStorageTempC": -22.4,
    "tempStatus": "safe",
    "expiryDate": "2026-12-30",
    "hoursUntilExpiry": 1680.0,
    "donorHash": "SHA256:33ee...8821",
    "storageChamberId": "DEEP-FREEZER-F1",
  },
  {
    "batchUuid": "PRBC-9920-cc45",
    "facilityId": "FAC-SRMC",
    "facilityName": "Sri Ramachandra (SRMC)",
    "traumaLevel": 2,
    "resourceType": "PRBC",
    "bloodGroup": "A+",
    "unitsAvailable": 22,
    "liveStorageTempC": 3.6,
    "tempStatus": "safe",
    "expiryDate": "2026-11-08",
    "hoursUntilExpiry": 500.0,
    "donorHash": "SHA256:77ff...2233",
    "storageChamberId": "CHAMBER-S1-MAIN",
  },
  {
    "batchUuid": "CRYO-1102-ee99",
    "facilityId": "FAC-GLENEAGLES",
    "facilityName": "Gleneagles Health City",
    "traumaLevel": 1,
    "resourceType": "Cryo",
    "bloodGroup": "O-",
    "unitsAvailable": 6,
    "liveStorageTempC": -20.8,
    "tempStatus": "safe",
    "expiryDate": "2026-12-15",
    "hoursUntilExpiry": 1340.0,
    "donorHash": "SHA256:8899...aabb",
    "storageChamberId": "CRYOBANK-G1",
  }
]

def seed():
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()
    c.execute("""
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
    now_iso = datetime.now().isoformat()
    for b in INITIAL_BATCHES:
        c.execute("""
            INSERT OR REPLACE INTO inventory_batches (
                batch_uuid, facility_id, facility_name, trauma_level,
                resource_type, blood_group, units_available, live_temp_c,
                temp_status, expiry_date, hours_until_expiry, donor_hash,
                storage_chamber_id, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            b["batchUuid"], b["facilityId"], b["facilityName"], b["traumaLevel"],
            b["resourceType"], b["bloodGroup"], b["unitsAvailable"], b["liveStorageTempC"],
            b["tempStatus"], b["expiryDate"], b["hoursUntilExpiry"], b["donorHash"],
            b["storageChamberId"], now_iso
        ))
    
    # Also clean up nulls in transfer_requests
    c.execute("""
        UPDATE transfer_requests
        SET distance_km = 4.68,
            estimated_minutes = 11,
            assigned_driver_id = 'VTL-DRV-784',
            assigned_driver_name = 'Vikramaditya Rao',
            courier_id = 'COU-CH-104',
            vehicle_type = 'Refrigerated EV Van #104'
        WHERE id = 'f51e9697-443d-47af-b7fe-c228512f4176'
    """)

    conn.commit()
    c.execute("SELECT COUNT(*) FROM inventory_batches")
    print("Seeded inventory_batches:", c.fetchone()[0], "records in SQLite!")
    conn.close()

if __name__ == "__main__":
    seed()
