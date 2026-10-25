import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ThemeMode, ThemeColors, THEME_PALETTE } from '@/theme/vitalis-theme';
import { solveDijkstraLocal } from '../services/dijkstraRouting';
import { getMobileBackendUrl, getMobileWsUrl } from '../services/apiConfig';

export type MissionStatus = 'pending_dispatch' | 'in_transit' | 'delivered';
export type CargoType = 'PRBC' | 'Platelets';

export interface TransferTask {
  id: string;
  origin_facility_name: string;
  origin_facility_id?: string;
  destination_facility_name: string;
  destination_facility_id?: string;
  resource_type: string;
  blood_group: string;
  units_requested: number;
  urgency_tier: number;
  status: 'in_transit' | 'pending_approval' | 'pending_dispatch' | 'delivered';
  assigned_driver_id?: string;
  assigned_driver_name?: string;
  courier_id?: string;
  vehicle_type?: string;
  distance_km?: number;
  estimated_minutes?: number;
  route_waypoints?: [number, number][];
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_TASKS: TransferTask[] = [
  {
    id: 'REQ-84D5-9A58',
    origin_facility_name: 'Regional Blood Transfusion Center, Egmore',
    origin_facility_id: 'FAC-RBTC',
    destination_facility_name: 'Apollo Hospitals, Greams Road',
    destination_facility_id: 'FAC-APOLLO',
    resource_type: 'PRBC',
    blood_group: 'O-',
    units_requested: 4,
    urgency_tier: 1,
    status: 'in_transit',
    assigned_driver_id: 'VTL-DRV-784',
    assigned_driver_name: 'Vikramaditya Rao',
    courier_id: 'COU-CH-104',
    vehicle_type: 'Refrigerated EV Van #104',
    distance_km: 3.56,
    estimated_minutes: 6,
    created_at: '10 mins ago',
  },
  {
    id: 'REQ-55E2-11C8',
    origin_facility_name: 'Gleneagles Health City, Perumbakkam',
    origin_facility_id: 'FAC-GLENEAGLES',
    destination_facility_name: 'Fortis Malar Hospital, Adyar',
    destination_facility_id: 'FAC-FORTIS',
    resource_type: 'Platelets',
    blood_group: 'AB+',
    units_requested: 2,
    urgency_tier: 1,
    status: 'in_transit',
    assigned_driver_id: 'VTL-DRV-784',
    assigned_driver_name: 'Vikramaditya Rao',
    courier_id: 'COU-CH-104',
    vehicle_type: 'Refrigerated EV Van #104',
    distance_km: 17.12,
    estimated_minutes: 24,
    created_at: '25 mins ago',
  },
  {
    id: 'REQ-28F4-00A9',
    origin_facility_name: 'MIOT International, Manapakkam',
    origin_facility_id: 'FAC-MIOT',
    destination_facility_name: 'Sri Ramachandra (SRMC), Porur',
    destination_facility_id: 'FAC-SRMC',
    resource_type: 'PRBC',
    blood_group: 'A-',
    units_requested: 4,
    urgency_tier: 2,
    status: 'pending_approval',
    assigned_driver_id: 'VTL-DRV-785',
    assigned_driver_name: 'Sundar Rajan',
    courier_id: 'COU-CH-108',
    vehicle_type: 'ALS Rapid Unit #108',
    distance_km: 6.6,
    estimated_minutes: 12,
    created_at: '38 mins ago',
  },
  {
    id: 'REQ-99C1-4B22',
    origin_facility_name: 'Kauvery Hospital, Alwarpet',
    origin_facility_id: 'FAC-KAUVERY',
    destination_facility_name: 'Stanley Medical College, George Town',
    destination_facility_id: 'FAC-STANLEY',
    resource_type: 'Whole Blood',
    blood_group: 'B+',
    units_requested: 3,
    urgency_tier: 1,
    status: 'delivered',
    assigned_driver_id: 'VTL-DRV-786',
    assigned_driver_name: 'Meenakshi Sundaram',
    courier_id: 'COU-CH-112',
    vehicle_type: 'Refrigerated EV Van #112',
    distance_km: 8.4,
    estimated_minutes: 16,
    created_at: '1 hour ago',
  },
];

export type MobileUserRole = 'courier' | 'coordinator' | 'inventory_officer' | 'auditor';

export interface MobileAuthUser {
  id: string;
  name: string;
  email: string;
  role: MobileUserRole;
  roleTitle: string;
  facilityName: string;
  avatarInitials: string;
  driverId: string;
  vehiclePlate: string;
  badgeLabel: string;
}

export const MOBILE_DEMO_USERS: Record<MobileUserRole, MobileAuthUser> = {
  courier: {
    id: 'USR-COUR-02',
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@vitalis.health',
    role: 'courier',
    roleTitle: 'ALS Rapid Response Paramedic',
    facilityName: 'Regional Blood Transfusion Center',
    avatarInitials: 'VR',
    driverId: 'VTL-DRV-784',
    vehiclePlate: 'TN-07-ALS-104',
    badgeLabel: 'Primary ALS Courier',
  },
  coordinator: {
    id: 'USR-COORD-01',
    name: 'Dr. Aishwarya Raman',
    email: 'aishwarya.raman@vitalis.health',
    role: 'coordinator',
    roleTitle: 'Chief Clinical Logistics Officer',
    facilityName: 'Apollo Hospitals, Greams Rd',
    avatarInitials: 'AR',
    driverId: 'VTL-DOC-001',
    vehiclePlate: 'TN-01-MD-99',
    badgeLabel: 'Command Dispatch Officer',
  },
  inventory_officer: {
    id: 'USR-INV-03',
    name: 'Dr. K. Sundaramoorthy',
    email: 'k.sundar@vitalis.health',
    role: 'inventory_officer',
    roleTitle: 'Regional Blood Bank Director',
    facilityName: 'RBTC Egmore Reserve',
    avatarInitials: 'KS',
    driverId: 'VTL-BB-302',
    vehiclePlate: 'TN-02-BB-44',
    badgeLabel: 'Blood Reserve Custodian',
  },
  auditor: {
    id: 'USR-AUD-04',
    name: 'Director Santhosh Kumar',
    email: 'santhosh.kumar@tnhealth.gov.in',
    role: 'auditor',
    roleTitle: 'Healthcare Compliance Auditor',
    facilityName: 'Tamil Nadu Medical Council',
    avatarInitials: 'SK',
    driverId: 'VTL-AUD-901',
    vehiclePlate: 'TN-09-GOV-01',
    badgeLabel: 'State Logistics Auditor',
  },
};


export interface ManualLog {
  id: string;
  checkpoint: string;
  temp: number;
  timestamp: string;
  location: string;
  driverId: string;
}

export interface SparklinePoint {
  minute: string;
  temp: number;
}

export interface CustodyStepState {
  completed: boolean;
  timestamp?: string;
  verifiedData?: string;
  metadata?: Record<string, string>;
}

export interface MissionState {
  // Theme
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;

  // Mission
  id: string;
  status: MissionStatus;
  esiTier: number;
  urgencyLabel: string;
  cargo: string;
  cargoType: CargoType;
  units: number;
  origin: string;
  originSub: string;
  originCoords: { lat: number; lng: number };
  destination: string;
  destinationSub: string;
  destinationCoords: { lat: number; lng: number };
  currentLocation: { lat: number; lng: number; heading: number; speedKmH: number };
  distanceKm: number;
  etaSeconds: number;
  viabilityLimitSeconds: number;
  acceptedAt: string | null;
  deliveredAt: string | null;

  // Dijkstra Route & Assigned Driver
  routeCoords: [number, number][];
  assignedDriverId?: string;
  assignedDriverName?: string;
  courierId?: string;
  incomingAssignmentAlert: {
    title: string;
    message: string;
    origin: string;
    destination: string;
    distanceKm: number;
    etaMinutes: number;
    units: number;
    resource: string;
  } | null;
  dismissAssignmentAlert: () => void;

  // Telemetry
  temperature: number;
  isExcursionSimulated: boolean;
  excursionFlag: boolean;
  safeEnvelopeMin: number;
  safeEnvelopeMax: number;
  bleDeviceId: string;
  bleRssi: number;
  batteryLevel: number;
  gpsPulseCountdown: number;
  lastGpsSyncTime: string;
  sparklineHistory: SparklinePoint[];
  manualLogs: ManualLog[];

  // Custody
  step1: CustodyStepState;
  step2: CustodyStepState;
  step3: CustodyStepState;

  // Synced Database Date & Time
  syncedDate: string;
  syncedTime: string;

  // User Identity & Role Auth
  currentUser: MobileAuthUser;
  switchUserRole: (role: MobileUserRole) => void;
  isAuthModalVisible: boolean;
  setAuthModalVisible: (visible: boolean) => void;
  logoutUser: () => void;

  // Dispatch Modal Visibility
  isDispatchModalOpen: boolean;
  setIsDispatchModalOpen: (open: boolean) => void;

  // Delivery Tasks Ledger
  allTasks: TransferTask[];
  switchToTask: (task: TransferTask) => void;
  refreshTasks: () => Promise<void>;

  // Actions
  acceptMission: () => void;
  toggleExcursion: (override?: boolean) => void;
  setCargoType: (type: CargoType) => void;
  logManualTemperature: (temp: number, checkpoint: string) => boolean;
  completeCustodyStep: (stepNumber: 1 | 2 | 3, verificationPayload?: any) => void;
  resetCustodySteps: () => void;
  completeHandoff: () => void;
  resetToDispatchModal: () => void;
  updateMissionDestination: (
    destinationName: string,
    destCoords: { lat: number; lng: number },
    routePoints?: [number, number][],
    distance?: number,
    etaSecs?: number
  ) => void;
}

/**
 * Returns dynamic real local time string with optional minute offset.
 */
export const getRealTimeIST = (offsetMinutes = 0): string => {
  const target = new Date(Date.now() - offsetMinutes * 60000);
  return (
    target.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + ' IST'
  );
};

/**
 * Returns dynamic real date string (e.g., "Oct 23, 2026").
 */
export const getRealDateString = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const INITIAL_SPARKLINE: SparklinePoint[] = [
  { minute: '-15m', temp: 3.7 },
  { minute: '-14m', temp: 3.8 },
  { minute: '-13m', temp: 3.7 },
  { minute: '-12m', temp: 3.6 },
  { minute: '-11m', temp: 3.8 },
  { minute: '-10m', temp: 3.9 },
  { minute: '-9m', temp: 3.8 },
  { minute: '-8m', temp: 3.7 },
  { minute: '-7m', temp: 3.6 },
  { minute: '-6m', temp: 3.8 },
  { minute: '-5m', temp: 3.7 },
  { minute: '-4m', temp: 3.8 },
  { minute: '-3m', temp: 3.9 },
  { minute: '-2m', temp: 3.8 },
  { minute: 'Now', temp: 3.8 },
];

const MissionContext = createContext<MissionState | null>(null);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [currentUser, setCurrentUser] = useState<MobileAuthUser>(MOBILE_DEMO_USERS.courier);
  const [isAuthModalVisible, setAuthModalVisible] = useState<boolean>(false);

  const switchUserRole = (role: MobileUserRole) => {
    if (MOBILE_DEMO_USERS[role]) {
      setCurrentUser(MOBILE_DEMO_USERS[role]);
      setAuthModalVisible(false);
    }
  };

  const logoutUser = () => {
    setCurrentUser(MOBILE_DEMO_USERS.courier);
    setAuthModalVisible(false);
  };
  const [status, setStatus] = useState<MissionStatus>('in_transit');
  const [cargoType, setCargoTypeState] = useState<CargoType>('PRBC');
  const [cargo, setCargo] = useState<string>('4 Units O- PRBC');
  const [origin, setOrigin] = useState<string>('Regional Blood Transfusion Center');
  const [originSub, setOriginSub] = useState<string>('Pantheon Road, Egmore, Chennai');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({ lat: 13.0784, lng: 80.2604 });
  const [destination, setDestination] = useState<string>('Apollo Greams Rd');
  const [destinationSub, setDestinationSub] = useState<string>('21 Greams Lane, Thousand Lights, Chennai');
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number }>({ lat: 13.0567, lng: 80.2505 });
  const [distanceKm, setDistanceKm] = useState<number>(3.56);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>(() => {
    return solveDijkstraLocal('FAC-RBTC', 'FAC-APOLLO').waypoints;
  });
  const [assignedDriverId, setAssignedDriverId] = useState<string>('VTL-DRV-784');
  const [assignedDriverName, setAssignedDriverName] = useState<string>('Vikramaditya Rao');
  const [courierId, setCourierId] = useState<string>('COU-CH-104');
  const [incomingAssignmentAlert, setIncomingAssignmentAlert] = useState<{
    title: string;
    message: string;
    origin: string;
    destination: string;
    distanceKm: number;
    etaMinutes: number;
    units: number;
    resource: string;
  } | null>(null);

  const dismissAssignmentAlert = () => setIncomingAssignmentAlert(null);

  const [isExcursionSimulated, setIsExcursionSimulated] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(3.8);
  const [gpsPulseCountdown, setGpsPulseCountdown] = useState<number>(15);
  const [etaSeconds, setEtaSeconds] = useState<number>(6 * 60); // 6 mins from Dijkstra
  const [viabilityLimitSeconds, setViabilityLimitSeconds] = useState<number>(45 * 60); // 45 minutes = 2700s
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [deliveredAt, setDeliveredAt] = useState<string | null>(null);
  const [lastGpsSyncTime, setLastGpsSyncTime] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Dynamic Mission ID incorporating real date
  const [missionId] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `MSN-${y}${m}${d}-ESI1-9842`;
  });

  const [sparklineHistory, setSparklineHistory] = useState<SparklinePoint[]>(INITIAL_SPARKLINE);
  const [syncedDate, setSyncedDate] = useState<string>('2026-10-25');
  const [syncedTime, setSyncedTime] = useState<string>('');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);
  const [allTasks, setAllTasks] = useState<TransferTask[]>(DEFAULT_TASKS);

  const lastProcessedMissionIdRef = useRef<string | null>(null);
  const isInitialMountRef = useRef<boolean>(true);

  // Synchronize state and date with FastAPI / SQLite Database
  useEffect(() => {
    const backendUrl = getMobileBackendUrl();
    const wsUrl = getMobileWsUrl();

    // Helper to apply mission payload from server
    const applyMissionData = (m: any, triggerPopup = false) => {
      if (m.status === 'in_transit' || m.status === 'pending_approval' || m.status === 'delivered') {
        setStatus(m.status);
      }
      const origName = m.origin_facility_name || m.origin || 'Regional Blood Transfusion Center';
      const destName = m.destination_facility_name || m.destination || 'Apollo Greams Rd';
      const cargoStr = `${m.units_requested || m.units || 4} Units ${m.blood_group || 'O-'} ${m.resource_type || m.resource || 'PRBC'}`;

      setOrigin(origName);
      setDestination(destName);
      setCargo(cargoStr);

      if (m.assigned_driver_id) setAssignedDriverId(m.assigned_driver_id);
      if (m.assigned_driver_name) setAssignedDriverName(m.assigned_driver_name);
      if (m.courier_id) setCourierId(m.courier_id);

      let waypoints = m.route_waypoints;
      let dist = m.distance_km;
      let eta = m.estimated_minutes;

      if (!waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
        const solved = solveDijkstraLocal(
          m.origin_facility_id || 'FAC-RBTC',
          m.destination_facility_id || 'FAC-APOLLO'
        );
        waypoints = solved.waypoints;
        dist = solved.totalDistanceKm;
        eta = solved.estimatedMinutes;
      }

      if (waypoints && waypoints.length > 0) {
        setRouteCoords(waypoints);
        setOriginCoords({ lat: waypoints[0][0], lng: waypoints[0][1] });
        const last = waypoints[waypoints.length - 1];
        setDestinationCoords({ lat: last[0], lng: last[1] });
      }

      if (dist) setDistanceKm(dist);
      if (eta) setEtaSeconds(eta * 60);

      if (triggerPopup) {
        setIsDispatchModalOpen(true);
        setIncomingAssignmentAlert({
          title: 'New Emergency Transfer Assigned',
          message: `Assigned to ${m.assigned_driver_name || 'Vikramaditya Rao'} (${m.courier_id || 'COU-CH-104'}). Turn-by-turn route loaded.`,
          origin: origName,
          destination: destName,
          distanceKm: dist || 3.56,
          etaMinutes: eta || 6,
          units: m.units_requested || m.units || 4,
          resource: `${m.blood_group || 'O-'} ${m.resource_type || m.resource || 'PRBC'}`,
        });
      }
    };

    // 1. Initial snapshot sync from SQLite database
    const fetchSync = (isPolling = false) => {
      fetch(`${backendUrl}/api/v1/system/sync`)
        .then((res) => res.json())
        .then((data) => {
          if (data.server_date) setSyncedDate(data.server_date);
          if (data.server_time_ist) setSyncedTime(data.server_time_ist);
          if (data.transfers && Array.isArray(data.transfers) && data.transfers.length > 0) {
            setAllTasks(data.transfers);
          }
          if (data.active_mission) {
            const m = data.active_mission;
            const missionId = m.id || m.transfer_id;
            const hasChanged = missionId && missionId !== lastProcessedMissionIdRef.current;
            
            if (hasChanged) {
              const shouldPopup = isPolling && !isInitialMountRef.current && (m.status === 'in_transit' || m.status === 'pending_approval');
              lastProcessedMissionIdRef.current = missionId;
              applyMissionData(m, shouldPopup);
            }
          }
          if (!isPolling) {
            isInitialMountRef.current = false;
          }
        })
        .catch(() => {
          // Fallback to local offline simulation
        });
    };

    fetchSync(false);

    // Periodic sync polling every 2.5s to ensure dispatches are caught even if WebSocket is disconnected
    const pollInterval = setInterval(() => {
      fetchSync(true);
    }, 2500);

    // 2. Real-time WebSocket event subscription
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`${wsUrl}/api/v1/ws/telemetry`);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'DISPATCH_APPROVED') {
            const m = payload.payload;
            const isAssignedToThisDriver =
              !m.assigned_driver_id ||
              m.assigned_driver_id === currentUser.driverId ||
              currentUser.role === 'courier';

            if (isAssignedToThisDriver) {
              lastProcessedMissionIdRef.current = m.transfer_id || m.id;
              applyMissionData(m, true);
            }
          } else if (payload.event === 'DISPATCH_REJECTED') {
            setStatus('pending_dispatch');
          }
        } catch {
          // Ignore parse errors
        }
      };
    } catch {
      // Ignore ws connection errors
    }

    return () => {
      clearInterval(pollInterval);
      if (ws) {
        ws.close();
      }
    };
  }, [currentUser.driverId, currentUser.role]);

  // Initial audit log with dynamic real time (12 minutes ago)
  const [manualLogs, setManualLogs] = useState<ManualLog[]>(() => [
    {
      id: 'LOG-001',
      checkpoint: 'Facility Loading Bay',
      temp: 3.8,
      timestamp: getRealTimeIST(12),
      location: 'Kilpauk Transfusion Depot',
      driverId: currentUser.driverId || 'VTL-DRV-784',
    },
  ]);

  // Initial custody verification steps with dynamic real timestamps
  const [step1, setStep1] = useState<CustodyStepState>(() => ({
    completed: true,
    timestamp: getRealTimeIST(8),
    verifiedData: 'BATCH-O-NEG-9842',
    metadata: {
      cargo: '4 Units O- PRBC',
      bloodGroup: 'O Negative',
      donorCode: 'TX-9022-TN',
    },
  }));

  const [step2, setStep2] = useState<CustodyStepState>(() => ({
    completed: true,
    timestamp: getRealTimeIST(5),
    verifiedData: 'SEAL-VALID-4029',
    metadata: {
      sealStatus: 'Tamper-Evident Intact',
      pickupTemp: '3.8°C (Within Envelope ≤ 6.0°C)',
      boxId: 'VTL-SMART-COOLER-88',
    },
  }));

  const [step3, setStep3] = useState<CustodyStepState>({
    completed: false,
  });

  // Safe envelopes based on cargo type
  const safeEnvelopeMin = cargoType === 'PRBC' ? 1.0 : 20.0;
  const safeEnvelopeMax = cargoType === 'PRBC' ? 6.0 : 24.0;
  const excursionFlag = isExcursionSimulated || temperature > safeEnvelopeMax || temperature < safeEnvelopeMin;

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = themeMode === 'dark';
  const colors = THEME_PALETTE[themeMode];

  // GPS 15s pulse ticker with real-time update
  useEffect(() => {
    const timer = setInterval(() => {
      setGpsPulseCountdown((prev) => {
        if (prev <= 1) {
          const now = new Date();
          setLastGpsSyncTime(
            now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          );
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Viability countdown ticker
  useEffect(() => {
    if (status !== 'in_transit') return;
    const ticker = setInterval(() => {
      setEtaSeconds((prev) => Math.max(0, prev - 1));
      setViabilityLimitSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(ticker);
  }, [status]);

  // Handle Excursion toggle
  const toggleExcursion = (override?: boolean) => {
    setIsExcursionSimulated((prev) => {
      const next = override !== undefined ? override : !prev;
      const newTemp = next ? 7.4 : (cargoType === 'PRBC' ? 3.8 : 22.1);
      if (next) {
        setTemperature(7.4);
        setSparklineHistory((history) => {
          const updated = [...history.slice(1), { minute: 'Now', temp: 7.4 }];
          return updated;
        });
      } else {
        const restoredTemp = cargoType === 'PRBC' ? 3.8 : 22.1;
        setTemperature(restoredTemp);
        setSparklineHistory(INITIAL_SPARKLINE);
      }

      // Stream cold-chain telemetry immediately to FastAPI backend
      const backendUrl = getMobileBackendUrl();
      fetch(`${backendUrl}/api/v1/telemetry/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transfer_id: '84d59a58-6923-41bb-a5a4-9e32f053dc9a',
          courier_id: 'COU-CH-104',
          temperature_celsius: newTemp,
          resource_type: cargoType,
          current_location: { lat: 13.065, lng: 80.255 },
        }),
      }).catch(() => {
        // Offline simulation fallback
      });

      return next;
    });
  };

  const setCargoType = (type: CargoType) => {
    setCargoTypeState(type);
    if (!isExcursionSimulated) {
      setTemperature(type === 'PRBC' ? 3.8 : 22.1);
    }
  };

  const acceptMission = () => {
    setStatus('in_transit');
    setAcceptedAt(getRealTimeIST(0));
  };

  const logManualTemperature = (temp: number, checkpoint: string): boolean => {
    const newLog: ManualLog = {
      id: `LOG-${String(manualLogs.length + 1).padStart(3, '0')}`,
      checkpoint,
      temp,
      timestamp: getRealTimeIST(0),
      location: checkpoint.includes('Destination') ? 'Apollo Greams Rd Entry' : 'Anna Salai (On The Way)',
      driverId: currentUser.driverId || 'VTL-DRV-784',
    };
    setManualLogs((prev) => [newLog, ...prev]);
    return true;
  };

  const completeCustodyStep = (stepNumber: 1 | 2 | 3, verificationPayload?: any) => {
    const timestamp = getRealTimeIST(0);
    if (stepNumber === 1) {
      setStep1({
        completed: true,
        timestamp,
        verifiedData: verificationPayload?.batchId || 'BATCH-O-NEG-9842',
        metadata: {
          cargo: cargoType === 'PRBC' ? '4 Units O- PRBC' : '2 Platelet Apheresis Units',
          bloodGroup: cargoType === 'PRBC' ? 'O Negative' : 'AB Positive',
          donorCode: `TX-${Math.floor(1000 + Math.random() * 9000)}-TN`,
        },
      });
    } else if (stepNumber === 2) {
      setStep2({
        completed: true,
        timestamp,
        verifiedData: verificationPayload?.sealId || 'SEAL-VALID-4029',
        metadata: {
          sealStatus: 'Tamper-Evident Intact',
          pickupTemp: `${temperature.toFixed(1)}°C (Verified Safe)`,
          boxId: 'VTL-SMART-COOLER-88',
        },
      });
    } else if (stepNumber === 3) {
      setStep3({
        completed: true,
        timestamp,
        verifiedData: verificationPayload?.staffId || 'EMP-APOLLO-9041',
        metadata: {
          recipientName: 'Dr. Arvind Swaminathan, MD',
          role: 'ER Trauma Team Lead',
          facility: 'Apollo Greams Rd Emergency Dept',
          license: 'TMC-88419-MED',
        },
      });
    }
  };

  const resetCustodySteps = () => {
    setStep1({ completed: false });
    setStep2({ completed: false });
    setStep3({ completed: false });
  };

  const completeHandoff = () => {
    setStatus('delivered');
    setDeliveredAt(getRealTimeIST(0));
  };

  const resetToDispatchModal = () => {
    setStatus('pending_dispatch');
    setIsExcursionSimulated(false);
    setTemperature(3.8);
    resetCustodySteps();
    setEtaSeconds(18 * 60);
    setViabilityLimitSeconds(45 * 60);
    setDeliveredAt(null);
    setAcceptedAt(null);
  };

  const updateMissionDestination = (
    destinationName: string,
    destCoords: { lat: number; lng: number },
    routePoints?: [number, number][],
    distance?: number,
    etaSecs?: number
  ) => {
    setDestination(destinationName);
    setDestinationCoords(destCoords);
    if (routePoints && routePoints.length > 0) {
      setRouteCoords(routePoints);
    }
    if (distance !== undefined) {
      setDistanceKm(distance);
    }
    if (etaSecs !== undefined) {
      setEtaSeconds(etaSecs);
    }
  };

  const refreshTasks = async () => {
    try {
      const backendUrl = getMobileBackendUrl();
      const res = await fetch(`${backendUrl}/api/v1/system/sync`);
      const data = await res.json();
      if (data.transfers && Array.isArray(data.transfers) && data.transfers.length > 0) {
        setAllTasks(data.transfers);
      }
    } catch {
      // offline fallback
    }
  };

  const switchToTask = (task: TransferTask) => {
    const s = task.status === 'delivered' ? 'delivered' : 'in_transit';
    setStatus(s);
    const origName = task.origin_facility_name || 'Regional Blood Transfusion Center';
    const destName = task.destination_facility_name || 'Apollo Greams Rd';
    const cargoStr = `${task.units_requested || 4} Units ${task.blood_group || 'O-'} ${task.resource_type || 'PRBC'}`;
    setOrigin(origName);
    setDestination(destName);
    setCargo(cargoStr);
    if (task.distance_km) setDistanceKm(task.distance_km);
    if (task.estimated_minutes) setEtaSeconds(task.estimated_minutes * 60);
    if (task.assigned_driver_id) setAssignedDriverId(task.assigned_driver_id);
    if (task.assigned_driver_name) setAssignedDriverName(task.assigned_driver_name);
    if (task.courier_id) setCourierId(task.courier_id);

    let waypoints = task.route_waypoints;
    if (!waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
      if (task.origin_facility_id && task.destination_facility_id) {
        const solved = solveDijkstraLocal(task.origin_facility_id, task.destination_facility_id);
        waypoints = solved.waypoints;
      }
    }
    if (waypoints && waypoints.length > 0) {
      setRouteCoords(waypoints);
      setOriginCoords({ lat: waypoints[0][0], lng: waypoints[0][1] });
      const last = waypoints[waypoints.length - 1];
      setDestinationCoords({ lat: last[0], lng: last[1] });
    }
  };

  const value: MissionState = {
    themeMode,
    isDark,
    colors,
    toggleTheme,

    id: missionId,
    status,
    esiTier: 1,
    urgencyLabel: 'ESI TIER 1 - IMMEDIATE',
    cargo,
    cargoType,
    units: 4,
    origin,
    originSub,
    originCoords,
    destination,
    destinationSub,
    destinationCoords,
    currentLocation: {
      lat: routeCoords.length > 2 ? routeCoords[Math.floor(routeCoords.length / 2)][0] : 13.0645,
      lng: routeCoords.length > 2 ? routeCoords[Math.floor(routeCoords.length / 2)][1] : 80.2598,
      heading: 242,
      speedKmH: 48,
    },
    distanceKm,
    etaSeconds,
    viabilityLimitSeconds,
    acceptedAt,
    deliveredAt,

    routeCoords,
    assignedDriverId,
    assignedDriverName,
    courierId,
    incomingAssignmentAlert,
    dismissAssignmentAlert,

    temperature,
    isExcursionSimulated,
    excursionFlag,
    safeEnvelopeMin,
    safeEnvelopeMax,
    bleDeviceId: 'VTL-SENS-BLE-4029',
    bleRssi: -64,
    batteryLevel: 94,
    gpsPulseCountdown,
    lastGpsSyncTime,
    sparklineHistory,
    manualLogs,

    step1,
    step2,
    step3,
    syncedDate,
    syncedTime,

    isDispatchModalOpen,
    setIsDispatchModalOpen,

    allTasks,
    switchToTask,
    refreshTasks,

    acceptMission,
    toggleExcursion,
    setCargoType,
    logManualTemperature,
    completeCustodyStep,
    resetCustodySteps,
    completeHandoff,
    resetToDispatchModal,
    updateMissionDestination,
    currentUser,
    switchUserRole,
    isAuthModalVisible,
    setAuthModalVisible,
    logoutUser,
  };

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
};

export const useMission = (): MissionState => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
};
