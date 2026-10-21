'use client';

import React, { useState } from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { TransferRequest } from '../../lib/types';
import { formatUrgencyTier } from '../../lib/utils';
import {
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  XCircle,
  CheckSquare,
  Search,
} from 'lucide-react';

interface PendingRequestsListProps {
  onSelectRequest: (req: TransferRequest) => void;
  selectedRequestId: string | undefined;
}

export function PendingRequestsList({
  onSelectRequest,
  selectedRequestId,
}: PendingRequestsListProps) {
  const { requests } = useVitalis();
  const [filterTier, setFilterTier] = useState<number | 'all'>('all');

  const sortedRequests = [...requests].sort((a, b) => {
    if (a.esiUrgencyTier !== b.esiUrgencyTier) {
      return a.esiUrgencyTier - b.esiUrgencyTier;
    }
    return b.priorityScore - a.priorityScore;
  });

  const filteredRequests = sortedRequests.filter((r) => {
    if (filterTier !== 'all' && r.esiUrgencyTier !== filterTier) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#222329]/80 backdrop-blur-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
      {/* Header & Filter Controls - Apple Segmented Bar */}
      <div className="p-4 border-b border-black/[0.05] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02] space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#FF375F] dark:text-[#FF453A]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Hospital Transfer Requests
            </h2>
          </div>
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold">
            {requests.filter((r) => r.status === 'pending_approval').length} To Approve
          </span>
        </div>

        {/* Tier Filter Buttons - Segmented Pill Control */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06]">
          <button
            onClick={() => setFilterTier('all')}
            className={`flex-1 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer text-center ${
              filterTier === 'all'
                ? 'bg-white dark:bg-[#2C2D35] text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterTier(1)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
              filterTier === 1
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/30 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            ESI 1 (Critical)
          </button>
          <button
            onClick={() => setFilterTier(2)}
            className={`flex-1 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer text-center ${
              filterTier === 2
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/30 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300'
            }`}
          >
            ESI 2 (Urgent)
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500/50 mb-2" />
            <span>All emergency transfer requests have been processed.</span>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isSelected = selectedRequestId === req.id;
            const { color, badgeBg } = formatUrgencyTier(req.esiUrgencyTier);
            const isPending = req.status === 'pending_approval';

            return (
              <div
                key={req.id}
                onClick={() => onSelectRequest(req)}
                className={`group p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 shadow-2xs ${
                  isSelected
                    ? 'border-[#0071E3] dark:border-[#0A84FF] bg-[#0071E3]/[0.05] dark:bg-[#0A84FF]/[0.08] ring-1 ring-[#0071E3]/30 dark:ring-[#0A84FF]/30 shadow-sm'
                    : 'border-black/[0.05] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:border-black/[0.1] dark:hover:border-white/[0.1]'
                }`}
              >
                {/* Card Top: ESI Tier & Priority Monospace Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeBg} ${color}`}
                  >
                    {req.urgencyLabel}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-sans">PI Score</span>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-black/[0.03] dark:bg-white/[0.06] px-1.5 py-0.5 rounded-md border border-black/[0.05] dark:border-white/[0.08]">
                      {req.priorityScore.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* Target Facility & Patient Indication */}
                <div className="mt-2.5">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#0071E3] dark:group-hover:text-[#0A84FF] transition-colors">
                    {req.destinationFacilityName}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {req.clinicalIndication}
                  </p>
                </div>

                {/* Resource Details Pill */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.05] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold font-mono text-[11px]">
                      {req.unitsRequested}x {req.bloodGroup} {req.resourceType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>{req.viabilityWindowMinutes}m viability</span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">UUID: {req.id}</span>
                  <span
                    className={
                      req.status === 'pending_approval'
                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                        : req.status === 'in_transit'
                        ? 'text-[#0071E3] dark:text-[#0A84FF] font-semibold'
                        : 'text-slate-500'
                    }
                  >
                    {req.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
