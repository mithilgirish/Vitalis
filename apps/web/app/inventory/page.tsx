'use client';

import React from 'react';
import { InventoryTable } from '../../components/inventory/InventoryTable';
import { Boxes, ShieldAlert, Clock, Thermometer } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#222329] text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Metropolitan Biological Inventory & Cold Storage Mesh
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Synchronized IoT telemetry across all Chennai hospital blood banks and organ preservation chambers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Amber: Expiring &lt; 24h
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-medium">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            Red: Thermal Limit Drift
          </span>
        </div>
      </div>

      {/* Main Inventory Ledger Data Table */}
      <InventoryTable />
    </div>
  );
}
