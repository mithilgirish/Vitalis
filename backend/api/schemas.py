"""
Pydantic Schemas & Data Contracts for Vitalis Backend Gateway
Adheres to Section 6 of the SRS & PLAN.md specifications.
"""

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime

# ------------------------------------------------------------------------------
# 1. Triage Ingestion Schemas (FR-1)
# ------------------------------------------------------------------------------
ResourceType = Literal[
    'Whole Blood', 'PRBC', 'Platelets', 'FFP',
    'Cryoprecipitate', 'Kidney', 'Liver', 'Heart'
]

BloodGroup = Literal[
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'N/A'
]

TriageSource = Literal['radio', 'sms', 'ehr', 'manual']

class TriageIngestRequest(BaseModel):
    raw_text: str = Field(
        ...,
        description="Raw unstructured text from radio dispatch, SMS, or medical notes",
        examples=["Need 4 units of O-negative blood immediately at Apollo Greams Rd for an incoming Level 1 trauma victim."]
    )
    source: TriageSource = Field(
        default="radio",
        description="Originating ingestion channel"
    )

class TriageExtractionPayload(BaseModel):
    resource_type: ResourceType = Field(..., description="Coerced biological resource type")
    blood_group: BloodGroup = Field(..., description="Validated ABO/Rh blood group")
    units_requested: int = Field(..., ge=1, le=50, description="Quantity of units requested (1 to 50)")
    urgency_tier: int = Field(..., ge=1, le=5, description="Emergency Severity Index (1: Resuscitative to 5: Non-urgent)")
    target_facility_name: str = Field(..., description="Normalized requesting facility name")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence extraction score")

class TriageIngestResponse(BaseModel):
    status: Literal['success', 'error'] = 'success'
    data: TriageExtractionPayload

# ------------------------------------------------------------------------------
# 2. Agent Solve Dispatch Schemas (FR-3)
# ------------------------------------------------------------------------------
class SolveDispatchPayload(BaseModel):
    destination_facility_id: str = Field(..., description="UUID of the requesting facility")
    resource_type: ResourceType = Field(default='PRBC', description="Biological product type")
    blood_group: BloodGroup = Field(default='O-', description="Blood group")
    units_requested: int = Field(..., ge=1, le=50, description="Requested units")
    urgency_tier: int = Field(default=1, ge=1, le=5, description="ESI Urgency tier")

class DonorRecommendation(BaseModel):
    rank: int = Field(..., ge=1)
    origin_facility_id: str
    origin_facility_name: str
    priority_score: float = Field(..., description="Calculated Priority Index (PI)")
    distance_km: float = Field(..., description="Distance in kilometers")
    stockout_risk: float = Field(..., description="72-hour donor stockout depletion risk (0.00 to 1.00)")
    estimated_transit_minutes: int
    reasoning_trace: str
    quality_score: float = Field(default=100.0, description="Medicare HVBP/HAC rating")
    available_units: int = Field(..., description="Available unexpired units at donor")

class SolveDispatchResponse(BaseModel):
    transfer_request_id: str = Field(..., description="UUID of created transfer order")
    recommendations: List[DonorRecommendation]
    hitl_status: Literal['pending_approval'] = 'pending_approval'

# ------------------------------------------------------------------------------
# 3. HITL Action Schemas (FR-4)
# ------------------------------------------------------------------------------
DispatchAction = Literal['approve', 'reject']

class DispatchActionRequest(BaseModel):
    action: DispatchAction = Field(..., description="'approve' transitions to in_transit; 'reject' transitions to rejected")
    approved_by_user_id: Optional[str] = Field(None, description="UUID of authorized clinical operator")
    rejection_reason: Optional[str] = Field(None, description="Clinical reason if transfer was rejected")

class DispatchActionResponse(BaseModel):
    transfer_id: str
    status: Literal['in_transit', 'rejected']
    courier_dispatch_broadcast: bool = Field(..., description="True if dispatched to courier fleet")
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ------------------------------------------------------------------------------
# 4. Courier Telemetry Schemas (FR-5)
# ------------------------------------------------------------------------------
class TelemetryLogRequest(BaseModel):
    transfer_id: str = Field(..., description="UUID of the active transfer")
    courier_id: Optional[str] = Field(default="COU-CH-101", description="Identifier of courier driver")
    current_location: Optional[Dict[str, float]] = Field(None, description="{'lat': float, 'lng': float}")
    temperature_celsius: float = Field(..., description="Cold-chain temperature reading in Celsius")
    resource_type: Optional[ResourceType] = Field(default="PRBC", description="Biological product in transit")

class TelemetryLogResponse(BaseModel):
    status: Literal['success', 'warning', 'excursion_alarm'] = 'success'
    telemetry_id: str
    recorded_at: datetime = Field(default_factory=datetime.utcnow)
    excursion_flag: bool = Field(..., description="True if temperature violated biological envelope")
    alert_message: Optional[str] = None
