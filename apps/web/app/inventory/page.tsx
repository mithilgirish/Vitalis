'use client';

import React, { useState } from 'react';
import { InventorySummaryCards } from '../../components/inventory/InventorySummaryCards';
import { InventoryTable } from '../../components/inventory/InventoryTable';
import { Boxes } from 'lucide-react';

export default function InventoryPage() {
  const [alertFilter, setAlertFilter] = useState<'all' | 'expiring' | 'thermal'>('all');
  const [facilityFilter, setFacilityFilter] = useState<string>('all');

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white/80 dark:bg-[#222329]/90 backdrop-blur-xl text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Regional Hospital Blood & Organ Reserves
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Live inventory tracking across all 8 Chennai hospital RFID cold-chain vaults and organ banks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            RFID Sensors Active
          </span>
        </div>
      </div>

      {/* Interactive KPI Summary Cards */}
      <InventorySummaryCards
        activeFilter={alertFilter}
        onSelectFilter={setAlertFilter}
        selectedFacility={facilityFilter}
      />

      {/* Main Inventory Ledger Data Table with Hospital Filter & Intake Action */}
      <InventoryTable
        externalAlertFilter={alertFilter}
        onFilterChange={setAlertFilter}
        selectedFacilityFilter={facilityFilter}
        onFacilityChange={setFacilityFilter}
      />
    </div>
  );
}
