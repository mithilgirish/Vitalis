'use client';

import React from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { PendingRequestsList } from '../../components/approvals/PendingRequestsList';
import { RequestInspector } from '../../components/approvals/RequestInspector';
import { ShieldCheck, CheckSquare, Clock, Truck } from 'lucide-react';

export default function ApprovalsPage() {
  const { requests, selectedRequest, setSelectedRequest, telemetry } = useVitalis();

  // Find the selected request or default to the first one available
  const activeRequest =
    requests.find((r) => r.id === selectedRequest?.id) || requests[0];

  const pendingCount = requests.filter((r) => r.status === 'pending_approval').length;
  const inTransitCount = telemetry.length;

  return (
    <div className="space-y-4">
      {/* Top Banner Notice: Simple 3-Step Clinical Sign-Off Guide */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#1E1F25]/90 backdrop-blur-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Doctor Sign-Off & Transfer Authorizations</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review AI-matched hospital donors, check travel times and reserve safety, then approve dispatch.
            </p>
          </div>
        </div>

        {/* Quick Workflow Pill Badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingCount} Waiting Sign-Off</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium">
            <Truck className="w-3.5 h-3.5" />
            <span>{inTransitCount} On The Way</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Left (Pending Requests List) | Right (Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-14rem)] min-h-[640px]">
        {/* Left Column: Requests Queue */}
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <PendingRequestsList
            selectedRequestId={activeRequest?.id}
            onSelectRequest={(req) => setSelectedRequest(req)}
          />
        </div>

        {/* Right Column: Decision Center & Donor Match */}
        <div className="lg:col-span-7 xl:col-span-8 h-full">
          {activeRequest ? (
            <RequestInspector request={activeRequest} />
          ) : (
            <div className="h-full rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1E1F25] flex flex-col items-center justify-center p-8 text-center text-slate-500 shadow-xs">
              <CheckSquare className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No Hospital Request Selected
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Click any pending emergency request from the left queue to review patient condition, donor options, and authorize delivery driver dispatch.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
