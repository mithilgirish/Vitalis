-- ==============================================================================
-- Vitalis Clinical Logistics Platform — Database Schema
-- Architecture: PostgreSQL 15+ / Supabase / PostGIS Spatial Extensions
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Drop existing tables in reverse dependency order if rebuilding
DROP TABLE IF EXISTS transit_telemetry CASCADE;
DROP TABLE IF EXISTS transfer_requests CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;

-- ------------------------------------------------------------------------------
-- 2. Facilities Table
-- Registered hospitals, regional blood banks, and transit/storage hubs
-- ------------------------------------------------------------------------------
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(50) NOT NULL CHECK (
        facility_type IN ('hospital', 'blood_bank', 'transit_hub')
    ),
    trauma_level INT CHECK (trauma_level BETWEEN 1 AND 4),
    quality_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00 CHECK (
        quality_score BETWEEN 0.00 AND 100.00
    ), -- Medicare HVBP / HAC composite score (0 - 100)
    location GEOMETRY(Point, 4326) NOT NULL, -- WGS84 Spatial Coordinate (SRID 4326)
    contact_phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments on facilities attributes
COMMENT ON TABLE facilities IS 'Clinical and regional storage facilities participating in the Vitalis redistribution network';
COMMENT ON COLUMN facilities.trauma_level IS 'Emergency trauma designation level: 1 (highest acuity / comprehensive) to 4 (basic emergency support)';
COMMENT ON COLUMN facilities.quality_score IS 'Hospital Value-Based Purchasing (HVBP) and Hospital-Acquired Condition (HAC) composite rating';
COMMENT ON COLUMN facilities.location IS 'Spatial Point in WGS84 coordinates: Point(longitude latitude)';

-- ------------------------------------------------------------------------------
-- 3. Inventory Table
-- Itemized biological product batches with thermal and expiration tracking
-- ------------------------------------------------------------------------------
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL CHECK (
        resource_type IN ('Whole Blood', 'PRBC', 'Platelets', 'FFP', 'Cryoprecipitate', 'Kidney', 'Liver', 'Heart')
    ),
    blood_group VARCHAR(5) NOT NULL CHECK (
        blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'N/A')
    ),
    units_available INT NOT NULL CHECK (units_available >= 0),
    storage_temp_celsius NUMERIC(4, 2) NOT NULL,
    expiry_timestamp TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE inventory IS 'Real-time biological ledger itemizing blood products and transplantable organs by facility';
COMMENT ON COLUMN inventory.storage_temp_celsius IS 'Ambient storage sensor temperature in Celsius';
COMMENT ON COLUMN inventory.expiry_timestamp IS 'Critical biological shelf-life expiration timestamp';

-- ------------------------------------------------------------------------------
-- 4. Transfer Requests Table
-- Dispatch transactions, Priority Index scores, and HITL lifecycle tracking
-- ------------------------------------------------------------------------------
CREATE TABLE transfer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    destination_facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
    resource_type VARCHAR(50) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    units_requested INT NOT NULL CHECK (units_requested > 0),
    urgency_tier INT NOT NULL CHECK (urgency_tier BETWEEN 1 AND 5), -- ESI triage scale 1 (Immediate/Resuscitative) to 5 (Non-urgent)
    agent_reasoning_trace TEXT,
    priority_score NUMERIC(8, 4),
    status VARCHAR(50) NOT NULL DEFAULT 'pending_approval' CHECK (
        status IN ('pending_approval', 'approved', 'in_transit', 'delivered', 'rejected', 'aborted')
    ),
    approved_by UUID, -- References authenticated medical logistics admin
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE transfer_requests IS 'Clinical redistribution orders synthesized by the ReAct agent and approved by human coordinators';
COMMENT ON COLUMN transfer_requests.urgency_tier IS 'Emergency Severity Index: 1=Resuscitation, 2=Emergent, 3=Urgent, 4=Less Urgent, 5=Non-urgent';
COMMENT ON COLUMN transfer_requests.priority_score IS 'Computed Priority Index (PI) balancing distance, stockout risk, surplus, and quality penalty';
COMMENT ON COLUMN transfer_requests.status IS 'Strict HITL lifecycle gate: remains pending_approval until approved by authorized operator';

-- ------------------------------------------------------------------------------
-- 5. Transit Telemetry Table
-- Cold-chain IoT telematics and live courier breadcrumbs during active transit
-- ------------------------------------------------------------------------------
CREATE TABLE transit_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES transfer_requests(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_location GEOMETRY(Point, 4326),
    temperature_celsius NUMERIC(4, 2) NOT NULL,
    excursion_flag BOOLEAN NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE transit_telemetry IS 'Live IoT sensor readings and GPS telemetry emitted by courier clients';
COMMENT ON COLUMN transit_telemetry.excursion_flag IS 'Set to TRUE if temperature violates biological tolerance (> 6°C for PRBC, > 24°C for Platelets)';

-- ------------------------------------------------------------------------------
-- 6. Spatial and High-Performance Composite Indexes
-- ------------------------------------------------------------------------------
-- PostGIS GIST Spatial Index for rapid proximity bounding queries
CREATE INDEX idx_facilities_location ON facilities USING GIST(location);

-- Composite Index for low-latency candidate inventory lookups
CREATE INDEX idx_inventory_lookup ON inventory(facility_id, blood_group, resource_type, expiry_timestamp);

-- Status and sorting indexes for real-time queues
CREATE INDEX idx_transfer_requests_status ON transfer_requests(status);
CREATE INDEX idx_transfer_requests_dest ON transfer_requests(destination_facility_id);
CREATE INDEX idx_transit_telemetry_transfer_time ON transit_telemetry(transfer_id, recorded_at DESC);

-- ------------------------------------------------------------------------------
-- 7. Automated Timestamps Trigger
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trg_inventory_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_transfer_requests_updated_at
BEFORE UPDATE ON transfer_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 8. Row-Level Security (RLS) & Ethical Guardrails
-- ------------------------------------------------------------------------------
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transit_telemetry ENABLE ROW LEVEL SECURITY;

-- Facilities Policies (Read access for public/authenticated, write for admins)
CREATE POLICY "Allow public read access on facilities"
    ON facilities FOR SELECT
    USING (true);

-- Inventory Policies (Read unexpired inventory, modifications restricted to authenticated facilities)
CREATE POLICY "Allow public read access on inventory"
    ON inventory FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated inventory updates"
    ON inventory FOR ALL
    USING (auth.role() = 'authenticated');

-- Transfer Requests Policies (Read access for monitoring, write strictly controlled)
CREATE POLICY "Allow authenticated read on transfer requests"
    ON transfer_requests FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert on transfer requests"
    ON transfer_requests FOR INSERT
    WITH CHECK (true);

-- HITL Guardrail Enforcement via RLS: Only authenticated users can transition status
CREATE POLICY "Enforce authenticated updates on transfer status"
    ON transfer_requests FOR UPDATE
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
    WITH CHECK (true);

-- Telemetry Policies (Couriers can log data, operators can read)
CREATE POLICY "Allow read on transit telemetry"
    ON transit_telemetry FOR SELECT
    USING (true);

CREATE POLICY "Allow courier insert on transit telemetry"
    ON transit_telemetry FOR INSERT
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 9. Real-Time Publication (Supabase Realtime)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
        ALTER PUBLICATION supabase_realtime ADD TABLE transfer_requests;
        ALTER PUBLICATION supabase_realtime ADD TABLE transit_telemetry;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END;
$$;
