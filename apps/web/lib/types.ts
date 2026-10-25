export type TraumaLevel = 1 | 2 | 3 | 4;

export type NodeStatus = 'surplus' | 'stockout_risk' | 'emergency_active' | 'stable';

export type BiologicalResourceType =
  | 'PRBC'
  | 'Whole Blood'
  | 'Platelets'
  | 'FFP'
  | 'Cryoprecipitate'
  | 'Kidney'
  | 'Liver'
  | 'Heart';

export type BloodGroup = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export type IngestionSource = 'Radio' | 'SMS' | 'EHR' | 'Manual';

export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  mapX: number; // Normalized SVG X (0-1000)
  mapY: number; // Normalized SVG Y (0-700)
  traumaLevel: TraumaLevel;
  status: NodeStatus;
  totalBeds: number;
  icuBedsAvailable: number;
  currentStockUnits: number;
  stockoutRisk72h: number; // 0 to 1
  coldStorageTemp: number; // °C
  contactPhone: string;
  isRegionalBloodBank?: boolean;
}

export interface DonorCandidate {
  id: string;
  rank: 1 | 2;
  facilityId: string;
  facilityName: string;
  area: string;
  availableUnits: number;
  distanceKm: number;
  transitMinutes: number;
  stockoutRisk72h: number; // e.g. 0.04 -> 4.0%
  hvbpQualityScore: number; // e.g. 98.4 / 100
  priorityScore: number; // e.g. 4.821
  breakdown: {
    viabilityScore: number;
    sourceSafetyBuffer: number;
    hvbpScore: number;
    distancePenalty: number;
  };
  coldChainRating: number;
}

export interface ReActTrace {
  thoughts: string[];
  actions: {
    step: number;
    tool: string;
    input: string;
    observation: string;
  }[];
  synthesis: string;
}

export interface TransferRequest {
  id: string; // UUID e.g. "REQ-84D5-9A58"
  esiUrgencyTier: 1 | 2 | 3 | 4 | 5;
  urgencyLabel: string;
  priorityScore: number;
  destinationFacilityId: string;
  destinationFacilityName: string;
  clinicalIndication: string;
  resourceType: BiologicalResourceType;
  bloodGroup: BloodGroup;
  unitsRequested: number;
  requestingPhysician: string;
  timestamp: string;
  viabilityWindowMinutes: number;
  status: 'pending_approval' | 'in_transit' | 'delivered' | 'rejected';
  rejectionReason?: string;
  approvedBy?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  courierId?: string;
  vehicleType?: string;
  routeWaypoints?: [number, number][];
  distanceKm?: number;
  estimatedMinutes?: number;
  candidates: DonorCandidate[];
  selectedCandidateId?: string;
  reactTrace?: ReActTrace;
}

export interface CourierDriver {
  driverId: string;
  name: string;
  courierId: string;
  vehicleType: string;
  vehiclePlate: string;
  status: 'ready' | 'en_route' | 'offline';
  baseFacility: string;
  phone: string;
  isMobileAppDriver?: boolean;
}

export interface TransitTelemetry {
  transferId: string;
  courierId: string;
  courierName: string;
  vehicleType: 'Refrigerated EV Van' | 'Drone Carrier' | 'ALS Medical Transit';
  originFacilityId: string;
  originFacilityName: string;
  destinationFacilityId: string;
  destinationFacilityName: string;
  resource: BiologicalResourceType;
  bloodGroup: BloodGroup;
  units: number;
  currentCoordinates: { lat: number; lng: number };
  mapX: number;
  mapY: number;
  originX: number;
  originY: number;
  destX: number;
  destY: number;
  progressPercent: number;
  velocityKmH: number;
  currentTemperatureC: number;
  tempThresholdMaxC: number;
  excursionFlag: boolean;
  etaMinutes: number;
  departureTime: string;
  routeHistory: {
    time: string;
    tempC: number;
    lat: number;
    lng: number;
  }[];
}

export interface InventoryBatch {
  batchUuid: string;
  facilityId: string;
  facilityName: string;
  traumaLevel: TraumaLevel;
  resourceType: BiologicalResourceType;
  bloodGroup: BloodGroup;
  unitsAvailable: number;
  liveStorageTempC: number;
  tempStatus: 'safe' | 'warning' | 'critical';
  collectedDate: string;
  expiryDate: string;
  hoursUntilExpiry: number;
  donorHash: string;
  anticoagulant: string;
  storageChamberId: string;
  viabilityScore: number;
}

export interface ProphetForecastPoint {
  ds: string;
  label: string;
  yHistorical?: number;
  yhat: number;
  yhatLower: number;
  yhatUpper: number;
  safetyStock: number;
  isForecast: boolean;
  anomaly?: string;
}

export interface XGBoostRiskCell {
  facilityId: string;
  facilityName: string;
  bloodGroup: BloodGroup;
  riskProbability: number; // 0 to 1
  currentStock: number;
  baselineDemand: number;
  shapValues: {
    feature: string;
    impact: number; // percentage
  }[];
}

export interface JevExtractionResult {
  rawInput: string;
  source: IngestionSource;
  extracted: {
    resource_type: BiologicalResourceType;
    blood_group: BloodGroup;
    units_requested: number;
    urgency_tier: number;
    confidence_score: number;
    destination_facility_id: string;
    destination_facility_name: string;
    clinical_indication: string;
  };
  validatedPydantic: boolean;
  extractedAt: string;
}
