"""
Vitalis Backend Automated Test Suite (Phase 3 Acceptance Verification)
Verifies:
  1. FR-1: Deterministic Jev/NLP Triage Ingestion (< 500ms)
  2. FR-2 & FR-3: ReAct Multi-Tool Agent, Priority Index & XGBoost 0.40 Guardrail (< 3.5s)
  3. FR-4: Strict Human-in-the-Loop (HITL) Approval Gate
  4. FR-5: Cold-Chain Telemetry & Thermal Excursion Detection
"""

import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import time
import pytest
from fastapi.testclient import TestClient
from backend.api.main import app
from backend.agent.triage_client import JevTriageExtractor
from backend.agent.orchestrator import ReActDispatchOrchestrator
from backend.api.schemas import SolveDispatchPayload

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "enforced" in data["hitl_governance"]

def test_triage_ingestion_accuracy_and_latency():
    """Verify FR-1: Radio transcript entity extraction and sub-500ms latency."""
    raw_prompt = "Need 4 units of O-negative blood immediately at Apollo Greams Rd for an incoming Level 1 trauma victim."
    
    start = time.perf_counter()
    response = client.post("/api/v1/triage/ingest", json={
        "raw_text": raw_prompt,
        "source": "radio"
    })
    elapsed_ms = (time.perf_counter() - start) * 1000.0

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"

    data = body["data"]
    assert data["resource_type"] == "PRBC"
    assert data["blood_group"] == "O-"
    assert data["units_requested"] == 4
    assert data["urgency_tier"] == 1
    assert "Apollo" in data["target_facility_name"]
    assert data["confidence_score"] >= 0.90

    # Latency requirement <= 500 ms
    assert elapsed_ms < 500.0, f"Extraction latency {elapsed_ms:.1f}ms exceeded 500ms"
    print(f"\n[TEST PASS] Triage extracted in {elapsed_ms:.2f} ms")

def test_react_agent_dispatch_and_guardrails():
    """Verify FR-2 & FR-3: ReAct solver, Priority Index, and 0.40 stockout guardrail."""
    payload = {
        "destination_facility_id": "c71a399f-07da-4e4b-91c2-559d81373516", # Apollo Greams Rd
        "resource_type": "PRBC",
        "blood_group": "O-",
        "units_requested": 4,
        "urgency_tier": 1
    }

    start = time.perf_counter()
    response = client.post("/api/v1/agent/solve-dispatch", json=payload)
    elapsed_sec = time.perf_counter() - start

    assert response.status_code == 200
    body = response.json()
    assert "transfer_request_id" in body
    assert body["hitl_status"] == "pending_approval" # Must NOT auto-dispatch!

    recs = body["recommendations"]
    assert len(recs) > 0, "No valid donor recommendations generated"

    # Top recommendation should be RBTC (Regional Blood Transfusion Center)
    top = recs[0]
    assert top["rank"] == 1
    assert "Regional Blood Transfusion Center" in top["origin_facility_name"]
    assert top["stockout_risk"] <= 0.40, f"Candidate exceeded stockout risk: {top['stockout_risk']}"
    assert top["priority_score"] > 0
    assert "reasoning_trace" in top and len(top["reasoning_trace"]) > 20

    # Guardrail Verification: Fortis Malar has only 4 units; drawing 4 units would cause stockout > 0.40
    # Confirm Fortis Malar is NOT recommended or disqualified
    for r in recs:
        assert r["stockout_risk"] <= 0.40, f"Guardrail breach! Facility {r['origin_facility_name']} has risk {r['stockout_risk']}"

    # Latency requirement <= 3.5 seconds
    assert elapsed_sec < 3.5, f"Convergence latency {elapsed_sec:.2f}s exceeded 3.5s"
    print(f"[TEST PASS] ReAct solver converged in {elapsed_sec:.2f}s with top donor {top['origin_facility_name']}")

def test_hitl_approval_lifecycle():
    """Verify FR-4: Human-in-the-Loop strict gate."""
    # Create transfer order first
    solve_resp = client.post("/api/v1/agent/solve-dispatch", json={
        "destination_facility_id": "c71a399f-07da-4e4b-91c2-559d81373516",
        "resource_type": "PRBC",
        "blood_group": "O-",
        "units_requested": 2,
        "urgency_tier": 1
    })
    transfer_id = solve_resp.json()["transfer_request_id"]

    # Verify initial status in ledger is 'pending_approval'
    fetch_resp = client.get(f"/api/v1/transfers/{transfer_id}")
    assert fetch_resp.status_code == 200
    assert fetch_resp.json()["status"] == "pending_approval"

    # Operator approves transfer
    action_resp = client.patch(f"/api/v1/dispatch/{transfer_id}/action", json={
        "action": "approve",
        "approved_by_user_id": "admin-dr-chennai-402"
    })
    assert action_resp.status_code == 200
    action_data = action_resp.json()
    assert action_data["status"] == "in_transit"
    assert action_data["courier_dispatch_broadcast"] is True

    # Verify ledger updated
    updated = client.get(f"/api/v1/transfers/{transfer_id}").json()
    assert updated["status"] == "in_transit"
    assert updated["approved_by"] == "admin-dr-chennai-402"
    print(f"[TEST PASS] HITL approval gate successfully transitioned {transfer_id} to in_transit")

def test_cold_chain_telemetry_and_excursion():
    """Verify FR-5: IoT sensor logging and thermal excursion alarms."""
    transfer_id = "84d59a58-6923-41bb-a5a4-9e32f053dc9a"

    # Test 1: Normal PRBC temperature reading (3.8°C)
    norm_resp = client.post("/api/v1/telemetry/log", json={
        "transfer_id": transfer_id,
        "temperature_celsius": 3.8,
        "resource_type": "PRBC",
        "current_location": {"lat": 13.065, "lng": 80.255}
    })
    assert norm_resp.status_code == 200
    norm_data = norm_resp.json()
    assert norm_data["status"] == "success"
    assert norm_data["excursion_flag"] is False

    # Test 2: Critical PRBC temperature spike (> 6.0°C)
    spike_resp = client.post("/api/v1/telemetry/log", json={
        "transfer_id": transfer_id,
        "temperature_celsius": 8.2, # Violates PRBC 1°C - 6°C envelope
        "resource_type": "PRBC",
        "current_location": {"lat": 13.070, "lng": 80.258}
    })
    assert spike_resp.status_code == 200
    spike_data = spike_resp.json()
    assert spike_data["status"] == "excursion_alarm"
    assert spike_data["excursion_flag"] is True
    assert "CRITICAL THERMAL EXCURSION" in spike_data["alert_message"]
    print(f"[TEST PASS] Cold-chain excursion alarm triggered properly: {spike_data['alert_message']}")

def test_forecast_and_ml_endpoints():
    """Verify predictive forecasting and direct XGBoost inference endpoints."""
    # Forecast endpoint
    fc_resp = client.get("/api/v1/forecast?days=7")
    assert fc_resp.status_code == 200
    fc_data = fc_resp.json()
    assert len(fc_data["forecast"]) == 7
    assert "yhat" in fc_data["forecast"][0]
    print("[TEST PASS] 7-day Prophet forecast endpoint returned valid projections.")

    # Direct ML Guardrail prediction endpoint
    ml_resp = client.post(
        "/api/v1/ml/predict-stockout",
        params={
            "remaining_inventory": 4.0,
            "yhat_3d": 20.0,
            "hac_score": 74.0,
            "trauma_level": 2,
            "burn_rate_7d": 4.5
        }
    )
    assert ml_resp.status_code == 200
    ml_data = ml_resp.json()
    assert "stockout_risk" in ml_data
    assert ml_data["disqualified"] is True, "Low reserve inventory should be disqualified by 0.40 guardrail"
    print(f"[TEST PASS] Direct ML stockout prediction verified: Risk={ml_data['stockout_risk']}, Disqualified={ml_data['disqualified']}")

def test_middleware_headers():
    """Verify production headers: X-Process-Time and X-Request-ID."""
    resp = client.get("/health", headers={"X-Request-ID": "test-req-999"})
    assert resp.status_code == 200
    assert "x-process-time" in resp.headers
    assert resp.headers["x-request-id"] == "test-req-999"
    print(f"[TEST PASS] Middleware headers verified: X-Process-Time={resp.headers['x-process-time']}")

if __name__ == "__main__":
    test_health_check()
    test_middleware_headers()
    test_triage_ingestion_accuracy_and_latency()
    test_react_agent_dispatch_and_guardrails()
    test_hitl_approval_lifecycle()
    test_cold_chain_telemetry_and_excursion()
    test_forecast_and_ml_endpoints()
    print("\n[ALL TESTS PASSED] Backend production verification complete.")
