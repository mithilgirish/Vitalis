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
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-[#2D3748] bg-white dark:bg-[#1A202C] overflow-hidden shadow-xs">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-rose-600 dark:text-rose-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Pending Authorization Queue
            </h2>
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-semibold">
            {requests.filter((r) => r.status === 'pending_approval').length} Pending
          </span>
        </div>

        {/* Tier Filter Buttons */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => setFilterTier('all')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all cursor-pointer ${
              filterTier === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterTier(1)}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all cursor-pointer ${
              filterTier === 1
                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold border border-rose-500/30'
                : 'text-rose-600/80 dark:text-rose-400/80 hover:text-rose-700 dark:hover:text-rose-300'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            Tier 1 Resuscitative
          </button>
          <button
            onClick={() => setFilterTier(2)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all cursor-pointer ${
              filterTier === 2
                ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold border border-amber-500/30'
                : 'text-amber-700/80 dark:text-amber-400/80 hover:text-amber-800 dark:hover:text-amber-300'
            }`}
          >
            Tier 2 Emergent
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
                className={`group p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-rose-400 dark:border-rose-500/60 bg-rose-50/70 dark:bg-rose-950/20 shadow-xs ring-1 ring-rose-400 dark:ring-rose-500/30'
                    : 'border-slate-200 dark:border-slate-800/90 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Card Top: ESI Tier & Priority Monospace Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeBg} ${color}`}
                  >
                    {req.urgencyLabel}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">PI Score</span>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                      {req.priorityScore.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* Target Facility & Patient Indication */}
                <div className="mt-2.5">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-white transition-colors">
                    {req.destinationFacilityName}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {req.clinicalIndication}
                  </p>
                </div>

                {/* Resource Details Pill */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800/70 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-bold">
                      {req.unitsRequested}x {req.bloodGroup} {req.resourceType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
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
                        ? 'text-blue-600 dark:text-blue-400 font-semibold'
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
