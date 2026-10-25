'use client';

import React, { useState } from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { TransferRequest } from '../../lib/types';
import {
  Clock,
  Building2,
  Search,
  Inbox,
  Droplet,
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
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_transit'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter((r) => {
    if (filter === 'pending' && r.status !== 'pending_approval') return false;
    if (filter === 'in_transit' && r.status !== 'in_transit') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        r.destinationFacilityName.toLowerCase().includes(q) ||
        r.resourceType.toLowerCase().includes(q) ||
        r.bloodGroup.toLowerCase().includes(q) ||
        r.clinicalIndication.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending_approval').length;

  return (
    <div className="flex flex-col h-full rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#1C1D22]/90 backdrop-blur-xl overflow-hidden shadow-sm">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-black/[0.05] dark:border-white/[0.06] space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Emergency Transfer Queue
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select a hospital request to review
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold">
            {pendingCount} Pending
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hospital or blood type..."
            className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer text-center ${
              filter === 'all'
                ? 'bg-white dark:bg-[#2A2B33] text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer text-center ${
              filter === 'pending'
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            Waiting ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('in_transit')}
            className={`flex-1 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer text-center ${
              filter === 'in_transit'
                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            On The Way
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
            <Inbox className="w-8 h-8 text-slate-400/40 mb-2" />
            <span>No hospital transfer requests matching your filter.</span>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isSelected = selectedRequestId === req.id;
            const isPending = req.status === 'pending_approval';
            const isLevel1 = req.esiUrgencyTier === 1;

            return (
              <div
                key={req.id}
                onClick={() => onSelectRequest(req)}
                className={`group p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'border-rose-500/80 bg-rose-500/[0.06] ring-2 ring-rose-500/20 shadow-sm'
                    : 'border-black/[0.06] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                {/* Top Badge: Level of Urgency & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isLevel1
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {isLevel1 ? 'Critical (Level 1)' : 'Urgent (Level 2)'}
                  </span>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      isPending
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                        : req.status === 'in_transit'
                        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                    }`}
                  >
                    {isPending ? 'Needs Doctor Sign-Off' : req.status === 'in_transit' ? 'Driver On The Way' : 'Delivered'}
                  </span>
                </div>

                {/* Receiving Hospital */}
                <div className="mt-2.5">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{req.destinationFacilityName}</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {req.clinicalIndication}
                  </p>
                </div>

                {/* Supply Requested & Time Deadline */}
                <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-black/[0.04] dark:border-white/[0.05] text-xs">
                  <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                    <Droplet className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {req.unitsRequested}x {req.bloodGroup} {req.resourceType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>Deliver in &le;{req.viabilityWindowMinutes}m</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
