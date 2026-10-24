'use client';

import React from 'react';
import { InventoryBatch } from '../../lib/types';
import { formatHoursRemaining } from '../../lib/utils';
import {
  Boxes,
  Thermometer,
  Clock,
  X,
  Cpu,
} from 'lucide-react';

interface BatchDetailModalProps {
  batch: InventoryBatch | null;
  onClose: () => void;
}

export function BatchDetailModal({ batch, onClose }: BatchDetailModalProps) {
  if (!batch) return null;

  const isTempCritical = batch.tempStatus === 'critical';
  const isTempWarning = batch.tempStatus === 'warning';
  const isExpiringSoon = batch.hoursUntilExpiry < 24;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-black/[0.08] dark:border-white/[0.1] bg-white/95 dark:bg-[#222329]/95 backdrop-blur-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#0A84FF]/15 dark:text-[#0A84FF] border border-[#0071E3]/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Biological Batch Ledger Entry
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-slate-600 dark:text-slate-400">
                  {batch.batchUuid}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {batch.facilityName} • Storage Chamber: {batch.storageChamberId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Biological Specifications */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-semibold tracking-wider block">Biological Resource</span>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {batch.bloodGroup} {batch.resourceType}
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-1">
              Available: <span className="font-semibold text-slate-900 dark:text-white">{batch.unitsAvailable} Units</span>
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border ${
              isTempCritical
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                : isTempWarning
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.08] text-slate-800 dark:text-slate-200'
            }`}
          >
            <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-semibold tracking-wider block">Storage Temperature</span>
            <span className="text-sm font-bold flex items-center gap-1 font-mono mt-0.5">
              <Thermometer className="w-3.5 h-3.5" />
              {batch.liveStorageTempC.toFixed(1)}°C
            </span>
            <span className="text-[11px] block mt-1 font-semibold uppercase">
              Status: {batch.tempStatus}
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border ${
              isExpiringSoon
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.08] text-slate-800 dark:text-slate-200'
            }`}
          >
            <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-semibold tracking-wider block">Expiration Countdown</span>
            <span className="text-sm font-bold flex items-center gap-1 font-mono mt-0.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {formatHoursRemaining(batch.hoursUntilExpiry)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
              Expires: {batch.expiryDate}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-semibold tracking-wider block">Preservation Solution</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {batch.anticoagulant}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-1 font-semibold">
              Viability Score: {batch.viabilityScore}%
            </span>
          </div>
        </div>

        {/* Cryptographic Traceability */}
        <div className="mt-4 p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.07] font-mono text-[11px] space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-sans">
            <Cpu className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#0A84FF]" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">IoT RFID Smart Vault Verification</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Donor Cryptographic Hash: <span className="text-slate-800 dark:text-slate-200 font-medium">{batch.donorHash}</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Collection Timestamp: <span className="text-slate-800 dark:text-slate-200 font-medium">{batch.collectedDate} • Regional Blood Program</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-full border border-black/[0.1] dark:border-white/[0.15] bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
