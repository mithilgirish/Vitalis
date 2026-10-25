import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode, ThemeColors, THEME_PALETTE } from '@/theme/vitalis-theme';

export type MissionStatus = 'pending_dispatch' | 'in_transit' | 'delivered';
export type CargoType = 'PRBC' | 'Platelets';

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

  // User Identity & Role Auth
  currentUser: MobileAuthUser;
  switchUserRole: (role: MobileUserRole) => void;
  isAuthModalVisible: boolean;
  setAuthModalVisible: (visible: boolean) => void;
  logoutUser: () => void;

  // Actions
  acceptMission: () => void;
  toggleExcursion: (override?: boolean) => void;
  setCargoType: (type: CargoType) => void;
  logManualTemperature: (temp: number, checkpoint: string) => boolean;
  completeCustodyStep: (stepNumber: 1 | 2 | 3, verificationPayload?: any) => void;
  resetCustodySteps: () => void;
  completeHandoff: () => void;
  resetToDispatchModal: () => void;
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
  const [isExcursionSimulated, setIsExcursionSimulated] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(3.8);
  const [gpsPulseCountdown, setGpsPulseCountdown] = useState<number>(15);
  const [etaSeconds, setEtaSeconds] = useState<number>(18 * 60); // 18 minutes = 1080s
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
      const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
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

  const value: MissionState = {
    themeMode,
    isDark,
    colors,
    toggleTheme,

    id: missionId,
    status,
    esiTier: 1,
    urgencyLabel: 'ESI TIER 1 - IMMEDIATE',
    cargo: cargoType === 'PRBC' ? '4 Units O- PRBC' : '2 Apheresis Platelet Units',
    cargoType,
    units: 4,
    origin: 'Regional Blood Transfusion Center',
    originSub: '144 Mount Road, Kilpauk, Chennai',
    originCoords: { lat: 13.0827, lng: 80.2707 },
    destination: 'Apollo Greams Rd',
    destinationSub: '21 Greams Lane, Thousand Lights, Chennai',
    destinationCoords: { lat: 13.0569, lng: 80.2525 },
    currentLocation: { lat: 13.0645, lng: 80.2598, heading: 242, speedKmH: 68 },
    distanceKm: 6.4,
    etaSeconds,
    viabilityLimitSeconds,
    acceptedAt,
    deliveredAt,

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

    acceptMission,
    toggleExcursion,
    setCargoType,
    logManualTemperature,
    completeCustodyStep,
    resetCustodySteps,
    completeHandoff,
    resetToDispatchModal,
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
