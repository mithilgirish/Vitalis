import { BiologicalResourceType, BloodGroup, ProphetForecastPoint, XGBoostRiskCell, Hospital } from '../types';
import { CHENNAI_HOSPITALS } from '../data/mockData';

// Facility scaling profiles based on bed capacity and trauma level
export interface FacilityProfile {
  id: string;
  name: string;
  shortName: string;
  volumeMultiplier: number; // Scaled to hospital size
  safetyStockMultiplier: number;
  riskBaseline: number; // Baseline shortage probability
  primaryDeficitGroup: BloodGroup;
  primarySurplusGroup: BloodGroup;
  recommendedPartnerId: string; // Optimal rebalance partner
  specialtyTag: string;
}

export const FACILITY_PROFILES: Record<string, FacilityProfile> = {
  'FAC-APOLLO': {
    id: 'FAC-APOLLO',
    name: 'Apollo Hospitals, Greams Road',
    shortName: 'Apollo Greams Rd',
    volumeMultiplier: 1.1,
    safetyStockMultiplier: 1.2,
    riskBaseline: 0.68,
    primaryDeficitGroup: 'O-',
    primarySurplusGroup: 'B+',
    recommendedPartnerId: 'FAC-RBTC',
    specialtyTag: 'Level 1 Trauma & Cardiac Resuscitation Hub',
  },
  'FAC-RGGGH': {
    id: 'FAC-RGGGH',
    name: 'Rajiv Gandhi Government General Hospital',
    shortName: 'Rajiv Gandhi Govt General',
    volumeMultiplier: 1.8,
    safetyStockMultiplier: 2.0,
    riskBaseline: 0.08,
    primaryDeficitGroup: 'AB-',
    primarySurplusGroup: 'O+',
    recommendedPartnerId: 'FAC-STANLEY',
    specialtyTag: 'Major Government Tertiary & Regional Repository',
  },
  'FAC-FORTIS': {
    id: 'FAC-FORTIS',
    name: 'Fortis Malar Hospital',
    shortName: 'Fortis Malar',
    volumeMultiplier: 0.45,
    safetyStockMultiplier: 0.5,
    riskBaseline: 0.54,
    primaryDeficitGroup: 'AB-',
    primarySurplusGroup: 'B+',
    recommendedPartnerId: 'FAC-RBTC',
    specialtyTag: 'Advanced Heart & Vascular Transplant Center',
  },
  'FAC-RBTC': {
    id: 'FAC-RBTC',
    name: 'Regional Blood Transfusion Center',
    shortName: 'Regional Blood Transfusion Center',
    volumeMultiplier: 2.5,
    safetyStockMultiplier: 3.5,
    riskBaseline: 0.04,
    primaryDeficitGroup: 'B-',
    primarySurplusGroup: 'O-',
    recommendedPartnerId: 'FAC-APOLLO',
    specialtyTag: 'State Apex Reserve & Cold-Chain Logistics Hub',
  },
  'FAC-STANLEY': {
    id: 'FAC-STANLEY',
    name: 'Government Stanley Medical College Hospital',
    shortName: 'Stanley Medical College',
    volumeMultiplier: 1.4,
    safetyStockMultiplier: 1.5,
    riskBaseline: 0.12,
    primaryDeficitGroup: 'A-',
    primarySurplusGroup: 'A+',
    recommendedPartnerId: 'FAC-RGGGH',
    specialtyTag: 'North Chennai Surgical & Emergency Center',
  },
  'FAC-SRMC': {
    id: 'FAC-SRMC',
    name: 'Sri Ramachandra Institute of Higher Education',
    shortName: 'Sri Ramachandra (SRMC)',
    volumeMultiplier: 0.95,
    safetyStockMultiplier: 0.9,
    riskBaseline: 0.46,
    primaryDeficitGroup: 'B-',
    primarySurplusGroup: 'O+',
    recommendedPartnerId: 'FAC-RBTC',
    specialtyTag: 'Western Highway Trauma & Multi-Organ Center',
  },
  'FAC-MIOT': {
    id: 'FAC-MIOT',
    name: 'MIOT International Hospital',
    shortName: 'MIOT International',
    volumeMultiplier: 0.75,
    safetyStockMultiplier: 0.8,
    riskBaseline: 0.19,
    primaryDeficitGroup: 'O-',
    primarySurplusGroup: 'AB+',
    recommendedPartnerId: 'FAC-RBTC',
    specialtyTag: 'Orthopedic Trauma & Joint Replacement Center',
  },
  'FAC-GLENEAGLES': {
    id: 'FAC-GLENEAGLES',
    name: 'Gleneagles Health City Chennai',
    shortName: 'Gleneagles Health City',
    volumeMultiplier: 0.65,
    safetyStockMultiplier: 0.7,
    riskBaseline: 0.22,
    primaryDeficitGroup: 'A-',
    primarySurplusGroup: 'B+',
    recommendedPartnerId: 'FAC-FORTIS',
    specialtyTag: 'Liver ICU & Multi-Organ Transplant Hospital',
  },
};

// Resource volume baselines (average units/day for a baseline facility)
const RESOURCE_BASELINES: Record<BiologicalResourceType, { baseVolume: number; safetyBase: number; isOrgan: boolean }> = {
  PRBC: { baseVolume: 42, safetyBase: 18, isOrgan: false },
  'Whole Blood': { baseVolume: 35, safetyBase: 15, isOrgan: false },
  Platelets: { baseVolume: 24, safetyBase: 12, isOrgan: false },
  FFP: { baseVolume: 20, safetyBase: 10, isOrgan: false },
  Cryoprecipitate: { baseVolume: 12, safetyBase: 6, isOrgan: false },
  Kidney: { baseVolume: 2, safetyBase: 1, isOrgan: true },
  Liver: { baseVolume: 1.5, safetyBase: 1, isOrgan: true },
  Heart: { baseVolume: 1, safetyBase: 1, isOrgan: true },
};

/**
 * Generates dynamic, medically consistent Prophet time-series forecast points
 * tailored to any specific hospital, resource type, and time horizon.
 */
export function generateProphetForecast(
  facilityId: string,
  resourceType: BiologicalResourceType,
  horizon: '7d' | '14d'
): ProphetForecastPoint[] {
  const profile = FACILITY_PROFILES[facilityId] || FACILITY_PROFILES['FAC-APOLLO'];
  const resMeta = RESOURCE_BASELINES[resourceType] || RESOURCE_BASELINES['PRBC'];

  const multiplier = profile.volumeMultiplier;
  const baseVol = Math.max(1, Math.round(resMeta.baseVolume * multiplier));
  const safetyStock = Math.max(1, Math.round(resMeta.safetyBase * profile.safetyStockMultiplier));

  const totalForecastDays = horizon === '7d' ? 7 : 14;
  const historicalDays = 14;

  const points: ProphetForecastPoint[] = [];
  // Stable reference baseline anchor for clinical simulation & SSR prerender
  const today = new Date('2026-10-18T00:00:00Z');

  // Pseudo-random deterministic generator based on facility + resource to ensure stable charts
  let seed = 0;
  for (let i = 0; i < facilityId.length; i++) seed += facilityId.charCodeAt(i);
  for (let i = 0; i < resourceType.length; i++) seed += resourceType.charCodeAt(i);

  const pseudoRandom = (step: number) => {
    const x = Math.sin(seed + step * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  // 1. Generate 14 days of historical consumption
  for (let d = historicalDays; d >= 1; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = date.getDate().toString().padStart(2, '0');
    const dayOfWeek = date.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday

    // Weekend or Friday surge factor
    let weekendBonus = 1.0;
    if (dayOfWeek === 5) weekendBonus = 1.22; // Friday surge
    if (dayOfWeek === 6 || dayOfWeek === 0) weekendBonus = 1.35; // Weekend trauma peaks

    const noise = (pseudoRandom(d) - 0.5) * 0.25;
    const yVal = Math.max(1, Math.round(baseVol * weekendBonus * (1 + noise)));
    const yHatVal = Math.max(1, Math.round(yVal * (0.97 + (pseudoRandom(d + 10) - 0.5) * 0.08)));

    const margin = resMeta.isOrgan ? 1 : Math.max(3, Math.round(yHatVal * 0.18));

    let anomaly: string | undefined = undefined;
    if (d === 7 && profile.riskBaseline > 0.4) {
      anomaly = 'Trauma Intake Surge (+25%)';
    } else if (d === 2 && dayOfWeek === 5) {
      anomaly = 'Emergency Resuscitation Spike';
    }

    points.push({
      ds: dateStr,
      label: `${month} ${dayNum}`,
      yHistorical: yVal,
      yhat: yHatVal,
      yhatLower: Math.max(0, yHatVal - margin),
      yhatUpper: yHatVal + margin,
      safetyStock,
      isForecast: false,
      anomaly,
    });
  }

  // 2. Current Day (Today)
  const todayStr = today.toISOString().split('T')[0];
  const todayMonth = today.toLocaleDateString('en-US', { month: 'short' });
  const todayDay = today.getDate().toString().padStart(2, '0');
  const todayY = Math.max(1, Math.round(baseVol * 1.05));
  const todayMargin = resMeta.isOrgan ? 1 : Math.max(3, Math.round(todayY * 0.18));

  points.push({
    ds: todayStr,
    label: `Today (${todayMonth} ${todayDay})`,
    yHistorical: todayY,
    yhat: todayY,
    yhatLower: Math.max(0, todayY - todayMargin),
    yhatUpper: todayY + todayMargin,
    safetyStock,
    isForecast: false,
  });

  // 3. Future Forecast Days
  for (let f = 1; f <= totalForecastDays; f++) {
    const fDate = new Date(today);
    fDate.setDate(today.getDate() + f);
    const fDateStr = fDate.toISOString().split('T')[0];
    const fMonth = fDate.toLocaleDateString('en-US', { month: 'short' });
    const fDay = fDate.getDate().toString().padStart(2, '0');
    const dayOfWeek = fDate.getDay();

    let futureSurge = 1.0;
    if (dayOfWeek === 5) futureSurge = 1.25;
    if (dayOfWeek === 6 || dayOfWeek === 0) futureSurge = 1.38;

    // Projected future trend with slight expansion of uncertainty bounds
    const uncertaintyGrowth = 1 + f * 0.035;
    const noise = (pseudoRandom(f + 50) - 0.48) * 0.2;
    const predictedY = Math.max(1, Math.round(baseVol * futureSurge * (1 + noise)));
    const margin = resMeta.isOrgan ? 1 : Math.max(4, Math.round(predictedY * 0.22 * uncertaintyGrowth));

    let anomaly: string | undefined = undefined;
    if (f === 3 && profile.riskBaseline > 0.4) {
      anomaly = `Predicted Demand Surge (+${Math.round(profile.riskBaseline * 40)}%)`;
    } else if (f === 5 && (dayOfWeek === 5 || dayOfWeek === 6)) {
      anomaly = 'Critical Reserve Window';
    }

    points.push({
      ds: fDateStr,
      label: `${fMonth} ${fDay} (F)`,
      yhat: predictedY,
      yhatLower: Math.max(0, predictedY - margin),
      yhatUpper: predictedY + margin,
      safetyStock,
      isForecast: true,
      anomaly,
    });
  }

  return points;
}

/**
 * Returns dynamic clinical insights and advisory cards for the active hospital.
 */
export function getHospitalAnalyticsInsight(
  facilityId: string,
  resourceType: BiologicalResourceType,
  hospitals: Hospital[]
) {
  const profile = FACILITY_PROFILES[facilityId] || FACILITY_PROFILES['FAC-APOLLO'];
  const resMeta = RESOURCE_BASELINES[resourceType] || RESOURCE_BASELINES['PRBC'];
  const targetHospital = hospitals.find((h) => h.id === facilityId);
  const partnerHospital = hospitals.find((h) => h.id === profile.recommendedPartnerId);

  const isHighRisk = profile.riskBaseline >= 0.4;
  const isSurplus = profile.riskBaseline < 0.15;

  const surgePercent = Math.round(profile.riskBaseline * 42 + (resMeta.isOrgan ? 10 : 15));
  const deficitUnits = resMeta.isOrgan
    ? 2
    : Math.max(4, Math.round(18 * profile.volumeMultiplier * (isHighRisk ? 1.4 : 0.8)));

  const recommendedTransferUnits = resMeta.isOrgan
    ? 1
    : Math.max(2, Math.round(8 * (isHighRisk ? 1.2 : 0.6)));

  let card1Title = 'Projected Demand Surge';
  let card1Badge = `+${surgePercent}% Demand`;
  let card1Main = `${profile.primaryDeficitGroup} ${resourceType}`;
  let card1Text = `Trauma intake projected to exceed clinical safety buffer by ${deficitUnits} units across ${profile.shortName} during upcoming high-traffic surge window.`;

  if (isSurplus) {
    card1Title = 'Regional Hub Supply Surplus';
    card1Badge = 'Reserve Buffer Safe';
    card1Main = `${profile.primarySurplusGroup} ${resourceType} Reservoir`;
    card1Text = `${profile.shortName} maintains high reserves with ${targetHospital?.currentStockUnits || 200}+ units on hand. Ready to supply regional emergency requests without deficit risk.`;
  }

  const card2Title = 'Recommended Supply Redistribution';
  const card2Badge = isHighRisk ? 'Immediate Action' : 'Optimal Balance';
  const card2Main = isHighRisk
    ? `${partnerHospital?.shortName || 'RBTC'} → ${profile.shortName}`
    : `${profile.shortName} → ${partnerHospital?.shortName || 'Fortis Malar'}`;
  const card2Text = isHighRisk
    ? `Pre-emptive delivery of ${recommendedTransferUnits} units ${profile.primaryDeficitGroup} ${resourceType} from ${partnerHospital?.shortName || 'RBTC'} recommended to maintain reserve above safe threshold.`
    : `Surplus stock can safely fulfill transfers of up to ${recommendedTransferUnits} units to peer hospitals while maintaining local trauma reserve > 90%.`;

  const reliabilityPercent = (95.4 - profile.riskBaseline * 3.2).toFixed(1);

  return {
    facility: profile,
    targetHospital,
    partnerHospital,
    card1: { title: card1Title, badge: card1Badge, main: card1Main, text: card1Text, isAlert: isHighRisk },
    card2: { title: card2Title, badge: card2Badge, main: card2Main, text: card2Text, isActionNeeded: isHighRisk },
    card3: {
      title: 'Clinical Forecast Reliability',
      badge: `${reliabilityPercent}% Reliability`,
      main: isHighRisk ? 'High Alert • Calibrated' : 'Optimal Reserve Health',
      text: `XGBoost model calibrated against real-time patient admissions and cold-chain telemetry across Chennai central network.`,
    },
  };
}

/**
 * Builds the comprehensive 8-Hospital x 8-Blood Group Heatmap matrix
 */
export function buildCompleteHeatmapData(): XGBoostRiskCell[] {
  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const cells: XGBoostRiskCell[] = [];

  for (const hosp of CHENNAI_HOSPITALS) {
    const profile = FACILITY_PROFILES[hosp.id] || {
      volumeMultiplier: 1.0,
      riskBaseline: hosp.stockoutRisk72h,
      primaryDeficitGroup: 'O-' as BloodGroup,
      primarySurplusGroup: 'B+' as BloodGroup,
    };

    for (const bg of bloodGroups) {
      let risk = profile.riskBaseline;

      // Adjust risk by blood group rarity
      if (bg === 'O-') risk = Math.min(0.92, risk * 1.35 + 0.08);
      else if (bg === 'AB-') risk = Math.min(0.88, risk * 1.3 + 0.1);
      else if (bg === 'A-') risk = Math.min(0.82, risk * 1.15);
      else if (bg === 'B-') risk = Math.min(0.80, risk * 1.18);
      else if (bg === 'O+') risk = Math.max(0.04, risk * 0.65);
      else if (bg === 'A+') risk = Math.max(0.03, risk * 0.55);
      else if (bg === 'B+') risk = Math.max(0.02, risk * 0.48);
      else if (bg === 'AB+') risk = Math.max(0.02, risk * 0.40);

      // Baseline stock and demand
      const stockMultiplier = hosp.isRegionalBloodBank ? 6.0 : hosp.totalBeds ? hosp.totalBeds / 400 : 1.0;
      const currentStock = Math.max(1, Math.round((1.0 - risk) * 35 * stockMultiplier));
      const baselineDemand = Math.max(2, Math.round(risk * 25 * profile.volumeMultiplier + 6));

      // Specific SHAP explainability factors
      const isBreach = risk >= 0.4;
      const shapValues = isBreach
        ? [
            { feature: bg === 'O-' ? 'Level 1 Trauma Universal Drain' : 'Low Local Reserve Buffer', impact: +Math.round(risk * 70) },
            { feature: 'Seasonal Transfusion Velocity', impact: +Math.round(risk * 25) },
          ]
        : [
            { feature: hosp.isRegionalBloodBank ? 'Apex Regional Stockpile' : 'Adequate Buffer Stock', impact: -Math.round((1 - risk) * 55) },
            { feature: 'Stable Donor Replenishment', impact: -Math.round((1 - risk) * 25) },
          ];

      cells.push({
        facilityId: hosp.id,
        facilityName: hosp.shortName,
        bloodGroup: bg,
        riskProbability: Math.min(0.95, Math.max(0.02, parseFloat(risk.toFixed(2)))),
        currentStock,
        baselineDemand,
        shapValues,
      });
    }
  }

  return cells;
}
