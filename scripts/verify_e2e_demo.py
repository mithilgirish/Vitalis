"""
Vitalis End-to-End Demo Verification Suite (Phase 6)
Executes the complete autonomous clinical logistics workflow:
  Step 1: Unstructured Triage NLP Ingestion (FR-1)
  Step 2: ReAct Multi-Tool Agent Optimization & Guardrail Enforcement (FR-2, FR-3)
  Step 3: Human-in-the-Loop (HITL) Gate Verification (FR-4)
  Step 4: IoT Cold-Chain Telemetry & Thermal Excursion Detection (FR-5)
  Step 5: Database Schema & PostGIS Spatial Topology (FR-1)
"""

import sys
import time
from pathlib import Path

# Configure utf-8 stdout encoding for Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient
from backend.api.main import app
from database.verify_database import verify_phase_1

client = TestClient(app)

def run_end_to_end_verification():
    print("=" * 80)
    print("VITALIS PLATFORM: END-TO-END AUTONOMOUS DEMO VERIFICATION")
    print("=" * 80)

    # --------------------------------------------------------------------------
    # Step 1: Database & Spatial Geodesic Validation
    # --------------------------------------------------------------------------
    print("\n[STEP 1] Validating PostGIS Database Layer & Seeded Hospital Topology...")
    verify_phase_1()

    # --------------------------------------------------------------------------
    # Step 2: Unstructured Triage NLP Ingestion (FR-1)
    # --------------------------------------------------------------------------
    print("\n[STEP 2] Simulating Emergency Radio Dispatch Ingestion...")
    raw_prompt = "Need 4 units of O-negative blood immediately at Apollo Greams Rd for an incoming Level 1 trauma victim."
    print(f" -> Ingesting raw radio transmission: \"{raw_prompt}\"")

    start_triage = time.perf_counter()
    triage_resp = client.post("/api/v1/triage/ingest", json={
        "raw_text": raw_prompt,
        "source": "radio"
    })
    triage_elapsed_ms = (time.perf_counter() - start_triage) * 1000.0

    assert triage_resp.status_code == 200, f"Triage failed: {triage_resp.text}"
    triage_data = triage_resp.json()["data"]

    print(f" -> Extraction Result (Latency: {triage_elapsed_ms:.2f} ms):")
    print(f"    • Resource Type    : {triage_data['resource_type']}")
    print(f"    • Blood Group      : {triage_data['blood_group']}")
    print(f"    • Units Requested  : {triage_data['units_requested']}")
    print(f"    • Urgency Tier     : {triage_data['urgency_tier']} (Level 1 Resuscitation)")
    print(f"    • Target Facility  : {triage_data['target_facility_name']}")
    print(f"    • Confidence Score : {triage_data['confidence_score']:.2f}")

    assert triage_data["resource_type"] == "PRBC", "Expected PRBC"
    assert triage_data["blood_group"] == "O-", "Expected O-"
    assert triage_data["units_requested"] == 4, "Expected 4 units"
    assert triage_data["urgency_tier"] == 1, "Expected Urgency Tier 1"
    assert triage_elapsed_ms <= 500.0, "Triage latency exceeded 500ms constraint"
    print(" -> [PASS] Step 1 FR-1 Triage Ingestion verified.")

    # --------------------------------------------------------------------------
    # Step 3: ReAct Multi-Tool Agent Dispatch & Guardrail Enforcement (FR-2 & FR-3)
    # --------------------------------------------------------------------------
    print("\n[STEP 3] Triggering LangChain ReAct Dispatch Optimization...")
    apollo_id = "c71a399f-07da-4e4b-91c2-559d81373516"

    start_agent = time.perf_counter()
    solve_resp = client.post("/api/v1/agent/solve-dispatch", json={
        "destination_facility_id": apollo_id,
        "resource_type": triage_data["resource_type"],
        "blood_group": triage_data["blood_group"],
        "units_requested": triage_data["units_requested"],
        "urgency_tier": triage_data["urgency_tier"]
    })
    agent_elapsed_sec = time.perf_counter() - start_agent

    assert solve_resp.status_code == 200, f"Agent solver failed: {solve_resp.text}"
    solve_data = solve_resp.json()
    transfer_id = solve_data["transfer_request_id"]
    recommendations = solve_data["recommendations"]

    print(f" -> ReAct Agent Convergence Latency: {agent_elapsed_sec:.2f} s")
    print(f" -> Generated Transfer Order UUID  : {transfer_id}")
    print(f" -> Initial Lifecycle Status       : {solve_data['hitl_status']} (Enforces HITL Gate)")

    assert solve_data["hitl_status"] == "pending_approval", "Status must be pending_approval"
    assert len(recommendations) > 0, "Expected candidate recommendations"

    print("\nRanked Donor Candidates:")
    print("-" * 105)
    print(f"{'Rank':<5} | {'Donor Facility':<35} | {'PI Score':<9} | {'Dist (km)':<9} | {'Stockout Risk':<13} | {'Quality':<7}")
    print("-" * 105)
    for rec in recommendations:
        print(
            f"{rec['rank']:<5} | "
            f"{rec['origin_facility_name']:<35} | "
            f"{rec['priority_score']:<9.3f} | "
            f"{rec['distance_km']:<9.1f} | "
            f"{rec['stockout_risk']*100:<12.1f}% | "
            f"{rec['quality_score']:<7.1f}"
        )
    print("-" * 105)

    top_candidate = recommendations[0]
    assert "Regional Blood Transfusion Center" in top_candidate["origin_facility_name"], \
        "Expected Regional Blood Transfusion Center as optimal rank 1 donor"
    assert top_candidate["stockout_risk"] <= 0.40, "Guardrail breach: Stockout risk > 0.40"
    assert agent_elapsed_sec <= 3.5, "Agent latency exceeded 3.5s constraint"

    print(f"\nOptimal Donor Selected: {top_candidate['origin_facility_name']}")
    print(f"Explainable Clinical Reasoning Trace:\n  \"{top_candidate['reasoning_trace']}\"")
    print(" -> [PASS] Step 2 FR-2 & FR-3 ReAct Dispatch & Guardrails verified.")

    # --------------------------------------------------------------------------
    # Step 4: Strict Human-in-the-Loop (HITL) Gate Action (FR-4)
    # --------------------------------------------------------------------------
    print("\n[STEP 4] Executing Human-in-the-Loop (HITL) Admin Approval...")
    action_resp = client.patch(f"/api/v1/dispatch/{transfer_id}/action", json={
        "action": "approve",
        "approved_by_user_id": "dr-swaminathan-apollo-er",
        "rejection_reason": None
    })

    assert action_resp.status_code == 200, f"Action failed: {action_resp.text}"
    action_data = action_resp.json()

    print(f" -> Action Executed               : APPROVE")
    print(f" -> Transitioned Transfer Status  : {action_data['status']}")
    print(f" -> Courier Dispatch Broadcast    : {action_data['courier_dispatch_broadcast']}")

    assert action_data["status"] == "in_transit", "Expected status to transition to in_transit"
    assert action_data["courier_dispatch_broadcast"] is True, "Courier broadcast should be True"
    print(" -> [PASS] Step 3 FR-4 HITL Governance Gate verified.")

    # --------------------------------------------------------------------------
    # Step 5: Cold-Chain Telemetry & Thermal Excursion Detection (FR-5)
    # --------------------------------------------------------------------------
    print("\n[STEP 5] Ingesting IoT Cold-Chain Courier Telemetry...")

    # Case A: Within safe PRBC envelope (3.6°C)
    safe_telemetry = client.post("/api/v1/telemetry/log", json={
        "transfer_id": transfer_id,
        "courier_id": "COU-CH-104",
        "temperature_celsius": 3.6,
        "resource_type": "PRBC",
        "current_location": {"lat": 13.065, "lng": 80.255}
    }).json()
    print(f" -> Safe Reading (3.6°C)  : Status={safe_telemetry['status']}, ExcursionFlag={safe_telemetry['excursion_flag']}")
    assert safe_telemetry["excursion_flag"] is False

    # Case B: Cold-box thermal excursion spike (7.4°C > 6.0°C)
    alarm_telemetry = client.post("/api/v1/telemetry/log", json={
        "transfer_id": transfer_id,
        "courier_id": "COU-CH-104",
        "temperature_celsius": 7.4,
        "resource_type": "PRBC",
        "current_location": {"lat": 13.072, "lng": 80.259}
    }).json()
    print(f" -> Thermal Spike (7.4°C) : Status={alarm_telemetry['status']}, ExcursionFlag={alarm_telemetry['excursion_flag']}")
    print(f"    ALARM BROADCAST: {alarm_telemetry['alert_message']}")
    assert alarm_telemetry["excursion_flag"] is True
    assert "CRITICAL THERMAL EXCURSION" in alarm_telemetry["alert_message"]
    print(" -> [PASS] Step 4 FR-5 IoT Telemetry & Thermal Alarm verified.")

    print("\n" + "=" * 80)
    print("ALL VITALIS ACCEPTANCE CRITERIA VERIFIED ACROSS PHASES 0 THROUGH 6!")
    print("=" * 80)

if __name__ == "__main__":
    run_end_to_end_verification()
