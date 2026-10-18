'use client';

import React, { useState } from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { TransferRequest } from '../../lib/types';
import { CandidateComparison } from './CandidateComparison';
import { PriorityIndexWidget } from './PriorityIndexWidget';
import { ReasoningTraceTerminal } from './ReasoningTraceTerminal';
import { RejectReasonModal } from './RejectReasonModal';
import { formatUrgencyTier } from '../../lib/utils';
import {
  CheckCircle2,
  XCircle,
  Truck,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface RequestInspectorProps {
  request: TransferRequest;
}

export function RequestInspector({ request }: RequestInspectorProps) {
  const {
    approveRequest,
    rejectRequest,
    selectCandidateForRequest,
  } = useVitalis();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const selectedCandidate =
    request.candidates.find((c) => c.id === request.selectedCandidateId) ||
    request.candidates[0];

  const { color, badgeBg } = formatUrgencyTier(request.esiUrgencyTier);
  const isPending = request.status === 'pending_approval';

  const handleApprove = () => {
    approveRequest(request.id, selectedCandidate.id);
  };

  const handleRejectConfirm = (reason: string) => {
    rejectRequest(request.id, reason);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-[#2D3748] bg-white dark:bg-[#1A202C] overflow-hidden shadow-xs">
      {/* Inspector Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shrink-0 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeBg} ${color}`}
            >
              {request.urgencyLabel}
            </span>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              Transfer UUID: {request.id}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-500 dark:text-slate-400">Status:</span>
            <span
              className={`px-2 py-0.5 rounded-md font-semibold ${
                isPending
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : request.status === 'in_transit'
                  ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
              }`}
            >
              {request.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Clinical Case Title & Destination Facility */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {request.destinationFacilityName}
            </h2>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-0.5">
              {request.clinicalIndication}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono shadow-xs">
            <div className="text-center px-2">
              <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block">Required Units</span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                {request.unitsRequested}x {request.bloodGroup} {request.resourceType}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block">Viability Limit</span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 justify-center">
                <Clock className="w-3 h-3" />
                {request.viabilityWindowMinutes} mins
              </span>
            </div>
          </div>
        </div>

        {/* Attending Physician */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>Ordering Physician: </span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">{request.requestingPhysician}</span>
        </div>
      </div>

      {/* Scrollable Body: Candidates, Breakdown, Trace */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Ranked Candidate Comparison */}
        <CandidateComparison
          candidates={request.candidates}
          selectedCandidateId={selectedCandidate.id}
          onSelectCandidate={(cid) => selectCandidateForRequest(request.id, cid)}
        />

        {/* Mathematical Priority Index ($PI$) Decomposition Widget */}
        <PriorityIndexWidget candidate={selectedCandidate} />

        {/* Explainable AI Reasoning Trace Box */}
        <ReasoningTraceTerminal trace={request.reactTrace} />
      </div>

      {/* HITL Action Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12161F] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>HITL Zero Autonomous Dispatch Policy Active</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Reject & Recalculate Button */}
          <button
            onClick={() => setIsRejectModalOpen(true)}
            disabled={!isPending}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          >
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Reject & Recalculate</span>
          </button>

          {/* Approve & Broadcast to Courier Button */}
          <button
            onClick={handleApprove}
            disabled={!isPending}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Approve & Broadcast to Courier</span>
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      <RejectReasonModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        requestId={request.id}
      />
    </div>
  );
}
