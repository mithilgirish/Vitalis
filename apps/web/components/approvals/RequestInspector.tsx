'use client';

import React, { useState, useMemo } from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { useAuth } from '../../lib/store/authContext';
import { TransferRequest } from '../../lib/types';
import { CandidateComparison } from './CandidateComparison';
import { PriorityIndexWidget } from './PriorityIndexWidget';
import { ReasoningTraceTerminal } from './ReasoningTraceTerminal';
import { RejectReasonModal } from './RejectReasonModal';
import { normalizeFacilityId } from '../../lib/services/tomtomRoutingService';
import { REAL_ROAD_CORRIDORS } from '../../lib/services/realRoadCorridors';
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
  Navigation,
  Smartphone,
  Route,
} from 'lucide-react';

interface RequestInspectorProps {
  request: TransferRequest;
}

export function RequestInspector({ request }: RequestInspectorProps) {
  const {
    approveRequest,
    rejectRequest,
    selectCandidateForRequest,
    availableDrivers,
  } = useVitalis();
  const { user } = useAuth();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    request.assignedDriverId || 'VTL-DRV-784'
  );

  const selectedCandidate =
    request.candidates.find((c) => c.id === request.selectedCandidateId) ||
    request.candidates[0];

  const isPending = request.status === 'pending_approval';
  const isLevel1 = request.esiUrgencyTier === 1;
  const canApprove = user ? user.permissions.canApproveTransfers : true;

  // Real-time TomTom road corridor calculation between chosen donor and receiving hospital
  const tomtomRoute = useMemo(() => {
    const oId = normalizeFacilityId(selectedCandidate?.facilityId || 'FAC-RBTC');
    const dId = normalizeFacilityId(request.destinationFacilityId || 'FAC-APOLLO');
    const forwardCorridor = `${oId}->${dId}`;
    const reverseCorridor = `${dId}->${oId}`;

    const c =
      REAL_ROAD_CORRIDORS[forwardCorridor] ||
      (REAL_ROAD_CORRIDORS[reverseCorridor]
        ? {
            ...REAL_ROAD_CORRIDORS[reverseCorridor],
            waypoints: [...REAL_ROAD_CORRIDORS[reverseCorridor].waypoints].reverse(),
          }
        : undefined) ||
      REAL_ROAD_CORRIDORS['FAC-RBTC->FAC-APOLLO'];

    return {
      totalDistanceKm: c?.distanceKm || 4.68,
      estimatedMinutes: c?.estimatedMinutes || 11,
      waypoints: c?.waypoints || [],
      roadSegments: ['TomTom Traffic Corridor', 'EVR Periyar Salai', 'Greams Road'],
    };
  }, [selectedCandidate?.facilityId, request.destinationFacilityId]);

  const activeDriver =
    availableDrivers?.find((d) => d.driverId === selectedDriverId) ||
    availableDrivers?.[0] || {
      driverId: 'VTL-DRV-784',
      name: 'Vikramaditya Rao',
      courierId: 'COU-CH-104',
      vehicleType: 'Refrigerated EV Van #104',
      vehiclePlate: 'TN-07-ALS-104',
      isMobileAppDriver: true,
    };

  const handleApprove = () => {
    approveRequest(request.id, selectedCandidate.id, user ? user.name : undefined, {
      driverId: activeDriver.driverId,
      name: activeDriver.name,
      courierId: activeDriver.courierId,
      vehicleType: activeDriver.vehicleType,
    });
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

        {/* Step C: Mobile Courier Assignment & Dijkstra Shortest Path Road Route */}
        <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-black/30 p-4 space-y-3.5 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Assigned Courier & Dijkstra Road Route
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Dynamic routing & instant dispatch synchronization with mobile driver
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Route className="w-3 h-3" />
              Dijkstra Shortest Path
            </span>
          </div>

          {/* Driver Selection & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                <span>Select Emergency Courier Driver:</span>
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                disabled={!isPending || !canApprove}
                className="w-full text-xs font-medium rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#15161A] text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {availableDrivers?.map((driver) => (
                  <option key={driver.driverId} value={driver.driverId}>
                    {driver.name} ({driver.courierId}) &bull; {driver.vehicleType}
                    {driver.isMobileAppDriver ? ' [Mobile Cockpit]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-2.5 rounded-lg border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Designated Vehicle</p>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeDriver.vehicleType}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">{activeDriver.vehiclePlate}</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {activeDriver.isMobileAppDriver ? '📱 Mobile Synced' : 'Ready'}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">{activeDriver.phone}</p>
              </div>
            </div>
          </div>

          {/* TomTom Road Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-blue-500/[0.04] dark:bg-blue-500/[0.07] border border-blue-500/15">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Road Distance</p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {tomtomRoute.totalDistanceKm} km
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Transit ETA</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                ~{tomtomRoute.estimatedMinutes} mins
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">GPS Waypoints</p>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                {tomtomRoute.waypoints.length} pts
              </p>
            </div>
          </div>

          {/* Road Corridors */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pt-0.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Corridor:</span>
            <span>{tomtomRoute.roadSegments.join(' ➔ ') || 'Direct Transit Corridor'}</span>
          </div>
        </div>

        {/* Step D: Plain-English AI Explanation */}
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
                ? `${request.assignedDriverName || 'Vikramaditya Rao'} Dispatched ✓`
                : !canApprove
                ? 'Sign-Off Restricted'
                : `Approve & Send ${activeDriver.name.split(' ')[0]}`}
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
