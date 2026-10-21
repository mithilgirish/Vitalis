'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Hospital,
  TransferRequest,
  TransitTelemetry,
  InventoryBatch,
  JevExtractionResult,
} from '../types';
import {
  CHENNAI_HOSPITALS,
  INITIAL_REQUESTS,
  INITIAL_TRANSIT_TELEMETRY,
  INVENTORY_LEDGER,
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

interface VitalisContextType {
  hospitals: Hospital[];
  requests: TransferRequest[];
  telemetry: TransitTelemetry[];
  inventory: InventoryBatch[];
  selectedHospital: Hospital | null;
  setSelectedHospital: (h: Hospital | null) => void;
  selectedRequest: TransferRequest | null;
  setSelectedRequest: (r: TransferRequest | null) => void;
  selectedCourier: TransitTelemetry | null;
  setSelectedCourier: (c: TransitTelemetry | null) => void;
  isTriageOpen: boolean;
  setIsTriageOpen: (open: boolean) => void;
  openTriage: () => void;
  closeTriage: () => void;
  
  // Actions
  approveRequest: (requestId: string, candidateId?: string) => void;
  rejectRequest: (requestId: string, reason: string) => void;
  selectCandidateForRequest: (requestId: string, candidateId: string) => void;
  addRequestFromTriage: (result: JevExtractionResult) => void;
  
  // Telemetry Actions
  resolveExcursion: (transferId: string) => void;
  toggleExcursionSimulator: (transferId: string) => void;
  
  // Theme Mode
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;
}

let toastSequence = 0;
function getNextToastId(): string {
  toastSequence += 1;
  return `toast-${Date.now()}-${toastSequence}`;
}

const VitalisContext = createContext<VitalisContextType | undefined>(undefined);

export function VitalisProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vitalis-theme') as 'dark' | 'light' | null;
      if (saved) return saved;
    }
    return 'dark';
  });
  const [hospitals, setHospitals] = useState<Hospital[]>(CHENNAI_HOSPITALS);
  const [requests, setRequests] = useState<TransferRequest[]>(INITIAL_REQUESTS);
  const [telemetry, setTelemetry] = useState<TransitTelemetry[]>(INITIAL_TRANSIT_TELEMETRY);
  const [inventory, setInventory] = useState<InventoryBatch[]>(INVENTORY_LEDGER);
  
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(INITIAL_REQUESTS[0]);
  const [selectedCourier, setSelectedCourier] = useState<TransitTelemetry | null>(INITIAL_TRANSIT_TELEMETRY[0]);
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('vitalis-theme', nextTheme);
  };

  const addToast = (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = getNextToastId();
    const newToast: ToastMessage = {
      ...toast,
      id,
      timestamp: new Date().toLocaleTimeString(),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));
    // Auto dismiss after 5s
    setTimeout(() => {
      dismissToast(id);
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openTriage = () => setIsTriageOpen(true);
  const closeTriage = () => setIsTriageOpen(false);

  // Approve a request in HITL Queue
  const approveRequest = (requestId: string, candidateId?: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    // Dispatch background PATCH request to FastAPI gateway enforcing HITL gate
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const cleanId = requestId.replace('REQ-', '').toLowerCase();
    fetch(`${backendUrl}/api/v1/dispatch/${cleanId}/action`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approve',
        approved_by_user_id: 'admin-coordinator-chennai',
      }),
    }).catch(() => {
      // Backend offline fallback handled gracefully
    });

    const chosenCandidate = req.candidates.find((c) => c.id === (candidateId || req.selectedCandidateId)) || req.candidates[0];

    // Transition request status
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: 'in_transit' as const } : r
      )
    );

    // Create a new active courier dispatch
    const originHosp = hospitals.find((h) => h.id === chosenCandidate.facilityId) || hospitals[0];
    const destHosp = hospitals.find((h) => h.id === req.destinationFacilityId) || hospitals[1];

    const newTelemetry: TransitTelemetry = {
      transferId: req.id.replace('REQ-', '').toLowerCase(),
      courierId: `COU-AUTO-${Math.floor(100 + Math.random() * 900)}`,
      courierName: `Vitalis ALS Courier (${originHosp.shortName} -> ${destHosp.shortName})`,
      vehicleType: 'ALS Medical Transit',
      originFacilityId: originHosp.id,
      originFacilityName: originHosp.shortName,
      destinationFacilityId: destHosp.id,
      destinationFacilityName: destHosp.shortName,
      resource: req.resourceType,
      bloodGroup: req.bloodGroup,
      units: req.unitsRequested,
      currentCoordinates: { lat: originHosp.lat, lng: originHosp.lng },
      mapX: originHosp.mapX,
      mapY: originHosp.mapY,
      originX: originHosp.mapX,
      originY: originHosp.mapY,
      destX: destHosp.mapX,
      destY: destHosp.mapY,
      progressPercent: 10,
      velocityKmH: 44,
      currentTemperatureC: 3.6,
      tempThresholdMaxC: 6.0,
      excursionFlag: false,
      etaMinutes: chosenCandidate.transitMinutes,
      departureTime: 'Just now',
      routeHistory: [
        { time: 'Just now', tempC: 3.6, lat: originHosp.lat, lng: originHosp.lng }
      ],
    };

    setTelemetry((prev) => [newTelemetry, ...prev]);

    addToast({
      type: 'success',
      title: 'HITL Transfer Approved & Dispatched',
      message: `Courier dispatched from ${chosenCandidate.facilityName} to ${destHosp.shortName} for ${req.unitsRequested} units of ${req.bloodGroup} ${req.resourceType}.`,
    });

    // Update selected request to the next pending one if available
    const remainingPending = requests.filter((r) => r.id !== requestId && r.status === 'pending_approval');
    if (remainingPending.length > 0) {
      setSelectedRequest(remainingPending[0]);
    }
  };

  // Reject a request with reason modal
  const rejectRequest = (requestId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected' as const, rejectionReason: reason } : r
      )
    );

    addToast({
      type: 'warning',
      title: 'Transfer Request Rejected',
      message: `Transfer #${requestId} rejected: "${reason}". LangChain solver will recalculate alternative pathways.`,
    });

    const remainingPending = requests.filter((r) => r.id !== requestId && r.status === 'pending_approval');
    if (remainingPending.length > 0) {
      setSelectedRequest(remainingPending[0]);
    }
  };

  // Select between Rank 1 and Rank 2 candidate
  const selectCandidateForRequest = (requestId: string, candidateId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, selectedCandidateId: candidateId } : r
      )
    );
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest((prev) => prev ? { ...prev, selectedCandidateId: candidateId } : null);
    }
  };

  // Add request dynamically from Triage simulator
  const addRequestFromTriage = (res: JevExtractionResult) => {
    const newId = `REQ-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const destHosp = hospitals.find((h) => h.id === res.extracted.destination_facility_id) || hospitals[0];

    const newReq: TransferRequest = {
      id: newId,
      esiUrgencyTier: (res.extracted.urgency_tier as 1 | 2 | 3 | 4 | 5) || 1,
      urgencyLabel: `ESI Tier ${res.extracted.urgency_tier}: ${res.extracted.urgency_tier === 1 ? 'Resuscitative' : 'Emergent'}`,
      priorityScore: 4.789,
      destinationFacilityId: destHosp.id,
      destinationFacilityName: destHosp.name,
      clinicalIndication: res.extracted.clinical_indication,
      resourceType: res.extracted.resource_type,
      bloodGroup: res.extracted.blood_group,
      unitsRequested: res.extracted.units_requested,
      requestingPhysician: 'Incoming Triage Dispatch (Validated by Jev)',
      timestamp: 'Just now',
      viabilityWindowMinutes: 30,
      status: 'pending_approval',
      candidates: [
        {
          id: `CAND-AUTO-1`,
          rank: 1,
          facilityId: 'FAC-RBTC',
          facilityName: 'Regional Blood Transfusion Center',
          area: 'Egmore Regional Reserve',
          availableUnits: 28,
          distanceKm: 6.4,
          transitMinutes: 18,
          stockoutRisk72h: 0.04,
          hvbpQualityScore: 98.4,
          priorityScore: 4.821,
          breakdown: {
            viabilityScore: 0.96,
            sourceSafetyBuffer: 0.96,
            hvbpScore: 0.984,
            distancePenalty: 0.128,
          },
          coldChainRating: 99.8,
        },
        {
          id: `CAND-AUTO-2`,
          rank: 2,
          facilityId: 'FAC-RGGGH',
          facilityName: 'Rajiv Gandhi Govt General Hospital',
          area: 'Park Town Hub',
          availableUnits: 34,
          distanceKm: 8.9,
          transitMinutes: 26,
          stockoutRisk72h: 0.08,
          hvbpQualityScore: 95.2,
          priorityScore: 4.412,
          breakdown: {
            viabilityScore: 0.88,
            sourceSafetyBuffer: 0.92,
            hvbpScore: 0.952,
            distancePenalty: 0.178,
          },
          coldChainRating: 98.5,
        },
      ],
      selectedCandidateId: 'CAND-AUTO-1',
      reactTrace: {
        thoughts: [
          `Thought 1: Ingested dispatch text from ${res.source}. Extraction validated: ${res.extracted.units_requested} units of ${res.extracted.blood_group} ${res.extracted.resource_type}.`,
          `Thought 2: Target facility is ${destHosp.shortName}. Urgency tier: ${res.extracted.urgency_tier}. Confidence: ${res.extracted.confidence_score * 100}%.`,
          'Thought 3: RBTC identified as optimum donor pool with 28 available units and 4.0% 72h risk.',
        ],
        actions: [
          {
            step: 1,
            tool: 'Jev_Information_Extractor',
            input: res.rawInput,
            observation: JSON.stringify(res.extracted),
          },
          {
            step: 2,
            tool: 'LangChain_ReAct_Candidate_Solver',
            input: `find_donor_for(${destHosp.id}, ${res.extracted.blood_group}, ${res.extracted.units_requested})`,
            observation: 'Rank 1: RBTC (PI: 4.821), Rank 2: RGGGH (PI: 4.412). Guardrails passed.',
          },
        ],
        synthesis: `Candidate holds 28 units of ${res.extracted.blood_group} ${res.extracted.resource_type} with zero projected 72h stockout risk. Transit time (18 mins) falls well within viability envelope. Quality score is 98.4/100.`,
      },
    };

    setRequests((prev) => [newReq, ...prev]);
    setSelectedRequest(newReq);
    addToast({
      type: 'info',
      title: 'Triage Ingestion Complete',
      message: `Created pending HITL request ${newId} from ${res.source} ingestion.`,
    });
  };

  // Resolve cold-chain excursion
  const resolveExcursion = (transferId: string) => {
    setTelemetry((prev) =>
      prev.map((t) =>
        t.transferId === transferId
          ? {
              ...t,
              excursionFlag: false,
              currentTemperatureC: 4.2, // normalized back below 6.0°C
              routeHistory: [
                ...t.routeHistory,
                { time: 'Intervention', tempC: 4.2, lat: t.currentCoordinates.lat, lng: t.currentCoordinates.lng },
              ],
            }
          : t
      )
    );
    // Also update inventory if relevant
    setInventory((prev) =>
      prev.map((b) =>
        b.batchUuid.includes(transferId)
          ? { ...b, liveStorageTempC: 4.2, tempStatus: 'safe' }
          : b
      )
    );
    addToast({
      type: 'success',
      title: 'Cold-Chain Excursion Resolved',
      message: `Transfer #${transferId} temperature stabilized to 4.2°C (Emergency PCM cooling pack engaged).`,
    });
  };

  // Toggle excursion for testing/demo purposes
  const toggleExcursionSimulator = (transferId: string) => {
    setTelemetry((prev) =>
      prev.map((t) => {
        if (t.transferId === transferId) {
          const nextFlag = !t.excursionFlag;
          const nextTemp = nextFlag ? 7.4 : 3.8;
          return {
            ...t,
            excursionFlag: nextFlag,
            currentTemperatureC: nextTemp,
            routeHistory: [
              ...t.routeHistory,
              { time: 'Demo Toggle', tempC: nextTemp, lat: t.currentCoordinates.lat, lng: t.currentCoordinates.lng },
            ],
          };
        }
        return t;
      })
    );
  };

  return (
    <VitalisContext.Provider
      value={{
        hospitals,
        requests,
        telemetry,
        inventory,
        selectedHospital,
        setSelectedHospital,
        selectedRequest,
        setSelectedRequest,
        selectedCourier,
        setSelectedCourier,
        isTriageOpen,
        setIsTriageOpen,
        openTriage,
        closeTriage,
        approveRequest,
        rejectRequest,
        selectCandidateForRequest,
        addRequestFromTriage,
        resolveExcursion,
        toggleExcursionSimulator,
        theme,
        toggleTheme,
        toasts,
        addToast,
        dismissToast,
      }}
    >
      {children}
    </VitalisContext.Provider>
  );
}

export function useVitalis() {
  const context = useContext(VitalisContext);
  if (!context) {
    throw new Error('useVitalis must be used within a VitalisProvider');
  }
  return context;
}
