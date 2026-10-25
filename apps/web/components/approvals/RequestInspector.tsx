'use client';

import React, { useState } from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { useAuth } from '../../lib/store/authContext';
import { TransferRequest } from '../../lib/types';
import { CandidateComparison } from './CandidateComparison';
import { PriorityIndexWidget } from './PriorityIndexWidget';
import { ReasoningTraceTerminal } from './ReasoningTraceTerminal';
import { RejectReasonModal } from './RejectReasonModal';
import {
  XCircle,
  Truck,
  Clock,
  User,
  ShieldCheck,
  Building2,
  ArrowRight,
  Droplet,
  Lock,
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
  const { user } = useAuth();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const selectedCandidate =
    request.candidates.find((c) => c.id === request.selectedCandidateId) ||
    request.candidates[0];

  const isPending = request.status === 'pending_approval';
  const isLevel1 = request.esiUrgencyTier === 1;
  const canApprove = user ? user.permissions.canApproveTransfers : true;

  const handleApprove = () => {
    approveRequest(request.id, selectedCandidate.id, user ? user.name : undefined);
  };

  const handleRejectConfirm = (reason: string) => {
    rejectRequest(request.id, reason);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#1C1D22]/90 backdrop-blur-xl overflow-hidden shadow-sm">
      {/* 1. Header: The Hospital Need (Who needs what?) */}
      <div className="p-5 border-b border-black/[0.05] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02] shrink-0 space-y-4">
        {/* Top Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isLevel1
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
              }`}
            >
              {isLevel1 ? 'Critical Emergency (Level 1)' : 'Urgent Need (Level 2)'}
            </span>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Order ID: #{request.id.slice(-8).toUpperCase()}
            </span>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isPending
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                : request.status === 'in_transit'
                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isPending ? '⏳ Awaiting Doctor Sign-Off' : request.status === 'in_transit' ? '🚚 Driver On The Way' : 'Delivered'}
          </span>
        </div>

        {/* Hospital Need Details */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-rose-500 shrink-0" />
              <span>Receiving: {request.destinationFacilityName}</span>
            </h2>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-0.5">
              Condition: {request.clinicalIndication}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Attending Physician: {request.requestingPhysician}</span>
            </p>
          </div>

          {/* Cargo & Viability Card */}
          <div className="flex items-center gap-4 p-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#23242B] shadow-xs">
            <div className="text-left">
              <span className="text-[10px] uppercase text-slate-400 font-medium block">
                Required Units
              </span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <Droplet className="w-4 h-4 fill-current" />
                {request.unitsRequested}x {request.bloodGroup} {request.resourceType}
              </span>
            </div>

            <div className="h-8 w-px bg-black/[0.08] dark:bg-white/[0.1]" />

            <div className="text-left">
              <span className="text-[10px] uppercase text-slate-400 font-medium block">
                Must Arrive In
              </span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                &le;{request.viabilityWindowMinutes} mins
              </span>
            </div>
          </div>
        </div>

        {/* Visual Route Corridor (From ➔ To) */}
        <div className="p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500 dark:text-slate-400">Donor Origin:</span>
            <strong className="text-slate-900 dark:text-white font-semibold">
              {selectedCandidate.facilityName}
            </strong>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
            <span>{selectedCandidate.distanceKm} km</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>~{selectedCandidate.transitMinutes} mins drive</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-500 dark:text-slate-400">Destination:</span>
            <strong className="text-slate-900 dark:text-white font-semibold">
              {request.destinationFacilityName}
            </strong>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Body: Donor Selection, Safety Checklist, AI Explanation */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Step A: Pick Between Recommended Donor and Alternate */}
        <CandidateComparison
          candidates={request.candidates}
          selectedCandidateId={selectedCandidate.id}
          onSelectCandidate={(cid) => selectCandidateForRequest(request.id, cid)}
        />

        {/* Step B: 4-Point Safety & Viability Checklist */}
        <PriorityIndexWidget
          candidate={selectedCandidate}
          requestedUnits={request.unitsRequested}
          viabilityMinutes={request.viabilityWindowMinutes}
        />

        {/* Step C: Plain-English AI Explanation */}
        <ReasoningTraceTerminal trace={request.reactTrace} />
      </div>

      {/* 3. Decision Footer: Doctor Approval Action */}
      <div className="p-4 border-t border-black/[0.05] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            {canApprove ? (
              <>
                Signing as <strong className="text-slate-900 dark:text-white font-semibold">{user?.name || 'Dr. Aishwarya Raman'}</strong> ({user?.roleTitle || 'Coordinator'})
              </>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                View-Only: {user?.roleTitle || 'Auditor'} role cannot authorize dispatches. Log in as Clinical Coordinator.
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Decline Button */}
          <button
            onClick={() => setIsRejectModalOpen(true)}
            disabled={!isPending || !canApprove}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15 text-rose-700 dark:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-98"
          >
            {!canApprove ? <Lock className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
            <span>Decline Transfer</span>
          </button>

          {/* Approve & Dispatch Driver Button */}
          <button
            onClick={handleApprove}
            disabled={!isPending || !canApprove}
            title={!canApprove ? 'Physician / Coordinator role required to authorize' : undefined}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white shadow-md hover:shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-sans"
          >
            {!canApprove ? <Lock className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
            <span>
              {!isPending
                ? 'Driver Dispatched ✓'
                : !canApprove
                ? 'Sign-Off Restricted'
                : 'Approve & Send Driver'}
            </span>
          </button>
        </div>
      </div>

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        requestId={request.id}
      />
    </div>
  );
}
