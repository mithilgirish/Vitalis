PLAN.md — Vitalis Autonomous Build Plan
0. Agent Execution Directives & Global Rules
 * Project Scope: Build Vitalis, an event-driven, agentic clinical logistics platform for blood, organ, and medical supply redistribution.
 * Strict Governance Rule: Enforce Human-in-the-Loop (HITL) verification across all layers; the backend and agent must never autonomously transition a transfer request to in_transit without an explicit authenticated admin approval action.
 * Execution Order: Execute Phases 1 through 5 sequentially, verifying all acceptance criteria at the end of each phase before proceeding to the next.
 * Monorepo Architecture: Maintain the following directory structure across the workspace:
vitalis/
├── apps/
│   ├── web/                              # Next.js + Tailwind CSS Command Center
│   └── mobile/                           # React Native + Expo Courier Client
├── backend/                              # FastAPI + LangChain ReAct Gateway
│   ├── api/
│   │   ├── main.py
│   │   ├── routes.py
│   │   └── schemas.py
│   ├── agent/
│   │   ├── triage_client.py
│   │   ├── tools.py
│   │   └── orchestrator.py
│   └── requirements.txt
├── ml_pipeline/                          # Prophet & XGBoost Predictive Engine
│   ├── data/
│   ├── models/
│   │   ├── prophet_model.pkl
│   │   └── xgb_stockout.json
│   ├── notebooks/
│   │   └── NHAMCS_Preprocessing_and_Training.ipynb
│   └── train_pipeline.py
├── database/                             # Supabase / PostgreSQL / PostGIS
│   ├── schema.sql
│   └── seeds.sql
└── .env.example

Phase 1: Database Layer & Spatial Seeding (database/)
1.1 Objectives
Initialize the PostgreSQL database on Supabase with PostGIS spatial capabilities, enforce row-level and check constraints, and seed regional hospital nodes.
1.2 Tasks
 * Create database/schema.sql:
   * Enable the uuid-ossp and postgis extensions.
   * Create the facilities table with id (UUID PK), name, facility_type (hospital, blood_bank, transit_hub), trauma_level (1–4), quality_score (NUMERIC default 100.00 representing Medicare HVBP/HAC composite scores), location (GEOMETRY(Point, 4326)), contact_phone, and created_at.
   * Create the inventory table referencing facilities(id) (ON DELETE CASCADE) with resource_type (Whole Blood, PRBC, Platelets, FFP, Cryoprecipitate, Kidney, Liver, Heart), blood_group (A+, A-, B+, B-, AB+, AB-, O+, O-, N/A), units_available (\ge 0), storage_temp_celsius, expiry_timestamp, and updated_at.
   * Create the transfer_requests table tracking origin_facility_id, destination_facility_id, resource_type, blood_group, units_requested (> 0), urgency_tier (1–5), agent_reasoning_trace, priority_score, status (pending_approval, approved, in_transit, delivered, rejected, aborted — defaulting to pending_approval), approved_by, created_at, and updated_at.
   * Create the transit_telemetry table referencing transfer_requests(id) with recorded_at, current_location (GEOMETRY(Point, 4326)), temperature_celsius, and excursion_flag (BOOLEAN default FALSE).
   * Create the GIST spatial index idx_facilities_location on facilities(location), composite index idx_inventory_lookup on inventory(facility_id, blood_group, resource_type, expiry_timestamp), and status index idx_transfer_requests_status on transfer_requests(status).
 * Create database/seeds.sql:
   * Seed 6 to 8 realistic regional hospital and blood bank nodes in Chennai (e.g., Apollo Greams Rd, Rajiv Gandhi Government General Hospital, Fortis Malar, Regional Blood Transfusion Center) with accurate WGS84 coordinates (ST_SetSRID(ST_MakePoint(lon, lat), 4326)), varied trauma levels, and Medicare HVBP/HAC quality_score values ranging from 72.0 to 99.0.
   * Populate inventory batches across facilities with varying unit counts, storage temperatures, and expiration timestamps.
1.3 Acceptance Criteria
 * Running schema.sql and seeds.sql executes without syntax or constraint errors.
 * A spatial query using ST_DWithin returns accurate kilometer distances between seeded Chennai hospital coordinates.
Phase 2: Predictive Stockout Engine & ML Pipeline (ml_pipeline/)
2.1 Objectives
Build the academic machine learning pipeline on emergency department data to generate rolling 14-day demand forecasts and a 72-hour donor stockout risk classifier.
2.2 Tasks
 * Create ml_pipeline/train_pipeline.py & ml_pipeline/notebooks/NHAMCS_Preprocessing_and_Training.ipynb:
   * Implement data loading, cleaning, missing value imputation, temporal resampling, and Emergency Severity Index (ESI) extraction modeled on the CDC NHAMCS dataset.
   * Construct the daily aggregated consumption response variable Y_{d,g} for calendar date d and blood product group g.
   * Engineer cyclical temporal features: \sin\left(\frac{2\pi \cdot \text{day}}{7}\right), \cos\left(\frac{2\pi \cdot \text{day}}{7}\right), \sin\left(\frac{2\pi \cdot \text{month}}{12}\right), and \cos\left(\frac{2\pi \cdot \text{month}}{12}\right), alongside 1-day lag, 7-day rolling mean, and 14-day rolling standard deviation windows.
 * Train Model A (Meta Prophet Forecasting Engine):
   * Configure Prophet with growth='linear', yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False, and interval_width=0.80 (80% confidence bands) for 7-day and 14-day rolling horizons.
   * Evaluate against Mean Absolute Scaled Error (\text{MASE} < 1.15) and serialize the artifact to ml_pipeline/models/prophet_model.pkl.
 * Train Model B (XGBoost Depletion Guardrail Classifier):
   * Configure an XGBoost binary classifier (objective='binary:logistic', max_depth=5, learning_rate=0.05, n_estimators=250, tuned scale_pos_weight) to predict 72-hour stockout probability P(Y = 1 \mid \vec{x}).
   * Define feature vector \vec{x} = [\text{current\_inventory} - k, \hat{y}_{t \le 3}, \text{HAC\_score}, \text{trauma\_level}, \text{burn\_rate}_{7d}] where k is units requested.
   * Verify \text{PR-AUC} \ge 0.82 and \text{Recall} \ge 0.90, then export weights to ml_pipeline/models/xgb_stockout.json.
2.3 Acceptance Criteria
 * Running python ml_pipeline/train_pipeline.py generates both prophet_model.pkl and xgb_stockout.json.
 * The notebook NHAMCS_Preprocessing_and_Training.ipynb clearly documents loading, cleaning, feature selection, training, and evaluation for BCSE335L Module 3 and Module 5 grading.
Phase 3: FastAPI Backend, Ingestion & LangChain ReAct Agent (backend/)
3.1 Objectives
Build the asynchronous FastAPI gateway, the deterministic Jev/NLP triage extraction layer, and the LangChain ReAct agent with custom tool wrappers and Priority Index scoring.
3.2 Tasks
 * Create Pydantic Schemas (backend/api/schemas.py):
   * Define TriageIngestRequest (raw_text: str, source: Literal['radio', 'sms', 'ehr', 'manual']).
   * Define TriageExtractionPayload enforcing resource_type, blood_group, units_requested (1 \le \text{units} \le 50), urgency_tier (1 \le \text{tier} \le 5), target_facility_name, and confidence_score.
   * Define request/response models for /api/v1/agent/solve-dispatch and /api/v1/dispatch/{transfer_id}/action.
 * Implement Ingestion Service (backend/agent/triage_client.py):
   * Implement the System One Jev / structured NLP extractor that parses messy emergency inputs into TriageExtractionPayload within \le 500\text{ ms}.
 * Implement LangChain Custom Tools (backend/agent/tools.py):
   * lookup_candidate_inventory: Executes the parameterized PostGIS query using ST_Distance and ST_DWithin to find facilities within radius_km (default 30.0\text{ km}) holding unexpired stock (expiry_timestamp > NOW() + INTERVAL '24 hours').
   * evaluate_stockout_risk: Loads xgb_stockout.json (with fallback simulation) to compute the 72-hour source depletion probability for donating k units; flag any candidate where \text{Risk}_{\text{stockout}}(F_i, k) > 0.40 as disqualified.
   * calculate_transit_viability: Computes estimated transit time via OSRM/Haversine distance and validates biological shelf-life windows (Platelets \le 5\text{ days} with agitation constraints; PRBC 35–42 days at 1°C–6°C; Heart/Lung \le 4\text{ hours}; Kidney \le 24\text{ hours}).
 * Implement ReAct Orchestrator & Priority Engine (backend/agent/orchestrator.py):
   * Rank valid donor candidates using the Priority Index (PI) formula:
     
   * Compute sub-components as:
     *      *      *    * Synthesize an explainable clinical reasoning_trace detailing why the top donor was selected and persist the recommendation into transfer_requests with status = 'pending_approval'.
 * Expose REST & WebSocket Endpoints (backend/api/routes.py & main.py):
   * POST /api/v1/triage/ingest: Parses unstructured dispatch text.
   * POST /api/v1/agent/solve-dispatch: Runs the LangChain ReAct loop in \le 3.5\text{ seconds} and returns ranked recommendations.
   * PATCH /api/v1/dispatch/{transfer_id}/action: Enforces the HITL gate, updating status to in_transit (on approve) or rejected (on reject) and recording approved_by_user_id.
   * POST /api/v1/telemetry/log: Ingests courier GPS and cold-chain temperature readings into transit_telemetry and evaluates excursion thresholds.
3.3 Acceptance Criteria
 * All endpoints match the JSON request/response schemas defined in Section 6 of the SRS.
 * Attempting to dispatch a donor with > 0.40 stockout risk is blocked by the guardrail.
Phase 4: Next.js Command Center (apps/web/)
4.1 Objectives
Develop the real-time operational web console for descriptive network monitoring, predictive stockout visualization, and Human-in-the-Loop transfer approval.
4.2 Tasks
 * Scaffold Next.js + Tailwind CSS Application:
   * Configure Supabase client (@supabase/supabase-js) for real-time table subscriptions on inventory, transfer_requests, and transit_telemetry.
 * Build Core Views & Components:
   * GIS Command Dashboard (/dashboard): Render an interactive dark-mode regional map showing hospital nodes color-coded by inventory status, active transit routes, and 14-day Prophet demand forecast sparklines.
   * Unstructured Triage Simulator Drawer: Provide a quick-input console where operators (or evaluators during the demo) can paste raw radio/SMS strings, trigger POST /api/v1/triage/ingest, inspect the extracted Pydantic JSON, and launch the ReAct solver.
   * HITL Approval Queue (/approvals): Display pending transfer cards showing the Priority Index (PI) breakdown, distance, donor stockout risk percentage, Medicare HVBP/HAC quality score, and the full agent_reasoning_trace. Include authenticated 1-Click Approve & Dispatch and Reject buttons wired to PATCH /api/v1/dispatch/{transfer_id}/action.
   * Inventory Ledger (/inventory): Render a filterable datagrid of biological batches across facilities with expiration countdowns and live storage temperatures.
   * Cold-Chain Excursion Banner: Subscribe to transit_telemetry where excursion_flag = true and trigger an immediate visual/audio alarm if an active transit exceeds biological temperature tolerances.
4.3 Acceptance Criteria
 * Submitting a raw emergency text renders the agent's ranked recommendation and reasoning trace in the UI within 3.5 seconds.
 * Clicking "Approve" transitions the transfer request from pending_approval to in_transit in Supabase in real time.
Phase 5: React Native Courier Client (apps/mobile/)
5.1 Objectives
Build the cross-platform Expo mobile application for logistics drivers to manage turn-by-turn routing, chain-of-custody handoffs, and IoT cold-chain telemetry.
5.2 Tasks
 * Scaffold Expo Application (apps/mobile/):
   * Configure navigation and Supabase real-time listeners for transfers with status = 'in_transit'.
 * Build Driver Screens:
   * Active Mission & Route Screen: Display origin pickup facility, destination hospital, units/resource details, and turn-by-turn route telemetry that polls and transmits device GPS coordinates every 15 seconds.
   * IoT Cold-Chain Telemetry Logger: Stream simulated or Bluetooth sensor temperatures every 60 seconds to /api/v1/telemetry/log, plus manual confirmation prompts at pickup and handoff. Automatically trip excursion_flag = true if temperature exceeds > 6^\circ\text{C} for PRBC/RBC or > 24^\circ\text{C} for Platelets.
   * Chain-of-Custody Scanner: Implement a barcode/QR scan verification screen at pickup and delivery handoff to update the transfer status to delivered.
5.3 Acceptance Criteria
 * Approving a transfer on the Next.js Command Center immediately pushes the active dispatch mission to the React Native app.
 * Simulating a temperature spike (> 6^\circ\text{C} for PRBC) in the mobile app triggers an excursion alert on the Next.js Command Center within 2 seconds.
Phase 6: End-to-End Demo Verification Script
Before concluding the build, execute the following verification flow:
 * Send POST /api/v1/triage/ingest with "Need 4 units of O-negative blood immediately at Apollo Greams Rd for an incoming Level 1 trauma victim." and verify extraction of PRBC, O-, 4 units, and urgency_tier: 1.
 * Trigger POST /api/v1/agent/solve-dispatch and confirm the ReAct agent selects the optimal donor using the Priority Index (PI) formula while respecting the 0.40 XGBoost stockout guardrail and HAC/HVBP quality penalties.
 * Approve the transfer in the Next.js HITL queue (PATCH /api/v1/dispatch/{transfer_id}/action) and verify the courier dispatch broadcast transitions the record to in_transit.