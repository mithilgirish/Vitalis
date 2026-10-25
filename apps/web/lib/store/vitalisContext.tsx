'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Hospital,
  TransferRequest,
  TransitTelemetry,
  InventoryBatch,
  JevExtractionResult,
  BiologicalResourceType,
  BloodGroup,
  TraumaLevel,
  CourierDriver,
} from '../types';
import {
  CHENNAI_HOSPITALS,
  INITIAL_REQUESTS,
  INITIAL_TRANSIT_TELEMETRY,
  INVENTORY_LEDGER,
  AVAILABLE_COURIER_DRIVERS,
} from '../data/mockData';
import { solveDijkstraLocal } from '../services/dijkstraRouting';

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
  availableDrivers: CourierDriver[];
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
  approveRequest: (
    requestId: string,
    candidateId?: string,
    approverName?: string,
    driverInfo?: { driverId: string; name: string; courierId: string; vehicleType: string }
  ) => void;
  dispatchRouteMission: (
    originId: string,
    destId: string,
    route: {
      totalDistanceKm: number;
      estimatedMinutes: number;
      waypoints: [number, number][];
      instructions?: { instruction: string }[];
    }
  ) => void;
  rejectRequest: (requestId: string, reason: string) => void;
  selectCandidateForRequest: (requestId: string, candidateId: string) => void;
  addRequestFromTriage: (result: JevExtractionResult) => void;
  
  // Telemetry Actions
  resolveExcursion: (transferId: string) => void;
  toggleExcursionSimulator: (transferId: string) => void;
  
  // Inventory Actions
  addInventoryBatch: (batch: {
    facilityId: string;
    facilityName: string;
    traumaLevel: TraumaLevel;
    resourceType: BiologicalResourceType;
    bloodGroup: BloodGroup;
    unitsAvailable: number;
    liveStorageTempC?: number;
    storageChamberId?: string;
    anticoagulant?: string;
    hoursUntilExpiry?: number;
  }) => void;
  calibrateBatchTemp: (batchUuid: string, newTemp?: number) => void;

  // Synced Database Time & Date
  syncedDate: string;
  syncedTime: string;

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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [hospitals, setHospitals] = useState<Hospital[]>(CHENNAI_HOSPITALS);
  const [requests, setRequests] = useState<TransferRequest[]>(INITIAL_REQUESTS);
  const [telemetry, setTelemetry] = useState<TransitTelemetry[]>(INITIAL_TRANSIT_TELEMETRY);
  const [inventory, setInventory] = useState<InventoryBatch[]>(INVENTORY_LEDGER);
  
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(INITIAL_REQUESTS[0]);
  const [selectedCourier, setSelectedCourier] = useState<TransitTelemetry | null>(null);
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [syncedDate, setSyncedDate] = useState<string>('2026-10-25');
  const [syncedTime, setSyncedTime] = useState<string>('');

  // Synchronize state and date with FastAPI / SQLite Database
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // 1. Initial snapshot sync from SQLite database
    fetch(`${backendUrl}/api/v1/system/sync`)
      .then((res) => res.json())
      .then((data) => {
        if (data.server_date) setSyncedDate(data.server_date);
        if (data.server_time_ist) setSyncedTime(data.server_time_ist);
        if (data.transfers && Array.isArray(data.transfers) && data.transfers.length > 0) {
          setRequests((prev) =>
            prev.map((r) => {
              const matched = data.transfers.find(
                (dbT: { id: string; status: TransferRequest['status']; approved_by?: string }) => dbT.id === r.id
              );
              if (matched) {
                return {
                  ...r,
                  status: matched.status,
                  approvedBy: matched.approved_by || r.approvedBy,
                };
              }
              return r;
            })
          );
        }
      })
      .catch(() => {
        // Fallback to local offline simulation
      });

    // 2. Real-time WebSocket event subscription
    const wsUrl = backendUrl.replace(/^http/, 'ws');
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`${wsUrl}/api/v1/ws/telemetry`);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'DISPATCH_APPROVED') {
            const data = payload.payload;
            const transferId = data?.transfer_id;
            setRequests((prev) =>
              prev.map((r) =>
                r.id === transferId
                  ? {
                      ...r,
                      status: 'in_transit',
                      assignedDriverId: data?.assigned_driver_id || r.assignedDriverId,
                      assignedDriverName: data?.assigned_driver_name || r.assignedDriverName,
                      courierId: data?.courier_id || r.courierId,
                      vehicleType: data?.vehicle_type || r.vehicleType,
                      routeWaypoints: data?.route_waypoints || r.routeWaypoints,
                      distanceKm: data?.distance_km || r.distanceKm,
                      estimatedMinutes: data?.estimated_minutes || r.estimatedMinutes,
                      approvedBy: data?.approved_by || r.approvedBy,
                    }
                  : r
              )
            );
          } else if (payload.event === 'TELEMETRY_LOG') {
            const reading = payload.payload;
            if (reading && reading.temperature_celsius !== undefined) {
              setTelemetry((prev) =>
                prev.map((t) =>
                  t.courierId === reading.courier_id || t.transferId === reading.transfer_id
                    ? {
                        ...t,
                        currentTemperatureC: reading.temperature_celsius,
                        excursionFlag: reading.excursion_flag || false,
                        currentCoordinates: reading.location || t.currentCoordinates,
                      }
                    : t
                )
              );
            }
          }
        } catch {
          // Ignore parse errors
        }
      };
    } catch {
      // Ignore ws connection errors
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Hydrate theme preference from client localStorage after initial SSR mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vitalis-theme') as 'dark' | 'light' | null;
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

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
    try {
      localStorage.setItem('vitalis-theme', nextTheme);
    } catch {
      // Ignore storage errors
    }
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

  // Approve a request in HITL Queue with driver assignment & Dijkstra shortest path routing
  const approveRequest = (
    requestId: string,
    candidateId?: string,
    approverName?: string,
    driverInfo?: { driverId: string; name: string; courierId: string; vehicleType: string }
  ) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const chosenCandidate =
      req.candidates.find((c) => c.id === (candidateId || req.selectedCandidateId)) ||
      req.candidates[0] ||
      null;

    if (!chosenCandidate) {
      addToast({
        type: 'error',
        title: 'Dispatch Failed',
        message: 'No candidate donor facility is available for this request.',
      });
      return;
    }

    const originHosp = hospitals.find((h) => h.id === chosenCandidate.facilityId) || hospitals[0];
    const destHosp = hospitals.find((h) => h.id === req.destinationFacilityId) || hospitals[1];

    // Assigned driver details (defaults to Vikramaditya Rao - mobile response unit #104)
    const assignedDriver = driverInfo || {
      driverId: 'VTL-DRV-784',
      name: 'Vikramaditya Rao',
      courierId: 'COU-CH-104',
      vehicleType: 'Refrigerated EV Van #104',
    };

    // Calculate optimal Dijkstra Shortest Path along Chennai road graph
    const dijkstraRoute = solveDijkstraLocal(originHosp.id, destHosp.id);

    // Dispatch background PATCH request to FastAPI gateway enforcing HITL gate & driver sync
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const cleanId = requestId.replace('REQ-', '').toLowerCase();
    fetch(`${backendUrl}/api/v1/dispatch/${cleanId}/action`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approve',
        approved_by_user_id: approverName || 'Dr. Aishwarya Raman',
        assigned_driver_id: assignedDriver.driverId,
        assigned_driver_name: assignedDriver.name,
        courier_id: assignedDriver.courierId,
        vehicle_type: assignedDriver.vehicleType,
        origin_facility_id: originHosp.id,
        origin_facility_name: originHosp.name,
        destination_facility_id: destHosp.id,
        destination_facility_name: destHosp.name,
        distance_km: dijkstraRoute.totalDistanceKm,
        estimated_minutes: dijkstraRoute.estimatedMinutes,
        route_waypoints: dijkstraRoute.waypoints,
        resource_type: req.resourceType,
        blood_group: req.bloodGroup,
        units_requested: req.unitsRequested,
      }),
    }).catch(() => {
      // Backend offline fallback handled gracefully
    });

    // Transition request status with driver and Dijkstra route data
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'in_transit' as const,
              approvedBy: approverName || 'Dr. Aishwarya Raman',
              assignedDriverId: assignedDriver.driverId,
              assignedDriverName: assignedDriver.name,
              courierId: assignedDriver.courierId,
              vehicleType: assignedDriver.vehicleType,
              routeWaypoints: dijkstraRoute.waypoints,
              distanceKm: dijkstraRoute.totalDistanceKm,
              estimatedMinutes: dijkstraRoute.estimatedMinutes,
            }
          : r
      )
    );

    // Create a new active courier dispatch with assigned driver & Dijkstra ETA
    const newTelemetry: TransitTelemetry = {
      transferId: req.id.replace('REQ-', '').toLowerCase(),
      courierId: assignedDriver.courierId,
      courierName: `${assignedDriver.name} (#${assignedDriver.courierId})`,
      vehicleType: 'Refrigerated EV Van',
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
      etaMinutes: dijkstraRoute.estimatedMinutes,
      departureTime: 'Just now',
      routeHistory: [
        { time: 'Just now', tempC: 3.6, lat: originHosp.lat, lng: originHosp.lng }
      ],
    };

    setTelemetry((prev) => [newTelemetry, ...prev]);

    addToast({
      type: 'success',
      title: 'Doctor Transfer Approved',
      message: `Authorized by ${approverName || 'Dr. Aishwarya Raman'}. Assigned driver ${assignedDriver.name} (${assignedDriver.courierId}) dispatched via Dijkstra Shortest Path (${dijkstraRoute.totalDistanceKm} km, ~${dijkstraRoute.estimatedMinutes} mins) from ${chosenCandidate.facilityName} to ${destHosp.shortName}.`,
    });

    // Update selected request to the next pending one if available
    const remainingPending = requests.filter((r) => r.id !== requestId && r.status === 'pending_approval');
    if (remainingPending.length > 0) {
      setSelectedRequest(remainingPending[0]);
    }
  };

  // Dispatch an emergency route from Hospital Search Route Planner directly to mobile driver
  const dispatchRouteMission = (
    originId: string,
    destId: string,
    route: {
      totalDistanceKm: number;
      estimatedMinutes: number;
      waypoints: [number, number][];
      instructions?: { instruction: string }[];
    }
  ) => {
    const originHosp = hospitals.find((h) => h.id === originId) || hospitals[0];
    const destHosp = hospitals.find((h) => h.id === destId) || hospitals[1];
    const assignedDriver = AVAILABLE_COURIER_DRIVERS[0] || {
      driverId: 'VTL-DRV-784',
      name: 'Vikramaditya Rao',
      courierId: 'COU-CH-104',
      vehicleType: 'Refrigerated EV Van #104',
    };

    const transferId = `rt-${Date.now().toString(36).slice(-6)}`;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    fetch(`${backendUrl}/api/v1/dispatch/${transferId}/action`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approve',
        approved_by_user_id: 'Dr. Aishwarya Raman',
        assigned_driver_id: assignedDriver.driverId,
        assigned_driver_name: assignedDriver.name,
        courier_id: assignedDriver.courierId,
        vehicle_type: assignedDriver.vehicleType,
        origin_facility_id: originHosp.id,
        origin_facility_name: originHosp.name,
        destination_facility_id: destHosp.id,
        destination_facility_name: destHosp.name,
        distance_km: route.totalDistanceKm,
        estimated_minutes: route.estimatedMinutes,
        route_waypoints: route.waypoints,
        resource_type: 'PRBC',
        blood_group: 'O-',
        units_requested: 4,
      }),
    }).catch(() => {});

    // Add toast
    addToast({
      type: 'success',
      title: 'Vehicle Dispatched to Route! 🚀',
      message: `${assignedDriver.name} (#${assignedDriver.courierId}) deployed from ${originHosp.shortName} to ${destHosp.shortName}. Route synchronized to mobile phone.`,
    });

    // Create telemetry marker on map
    const newTelem: TransitTelemetry = {
      transferId,
      courierId: assignedDriver.courierId,
      courierName: `${assignedDriver.name} (#${assignedDriver.courierId})`,
      vehicleType: 'Refrigerated EV Van',
      originFacilityId: originHosp.id,
      originFacilityName: originHosp.shortName,
      destinationFacilityId: destHosp.id,
      destinationFacilityName: destHosp.shortName,
      resource: 'PRBC',
      bloodGroup: 'O-',
      units: 4,
      currentCoordinates: { lat: originHosp.lat, lng: originHosp.lng },
      mapX: originHosp.mapX,
      mapY: originHosp.mapY,
      originX: originHosp.mapX,
      originY: originHosp.mapY,
      destX: destHosp.mapX,
      destY: destHosp.mapY,
      progressPercent: 12,
      velocityKmH: 42,
      currentTemperatureC: 3.8,
      tempThresholdMaxC: 6.0,
      excursionFlag: false,
      etaMinutes: route.estimatedMinutes,
      departureTime: 'Just now',
      routeHistory: [
        { time: 'Just now', tempC: 3.8, lat: originHosp.lat, lng: originHosp.lng }
      ],
    };

    setTelemetry((prev) => [newTelem, ...prev]);
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

  // Add new inventory batch from donor intake
  const addInventoryBatch = (batchData: {
    facilityId: string;
    facilityName: string;
    traumaLevel: TraumaLevel;
    resourceType: BiologicalResourceType;
    bloodGroup: BloodGroup;
    unitsAvailable: number;
    liveStorageTempC?: number;
    storageChamberId?: string;
    anticoagulant?: string;
    hoursUntilExpiry?: number;
  }) => {
    const randomHex = Math.random().toString(16).substring(2, 6);
    const randomHex2 = Math.random().toString(16).substring(2, 6);
    const targetTemp = batchData.liveStorageTempC ?? 3.8;
    const newBatch: InventoryBatch = {
      batchUuid: `${batchData.resourceType.toUpperCase().substring(0, 4)}-${randomHex}-${randomHex2}`,
      facilityId: batchData.facilityId,
      facilityName: batchData.facilityName,
      traumaLevel: batchData.traumaLevel,
      resourceType: batchData.resourceType,
      bloodGroup: batchData.bloodGroup,
      unitsAvailable: batchData.unitsAvailable,
      liveStorageTempC: targetTemp,
      tempStatus: targetTemp > 6.0 ? 'critical' : targetTemp > 5.0 ? 'warning' : 'safe',
      collectedDate: '2026-10-18',
      expiryDate: '2026-11-20',
      hoursUntilExpiry: batchData.hoursUntilExpiry ?? 720,
      donorHash: `SHA256:${randomHex}...${randomHex2}`,
      anticoagulant: batchData.anticoagulant || 'CPDA-1',
      storageChamberId: batchData.storageChamberId || `VAULT-CHAMBER-${batchData.facilityId.split('-')[1] || 'A1'}`,
      viabilityScore: 98.5,
    };

    setInventory((prev) => [newBatch, ...prev]);

    // Update hospital stock units
    setHospitals((prev) =>
      prev.map((h) =>
        h.id === batchData.facilityId
          ? { ...h, currentStockUnits: h.currentStockUnits + batchData.unitsAvailable }
          : h
      )
    );

    addToast({
      type: 'success',
      title: 'Biological Batch Logged',
      message: `Added ${batchData.unitsAvailable} units of ${batchData.bloodGroup} ${batchData.resourceType} to ${batchData.facilityName}. RFID tag generated.`,
    });
  };

  // Calibrate storage chamber temperature
  const calibrateBatchTemp = (batchUuid: string, newTemp = 3.6) => {
    setInventory((prev) =>
      prev.map((b) =>
        b.batchUuid === batchUuid
          ? {
              ...b,
              liveStorageTempC: newTemp,
              tempStatus: newTemp > 6.0 ? 'critical' : newTemp > 5.0 ? 'warning' : 'safe',
            }
          : b
      )
    );
    addToast({
      type: 'success',
      title: 'Chamber Recalibrated',
      message: `Batch ${batchUuid} cooling calibrated to ${newTemp.toFixed(1)}°C. Storage vault temperature safe.`,
    });
  };

  return (
    <VitalisContext.Provider
      value={{
        hospitals,
        requests,
        telemetry,
        inventory,
        availableDrivers: AVAILABLE_COURIER_DRIVERS,
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
        dispatchRouteMission,
        rejectRequest,
        selectCandidateForRequest,
        addRequestFromTriage,
        resolveExcursion,
        toggleExcursionSimulator,
        addInventoryBatch,
        calibrateBatchTemp,
        syncedDate,
        syncedTime,
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
