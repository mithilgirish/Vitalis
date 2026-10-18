'use client';

import React from 'react';
import { InventoryBatch } from '../../lib/types';
import { formatHoursRemaining } from '../../lib/utils';
import {
  Boxes,
  Thermometer,
  Clock,
  ShieldCheck,
  AlertTriangle,
  X,
  FileCheck,
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
    <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-[#2D3748] bg-white dark:bg-[#1A202C] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Biological Batch Ledger Entry
                </h3>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {batch.batchUuid}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {batch.facilityName} • Storage Vault: {batch.storageChamberId}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Biological Specifications */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block">Biological Resource</span>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
              {batch.bloodGroup} {batch.resourceType}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Available: {batch.unitsAvailable} Units
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl border ${
              isTempCritical
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/50 text-rose-700 dark:text-rose-300'
                : isTempWarning
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/50 text-amber-700 dark:text-amber-300'
                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <span className="text-[10px] uppercase text-slate-400 block">Storage Temperature</span>
            <span className="text-sm font-bold flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5" />
              {batch.liveStorageTempC.toFixed(1)}°C
            </span>
            <span className="text-[10px] block mt-0.5 font-semibold">
              Status: {batch.tempStatus.toUpperCase()}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl border ${
              isExpiringSoon
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/50 text-amber-800 dark:text-amber-300'
                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <span className="text-[10px] uppercase text-slate-400 block">Expiration Countdown</span>
            <span className="text-sm font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatHoursRemaining(batch.hoursUntilExpiry)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Expires: {batch.expiryDate}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block">Preservation Solution</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {batch.anticoagulant}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-semibold">
              Viability Score: {batch.viabilityScore}%
            </span>
          </div>
        </div>

        {/* Cryptographic Traceability */}
        <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 font-mono text-[11px] space-y-1.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-200">IoT RFID Smart Vault Verification</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Donor Cryptographic Hash: <span className="text-slate-800 dark:text-slate-200 font-medium">{batch.donorHash}</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Collection Timestamp: <span className="text-slate-800 dark:text-slate-200 font-medium">{batch.collectedDate} • Regional Blood Program</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
