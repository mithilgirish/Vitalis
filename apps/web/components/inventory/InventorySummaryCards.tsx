'use client';

import React from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { Boxes, Clock, Thermometer, Droplet } from 'lucide-react';

interface InventorySummaryCardsProps {
  activeFilter: 'all' | 'expiring' | 'thermal';
  onSelectFilter: (filter: 'all' | 'expiring' | 'thermal') => void;
  selectedFacility: string;
}

export function InventorySummaryCards({
  activeFilter,
  onSelectFilter,
  selectedFacility,
}: InventorySummaryCardsProps) {
  const { inventory, hospitals } = useVitalis();

  // Filter based on selectedFacility if active
  const relevantBatches = selectedFacility === 'all'
    ? inventory
    : inventory.filter((b) => b.facilityId === selectedFacility);

  const totalUnits = relevantBatches.reduce((acc, b) => acc + b.unitsAvailable, 0);

  // Critical O- PRBC units
  const oNegativeUnits = relevantBatches
    .filter((b) => b.bloodGroup === 'O-')
    .reduce((acc, b) => acc + b.unitsAvailable, 0);

  // Expiring within 24 hours
  const expiringBatches = relevantBatches.filter((b) => b.hoursUntilExpiry < 24);
  const expiringUnits = expiringBatches.reduce((acc, b) => acc + b.unitsAvailable, 0);

  // Thermal Alerts (temp > 5.0 or critical)
  const thermalAlertBatches = relevantBatches.filter(
    (b) => b.tempStatus === 'critical' || b.liveStorageTempC > 5.0
  );

  // Safe cold-chain compliance percentage
  const safeCount = relevantBatches.filter((b) => b.tempStatus === 'safe').length;
  const compliancePercent = relevantBatches.length > 0
    ? Math.round((safeCount / relevantBatches.length) * 100)
    : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Units In Vaults */}
      <div
        onClick={() => onSelectFilter('all')}
        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
          activeFilter === 'all'
            ? 'border-blue-500/50 bg-blue-500/[0.04] ring-2 ring-blue-500/20'
            : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#222329] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
        } shadow-xs`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-blue-500" />
            Total Units in Vaults
          </span>
          <span className="text-[10px] font-mono text-blue-700 dark:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 font-semibold">
            {relevantBatches.length} Batches
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {totalUnits}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Available Units</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {selectedFacility === 'all'
            ? `Active across all ${hospitals.length} Chennai facilities`
            : `Storage vaults for ${hospitals.find((h) => h.id === selectedFacility)?.shortName || 'Facility'}`}
        </p>
      </div>

      {/* Card 2: Universal Trauma O- Stock */}
      <div
        className={`p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#222329] shadow-xs`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-rose-500" />
            O- Universal Reserve
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
              oNegativeUnits < 8
                ? 'text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/30'
                : 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
            }`}
          >
            {oNegativeUnits < 8 ? 'Deficit Warning' : 'Safe Buffer'}
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {oNegativeUnits}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">O- Units On Hand</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Universal emergency resuscitation units for trauma intake
        </p>
      </div>

      {/* Card 3: Expiring Soon (< 24h) */}
      <div
        onClick={() => onSelectFilter(activeFilter === 'expiring' ? 'all' : 'expiring')}
        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
          activeFilter === 'expiring'
            ? 'border-amber-500/60 bg-amber-500/[0.08] ring-2 ring-amber-500/25'
            : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#222329] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
        } shadow-xs`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Expiring &lt; 24h
          </span>
          <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
            {expiringBatches.length > 0 ? `${expiringBatches.length} Urgent` : '0 Pending'}
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
            {expiringUnits}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Units Nearing Expiry</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Click to filter: prioritize for scheduled surgery or transfer
        </p>
      </div>

      {/* Card 4: Cold-Chain Storage Temperature */}
      <div
        onClick={() => onSelectFilter(activeFilter === 'thermal' ? 'all' : 'thermal')}
        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
          activeFilter === 'thermal'
            ? 'border-rose-500/60 bg-rose-500/[0.08] ring-2 ring-rose-500/25'
            : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#222329] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
        } shadow-xs`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-emerald-500" />
            Cold Storage Health
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
              thermalAlertBatches.length > 0
                ? 'text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/30'
                : 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
            }`}
          >
            {thermalAlertBatches.length > 0 ? `${thermalAlertBatches.length} Alert` : '100% Safe'}
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {compliancePercent}%
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Within 1.0°C–6.0°C</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {thermalAlertBatches.length > 0
            ? 'Click to inspect chambers requiring thermal recalibration'
            : 'All RFID cold-chain vaults operating within clinical limits'}
        </p>
      </div>
    </div>
  );
}
