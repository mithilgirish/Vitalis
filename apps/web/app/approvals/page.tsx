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
      {/* Top Banner Notice: Zero Autonomous Dispatch Governance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800 bg-[#0B1120] text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-semibold text-slate-100">
              Human-in-the-Loop (HITL) Regulatory Enforcement Active
            </span>
            <p className="text-[11px] text-slate-400">
              Every organ, blood, and cold-chain redistribution requires clinical supervisor sign-off before courier broadcast.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-400">Active Queue:</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
            {requests.filter((r) => r.status === 'pending_approval').length} Requiring Authorization
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
            <div className="h-full rounded-2xl border border-slate-800 bg-[#0B1120] flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono">
              <CheckSquare className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-300">No Request Selected</p>
              <p className="text-xs text-slate-500 mt-1">Select an item from the pending queue to inspect reasoning and authorize.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
