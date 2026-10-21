-- ==============================================================================
-- Vitalis Clinical Logistics Platform — Realistic Spatial Seeds (Chennai Region)
-- WGS84 Spatial Points: ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
-- ==============================================================================

-- Clear existing data if re-seeding
TRUNCATE TABLE transit_telemetry CASCADE;
TRUNCATE TABLE transfer_requests CASCADE;
TRUNCATE TABLE inventory CASCADE;
TRUNCATE TABLE facilities CASCADE;

-- ------------------------------------------------------------------------------
-- 1. Insert Chennai Regional Facilities (Hospitals, Blood Banks, Transit Hubs)
-- ------------------------------------------------------------------------------
INSERT INTO facilities (id, name, facility_type, trauma_level, quality_score, location, contact_phone, created_at)
VALUES
    -- Apollo Hospitals Greams Road (Primary Trauma Center in Central Chennai)
    (
        'c71a399f-07da-4e4b-91c2-559d81373516',
        'Apollo Hospitals, Greams Road',
        'hospital',
        1,
        96.50,
        ST_SetSRID(ST_MakePoint(80.2505, 13.0567), 4326),
        '+91 44 2829 0200',
        NOW()
    ),
    -- Regional Blood Transfusion Center (Central Repository & Transfusion Hub)
    (
        '993a2164-3e9a-4131-b840-798889da3b2b',
        'Regional Blood Transfusion Center',
        'blood_bank',
        1,
        98.40,
        ST_SetSRID(ST_MakePoint(80.2604, 13.0784), 4326),
        '+91 44 2819 1929',
        NOW()
    ),
    -- Rajiv Gandhi Government General Hospital (RGGGH - Major Public Apex Trauma Center)
    (
        'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
        'Rajiv Gandhi Government General Hospital',
        'hospital',
        1,
        91.20,
        ST_SetSRID(ST_MakePoint(80.2798, 13.0805), 4326),
        '+91 44 2530 5000',
        NOW()
    ),
    -- Fortis Malar Hospital (Adyar - South Chennai Node with lower HAC Quality Score)
    (
        'b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e',
        'Fortis Malar Hospital',
        'hospital',
        2,
        74.00, -- Triggers Medicare HAC Quality penalty in ranking algorithm
        ST_SetSRID(ST_MakePoint(80.2570, 13.0068), 4326),
        '+91 44 4289 2222',
        NOW()
    ),
    -- Government Stanley Medical College Hospital (North Chennai Apex Center)
    (
        'c3d4e5f6-a1b2-4c3d-ae4f-5a6b7c8d9e0f',
        'Government Stanley Medical College Hospital',
        'hospital',
        1,
        88.50,
        ST_SetSRID(ST_MakePoint(80.2880, 13.1075), 4326),
        '+91 44 2528 1351',
        NOW()
    ),
    -- Sri Ramachandra Institute of Higher Education (SRMC - West Chennai Node)
    (
        'd4e5f6a1-b2c3-4d4e-bf5a-6b7c8d9e0f1a',
        'Sri Ramachandra Institute of Higher Education',
        'hospital',
        1,
        76.50, -- Triggers moderate HAC Quality penalty
        ST_SetSRID(ST_MakePoint(80.1428, 13.0366), 4326),
        '+91 44 4592 8500',
        NOW()
    ),
    -- MIOT International (Manapakkam - Ortho & Trauma Specialist Hub)
    (
        'e5f6a1b2-c3d4-4e5f-a06b-7c8d9e0f1a2b',
        'MIOT International Hospital',
        'hospital',
        1,
        95.00,
        ST_SetSRID(ST_MakePoint(80.1878, 13.0189), 4326),
        '+91 44 4200 2288',
        NOW()
    ),
    -- Gleneagles Health City Chennai (Perumbakkam - South Peripheral Node)
    (
        'f6a1b2c3-d4e5-4f6a-b17c-8d9e0f1a2b3c',
        'Gleneagles Health City Chennai',
        'hospital',
        2,
        92.00,
        ST_SetSRID(ST_MakePoint(80.2014, 12.8988), 4326),
        '+91 44 6677 8888',
        NOW()
    );

-- ------------------------------------------------------------------------------
-- 2. Insert Inventory Batches Across Facilities
-- ------------------------------------------------------------------------------

-- Regional Blood Transfusion Center (RBTC): Major reserve depository
INSERT INTO inventory (id, facility_id, resource_type, blood_group, units_available, storage_temp_celsius, expiry_timestamp)
VALUES
    (gen_random_uuid(), '993a2164-3e9a-4131-b840-798889da3b2b', 'PRBC', 'O-', 28, 3.20, NOW() + INTERVAL '24 days'),
    (gen_random_uuid(), '993a2164-3e9a-4131-b840-798889da3b2b', 'PRBC', 'O+', 65, 3.10, NOW() + INTERVAL '30 days'),
    (gen_random_uuid(), '993a2164-3e9a-4131-b840-798889da3b2b', 'PRBC', 'A+', 44, 3.30, NOW() + INTERVAL '28 days'),
    (gen_random_uuid(), '993a2164-3e9a-4131-b840-798889da3b2b', 'PRBC', 'B+', 52, 3.25, NOW() + INTERVAL '26 days'),
    (gen_random_uuid(), '993a2164-3e9a-4131-b840-798889da3b2b', 'Platelets', 'O-', 12, 21.50, NOW() + INTERVAL '4 days'),
    (gen_random_uuid(), '993a2164-3e9a-4131-b840-798889da3b2b', 'FFP', 'O-', 30, -22.00, NOW() + INTERVAL '180 days'),
    (gen_random_uuid(), '993a2164-3e9a-4131-b840-798889da3b2b', 'Whole Blood', 'O-', 15, 4.00, NOW() + INTERVAL '21 days');

-- Rajiv Gandhi Government General Hospital (RGGGH): Large public reserve
INSERT INTO inventory (id, facility_id, resource_type, blood_group, units_available, storage_temp_celsius, expiry_timestamp)
VALUES
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d', 'PRBC', 'O-', 14, 3.40, NOW() + INTERVAL '18 days'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d', 'PRBC', 'O+', 50, 3.50, NOW() + INTERVAL '22 days'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d', 'PRBC', 'A-', 8, 3.30, NOW() + INTERVAL '15 days'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d', 'Platelets', 'O+', 16, 22.10, NOW() + INTERVAL '3 days'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d', 'Kidney', 'N/A', 1, 4.00, NOW() + INTERVAL '18 hours');

-- Apollo Hospitals Greams Road: Low stock (requesting facility experiencing trauma spike)
INSERT INTO inventory (id, facility_id, resource_type, blood_group, units_available, storage_temp_celsius, expiry_timestamp)
VALUES
    (gen_random_uuid(), 'c71a399f-07da-4e4b-91c2-559d81373516', 'PRBC', 'O-', 2, 3.80, NOW() + INTERVAL '12 days'),
    (gen_random_uuid(), 'c71a399f-07da-4e4b-91c2-559d81373516', 'PRBC', 'O+', 8, 3.90, NOW() + INTERVAL '14 days'),
    (gen_random_uuid(), 'c71a399f-07da-4e4b-91c2-559d81373516', 'PRBC', 'B+', 12, 3.70, NOW() + INTERVAL '20 days');

-- Government Stanley Medical College: Moderate reserve
INSERT INTO inventory (id, facility_id, resource_type, blood_group, units_available, storage_temp_celsius, expiry_timestamp)
VALUES
    (gen_random_uuid(), 'c3d4e5f6-a1b2-4c3d-ae4f-5a6b7c8d9e0f', 'PRBC', 'O-', 18, 3.60, NOW() + INTERVAL '19 days'),
    (gen_random_uuid(), 'c3d4e5f6-a1b2-4c3d-ae4f-5a6b7c8d9e0f', 'PRBC', 'AB+', 10, 3.50, NOW() + INTERVAL '25 days'),
    (gen_random_uuid(), 'c3d4e5f6-a1b2-4c3d-ae4f-5a6b7c8d9e0f', 'Platelets', 'O-', 6, 21.80, NOW() + INTERVAL '4 days');

-- Fortis Malar Hospital: Very low reserve (attempting to pull 4 units will trigger stockout risk > 0.40)
INSERT INTO inventory (id, facility_id, resource_type, blood_group, units_available, storage_temp_celsius, expiry_timestamp)
VALUES
    (gen_random_uuid(), 'b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e', 'PRBC', 'O-', 4, 4.10, NOW() + INTERVAL '8 days'),
    (gen_random_uuid(), 'b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e', 'PRBC', 'A+', 7, 4.00, NOW() + INTERVAL '10 days');

-- MIOT International: Moderate reserve
INSERT INTO inventory (id, facility_id, resource_type, blood_group, units_available, storage_temp_celsius, expiry_timestamp)
VALUES
    (gen_random_uuid(), 'e5f6a1b2-c3d4-4e5f-a06b-7c8d9e0f1a2b', 'PRBC', 'O-', 16, 3.50, NOW() + INTERVAL '22 days'),
    (gen_random_uuid(), 'e5f6a1b2-c3d4-4e5f-a06b-7c8d9e0f1a2b', 'PRBC', 'B-', 6, 3.60, NOW() + INTERVAL '14 days');

-- Sri Ramachandra (SRMC): Moderate reserve
INSERT INTO inventory (id, facility_id, resource_type, blood_group, units_available, storage_temp_celsius, expiry_timestamp)
VALUES
    (gen_random_uuid(), 'd4e5f6a1-b2c3-4d4e-bf5a-6b7c8d9e0f1a', 'PRBC', 'O-', 9, 4.30, NOW() + INTERVAL '16 days'),
    (gen_random_uuid(), 'd4e5f6a1-b2c3-4d4e-bf5a-6b7c8d9e0f1a', 'Platelets', 'A+', 8, 22.00, NOW() + INTERVAL '3 days');

-- Gleneagles Health City Chennai: Good reserve
INSERT INTO inventory (id, facility_id, resource_type, blood_group, units_available, storage_temp_celsius, expiry_timestamp)
VALUES
    (gen_random_uuid(), 'f6a1b2c3-d4e5-4f6a-b17c-8d9e0f1a2b3c', 'PRBC', 'O-', 22, 3.70, NOW() + INTERVAL '27 days'),
    (gen_random_uuid(), 'f6a1b2c3-d4e5-4f6a-b17c-8d9e0f1a2b3c', 'PRBC', 'O+', 34, 3.80, NOW() + INTERVAL '30 days');

-- ------------------------------------------------------------------------------
-- 3. Initial Baseline Transfer Request (For Demo & Verification)
-- ------------------------------------------------------------------------------
INSERT INTO transfer_requests (
    id,
    origin_facility_id,
    destination_facility_id,
    resource_type,
    blood_group,
    units_requested,
    urgency_tier,
    agent_reasoning_trace,
    priority_score,
    status,
    approved_by,
    created_at
)
VALUES (
    '84d59a58-6923-41bb-a5a4-9e32f053dc9a',
    '993a2164-3e9a-4131-b840-798889da3b2b', -- RBTC
    'c71a399f-07da-4e4b-91c2-559d81373516', -- Apollo Greams Rd
    'PRBC',
    'O-',
    4,
    1,
    'Priority Index = 4.821. Optimal donor Regional Blood Transfusion Center selected: 28 units unexpired O- PRBC in stock, 0.04 72-hour stockout probability, transit distance 6.4 km (18 mins ETA). Quality score 98.4/100.',
    4.8210,
    'pending_approval',
    NULL,
    NOW() - INTERVAL '5 minutes'
);
