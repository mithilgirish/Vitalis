"""
LangChain ReAct Agent Orchestrator & Prescriptive Priority Engine (FR-3)
Ranks valid donor candidates using the Priority Index (PI) formula with HAC penalties
and enforces the 0.40 XGBoost stockout guardrail.
"""

import os
import uuid
import json
import time
from typing import List, Dict, Any, Optional
from backend.api.schemas import (
    SolveDispatchPayload,
    SolveDispatchResponse,
    DonorRecommendation
)
from backend.agent.tools import (
    lookup_candidate_inventory,
    evaluate_stockout_risk,
    calculate_transit_viability
)

# Medicare Value-Based Purchasing HAC Threshold
HAC_QUALITY_THRESHOLD = 85.00
STOCKOUT_RISK_GUARDRAIL = 0.40

class ReActDispatchOrchestrator:
    """
    Coordinates tool execution, computes multi-objective clinical optimization,
    enforces safety guardrails, and outputs explainable reasoning traces.
    """

    @staticmethod
    def calculate_priority_index(
        urgency_tier: int,
        available_units: int,
        requested_units: int,
        distance_km: float,
        stockout_risk: float,
        quality_score: float
    ) -> float:
        """
        Calculates Priority Index (PI):
        PI = (UrgencyScore * SurplusRatio) / (Distance(km) * (1 + RiskOfSourceStockout) * QualityPenalty)
        """
        # UrgencyScore = 6 - urgency_tier (ESI 1 scores 5; ESI 5 scores 1)
        urgency_score = max(1.0, float(6 - urgency_tier))

        # SurplusRatio = AvailableUnits / RequestedUnits
        surplus_ratio = max(0.1, float(available_units) / float(requested_units))

        # QualityPenalty = 1.0 + max(0, (HAC_Threshold - Quality_Score) / 100)
        quality_penalty = 1.0 + max(0.0, (HAC_QUALITY_THRESHOLD - quality_score) / 100.0)

        # Distance damping
        effective_dist = max(1.0, distance_km)

        pi = (urgency_score * surplus_ratio) / (effective_dist * (1.0 + stockout_risk) * quality_penalty)
        return round(pi, 4)

    @classmethod
    def solve(cls, payload: SolveDispatchPayload) -> SolveDispatchResponse:
        """
        Executes ReAct optimization loop:
          Step 1: Spatial PostGIS inventory lookup.
          Step 2: Viability envelope & transit calculation.
          Step 3: XGBoost depletion risk prediction.
          Step 4: Guardrail filter (Risk <= 0.40).
          Step 5: Prescriptive Priority Index ranking.
          Step 6: Clinical reasoning trace synthesis.
        """
        start_time = time.perf_counter()

        # Step 1: Query unexpired inventory within 30km radius
        inventory_json = lookup_candidate_inventory.invoke({
            "blood_group": payload.blood_group,
            "resource_type": payload.resource_type,
            "target_facility_id": payload.destination_facility_id,
            "radius_km": 30.0
        })
        candidates = json.loads(inventory_json)

        candidate_records = []
        disqualified_candidates = []

        for candidate in candidates:
            fac_id = candidate["facility_id"]
            fac_name = candidate["facility_name"]
            avail_units = candidate["total_available_units"]
            quality_score = float(candidate["quality_score"])
            distance_km = float(candidate["distance_km"])

            # Step 2: Viability check
            viability_raw = calculate_transit_viability.invoke({
                "resource_type": payload.resource_type,
                "distance_km": distance_km
            })
            viability = json.loads(viability_raw)
            if not viability.get("is_viable", True):
                disqualified_candidates.append({
                    "name": fac_name,
                    "reason": f"Transit time {viability['estimated_transit_minutes']}m exceeds biological viability envelope."
                })
                continue

            # Step 3: Evaluate 72h source stockout risk via XGBoost
            stockout_risk = float(evaluate_stockout_risk.invoke({
                "donor_facility_id": fac_id,
                "units_to_draw": payload.units_requested
            }))

            # Step 4: Strict Guardrail Enforcement
            if stockout_risk > STOCKOUT_RISK_GUARDRAIL:
                disqualified_candidates.append({
                    "name": fac_name,
                    "reason": f"Depletion risk {stockout_risk:.2f} exceeds 0.40 guardrail. Disqualified to prevent secondary stockout."
                })
                continue

            # Step 5: Calculate Priority Index
            pi_score = cls.calculate_priority_index(
                urgency_tier=payload.urgency_tier,
                available_units=avail_units,
                requested_units=payload.units_requested,
                distance_km=distance_km,
                stockout_risk=stockout_risk,
                quality_score=quality_score
            )

            # Step 6: Explainable Reasoning Trace
            hac_penalty_str = "No quality penalty applied." if quality_score >= HAC_QUALITY_THRESHOLD else f"HAC penalty applied (score {quality_score:.1f}/100)."
            reasoning = (
                f"Candidate holds {avail_units} units of unexpired {payload.blood_group} {payload.resource_type} "
                f"with {stockout_risk*100:.1f}% projected 72h stockout risk. "
                f"Transit time ({viability['estimated_transit_minutes']} mins, {distance_km} km) falls well within viability envelope. "
                f"Medicare quality score is {quality_score:.1f}/100 ({hac_penalty_str}). "
                f"Computed Priority Index: {pi_score:.3f}."
            )

            candidate_records.append({
                "origin_facility_id": fac_id,
                "origin_facility_name": fac_name,
                "priority_score": pi_score,
                "distance_km": distance_km,
                "stockout_risk": stockout_risk,
                "estimated_transit_minutes": viability["estimated_transit_minutes"],
                "reasoning_trace": reasoning,
                "quality_score": quality_score,
                "available_units": avail_units
            })

        # Sort descending by Priority Index
        candidate_records.sort(key=lambda r: r["priority_score"], reverse=True)
        ranked_candidates: List[DonorRecommendation] = []
        for idx, rec in enumerate(candidate_records, start=1):
            ranked_candidates.append(DonorRecommendation(
                rank=idx,
                origin_facility_id=rec["origin_facility_id"],
                origin_facility_name=rec["origin_facility_name"],
                priority_score=rec["priority_score"],
                distance_km=rec["distance_km"],
                stockout_risk=rec["stockout_risk"],
                estimated_transit_minutes=rec["estimated_transit_minutes"],
                reasoning_trace=rec["reasoning_trace"],
                quality_score=rec["quality_score"],
                available_units=rec["available_units"]
            ))

        # Generate persistent transfer order UUID
        transfer_id = str(uuid.uuid4())
        elapsed_sec = time.perf_counter() - start_time

        # Ensure convergence under 3.5 seconds
        assert elapsed_sec < 3.5, f"ReAct convergence latency {elapsed_sec:.2f}s exceeded 3.5s limit"

        return SolveDispatchResponse(
            transfer_request_id=transfer_id,
            recommendations=ranked_candidates,
            hitl_status="pending_approval"
        )
