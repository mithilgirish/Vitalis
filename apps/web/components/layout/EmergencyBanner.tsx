'use client';

import React, { useState } from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { AlertTriangle, ShieldAlert, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Activity } from 'lucide-react';

export function EmergencyBanner() {
  const { telemetry, resolveExcursion, setSelectedCourier } = useVitalis();
  const [isExpanded, setIsExpanded] = useState(false);

  // Find any active cold-chain excursion
  const excursion = telemetry.find((t) => t.excursionFlag);

  if (!excursion) {
    return null;
  }

  return (
    <aside
      aria-label="Critical Cold-Chain Excursion Alert"
      className="sticky top-0 z-50 w-full border-b border-rose-500/40 bg-rose-950/90 backdrop-blur-md text-rose-50 shadow-[0_4px_30px_rgba(225,29,72,0.35)] transition-all"
    >
      <div className="max-w-[1920px] mx-auto px-4 py-2.5 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Alert Icon + Message */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="absolute inline-flex h-8 w-8 rounded-full bg-rose-500 opacity-75 animate-ping" />
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-rose-600 text-white font-bold shadow-md shadow-rose-950">
              <ShieldAlert className="w-5 h-5 text-rose-100" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-400/40 text-[11px]">
                CRITICAL COLD-CHAIN EXCURSION
              </span>
              <span className="font-mono text-rose-200 font-medium">
                Transfer #{excursion.transferId}
              </span>
            </div>

            <p className="text-rose-100/90 font-medium">
              Payload temperature at{' '}
              <span className="font-mono font-bold text-rose-200 underline decoration-rose-400">
                {excursion.currentTemperatureC.toFixed(1)}°C
              </span>{' '}
              (Threshold: ≤ {excursion.tempThresholdMaxC.toFixed(1)}°C) —{' '}
              <span className="text-rose-200 font-semibold">
                Rerouting or Intervention Required
              </span>
            </p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 shrink-0 pl-11 md:pl-0">
          <button
            onClick={() => {
              setSelectedCourier(excursion);
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/50 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-rose-300" />
            <span>Telemetry</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => resolveExcursion(excursion.transferId)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all hover:shadow-[0_0_15px_rgba(225,29,72,0.6)] cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>Engage PCM Stabilization</span>
          </button>
        </div>
      </div>

      {/* Expanded Telemetry Drawer */}
      {isExpanded && (
        <div className="border-t border-rose-800/60 bg-slate-950/95 px-4 py-3 sm:px-6 text-xs text-slate-300 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-2.5 rounded border border-slate-800 bg-slate-900/80">
              <span className="text-[10px] uppercase font-mono text-slate-400">Courier Vehicle</span>
              <p className="font-medium text-slate-100 mt-0.5">{excursion.courierName} ({excursion.courierId})</p>
              <p className="text-[11px] text-slate-400 mt-1">Speed: {excursion.velocityKmH} km/h • ETA: {excursion.etaMinutes} mins</p>
            </div>

            <div className="p-2.5 rounded border border-slate-800 bg-slate-900/80">
              <span className="text-[10px] uppercase font-mono text-slate-400">Corridor Route</span>
              <p className="font-medium text-slate-100 mt-0.5">
                {excursion.originFacilityName} → {excursion.destinationFacilityName}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Route Progress: {excursion.progressPercent}% completed</p>
            </div>

            <div className="p-2.5 rounded border border-slate-800 bg-slate-900/80">
              <span className="text-[10px] uppercase font-mono text-slate-400">Biological Cargo</span>
              <p className="font-medium text-rose-300 mt-0.5">
                {excursion.units} Units {excursion.bloodGroup} {excursion.resource}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Cold Chain Limit: 1.0°C – 6.0°C</p>
            </div>

            <div className="p-2.5 rounded border border-rose-900/60 bg-rose-950/40">
              <span className="text-[10px] uppercase font-mono text-rose-300">Telemetry History</span>
              <div className="flex items-center gap-2 mt-1 font-mono text-[11px]">
                {excursion.routeHistory.map((h, i) => (
                  <span
                    key={i}
                    className={`px-1.5 py-0.5 rounded ${
                      h.tempC > excursion.tempThresholdMaxC
                        ? 'bg-rose-500/30 text-rose-300 font-bold'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {h.time}: {h.tempC}°C
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
