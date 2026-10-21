'use client';

import React from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { PendingRequestsList } from '../../components/approvals/PendingRequestsList';
import { RequestInspector } from '../../components/approvals/RequestInspector';
import { ShieldCheck, CheckSquare, AlertCircle } from 'lucide-react';

export default function ApprovalsPage() {
  const { requests, selectedRequest, setSelectedRequest } = useVitalis();

  // Find the selected request or default to the first one available
  const activeRequest =
    requests.find((r) => r.id === selectedRequest?.id) || requests[0];

  return (
    <div className="space-y-4">
      {/* Top Banner Notice: Clinical Authorization Governance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#222329] text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Physician Authorization Required Before Dispatch
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Every emergency blood and organ redistribution requires clinical supervisor sign-off before couriers are dispatched.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">Pending Review:</span>
          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold">
            {requests.filter((r) => r.status === 'pending_approval').length} Requests Waiting
          </span>
        </div>
      </div>

      {/* Two Column Layout: Left (Pending Requests List) | Right (Inspector & Reasoning Trace) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-14rem)] min-h-[640px]">
        {/* Left Column: 4 Cols on Large Screens */}
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <PendingRequestsList
            selectedRequestId={activeRequest?.id}
            onSelectRequest={(req) => setSelectedRequest(req)}
          />
        </div>

        {/* Right Column: 7-8 Cols on Large Screens */}
        <div className="lg:col-span-7 xl:col-span-8 h-full">
          {activeRequest ? (
            <RequestInspector request={activeRequest} />
          ) : (
            <div className="h-full rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#222329] flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono shadow-xs">
              <CheckSquare className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Request Selected</p>
              <p className="text-xs text-slate-400 mt-1">Select an emergency request from the queue to review patient details and authorize dispatch.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
