'use client';

import React from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { AlertCircle, AlertTriangle, Truck, Clock, ShieldCheck, Thermometer } from 'lucide-react';

export function KpiOverlayCards() {
  const { requests, hospitals, telemetry } = useVitalis();

  // Active deficits: unresolved ESI Tier 1-2 requests
  const activeDeficits = requests.filter(
    (r) => r.status === 'pending_approval' && (r.esiUrgencyTier === 1 || r.esiUrgencyTier === 2)
  );

  // 72h Stockout Warnings: facilities flagged by XGBoost classifier (> 40% risk)
  const stockoutWarningHospitals = hospitals.filter((h) => h.stockoutRisk72h >= 0.4);

  // Active Couriers in Transit & Cold-chain compliance percentage
  const couriersInTransit = telemetry.length;
  const compliantCouriers = telemetry.filter((t) => !t.excursionFlag).length;
  const complianceRate = couriersInTransit > 0 ? (compliantCouriers / couriersInTransit) * 100 : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pointer-events-auto">
      {/* KPI 1: Active Deficits */}
      <div className="apple-card p-4.5 hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            Active Deficits (ESI 1–2)
          </span>
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {activeDeficits.length}
          </span>
          <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Critical Deficits</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {activeDeficits.length > 0
            ? `${activeDeficits[0].destinationFacilityName}`
            : 'No active code red deficits'}
        </p>
      </div>

      {/* KPI 2: 72h Stockout Warnings */}
      <div className="apple-card p-4.5 hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            72h Stockout Warnings
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-medium">
            XGBoost &gt; 40%
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {stockoutWarningHospitals.length}
          </span>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Facilities at Risk</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
          Fortis Malar, Sri Ramachandra flagged
        </p>
      </div>

      {/* KPI 3: Active Couriers & Cold Chain */}
      <div className="apple-card p-4.5 hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-500" />
            Couriers in Transit
          </span>
          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
            {complianceRate.toFixed(1)}% Safe
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {couriersInTransit}
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Dispatches En Route</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Cold-Chain Viability SLA: 100% Monitored
        </p>
      </div>

      {/* KPI 4: Mean Network Viability Response */}
      <div className="apple-card p-4.5 hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            Avg Network Transit
          </span>
          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
            SLA &lt; 30m
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            16.2
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Minutes to Target</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          PostGIS optimal corridor routing active
        </p>
      </div>
    </div>
  );
}
