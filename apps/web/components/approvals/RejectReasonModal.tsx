'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, RefreshCw } from 'lucide-react';

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  requestId: string;
}

const COMMON_REASONS = [
  'Severe traffic congestion / road closure on transit corridor',
  'Source facility cold-storage chamber telemetry anomalous',
  'Destination ER patient status stabilized / cancelled',
  'Alternative compatible unit identified in-house',
  'Cold-chain transport container unavailable',
];

export function RejectReasonModal({
  isOpen,
  onClose,
  onConfirm,
  requestId,
}: RejectReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const reason = customReason.trim() ? customReason : selectedReason;
    onConfirm(reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-[#1A202C] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Reject Dispatch #{requestId}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                LangChain ReAct solver will automatically recalculate fallback donor nodes
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 block font-medium">
            Select Clinical Rejection Reason (HITL Governance Audit):
          </label>
          <div className="space-y-2">
            {COMMON_REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  selectedReason === r && !customReason
                    ? 'border-rose-400 dark:border-rose-500/60 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 font-medium'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  checked={selectedReason === r && !customReason}
                  onChange={() => {
                    setSelectedReason(r);
                    setCustomReason('');
                  }}
                  className="accent-rose-600"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>

          <div className="pt-2">
            <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mb-1">
              Or specify custom clinical justification:
            </label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g. Incompatible crossmatch reported by lab..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:outline-none shadow-xs"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Confirm Rejection & Recalculate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
