'use client';

import React from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import {
  Truck,
  Thermometer,
  ShieldAlert,
  CheckCircle2,
  Navigation,
  Clock,
  X,
  Zap,
  ArrowRight,
} from 'lucide-react';

export function CourierDetailModal() {
  const { selectedCourier, setSelectedCourier, resolveExcursion } = useVitalis();

  if (!selectedCourier) return null;

  const isExcursion = selectedCourier.excursionFlag;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 dark:bg-[#18191E]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#222329] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl flex items-center justify-center ${
                isExcursion
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
              }`}
            >
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {selectedCourier.courierName}
                </h3>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  #{selectedCourier.courierId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedCourier.vehicleType} • Live Emergency Transfer
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedCourier(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Courier Route Path */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400">Donor Hospital</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCourier.originFacilityName}</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">{selectedCourier.progressPercent}% En Route</span>
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${isExcursion ? 'bg-rose-500' : 'bg-blue-600 dark:bg-blue-500'}`}
                style={{ width: `${selectedCourier.progressPercent}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase text-slate-400">Receiving Hospital</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCourier.destinationFacilityName}</span>
          </div>
        </div>

        {/* Live IoT Telemetry Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 text-xs font-mono">
          <div
            className={`p-3 rounded-xl border ${
              isExcursion
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300'
                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-slate-400">Blood Temp</span>
              <Thermometer className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold mt-1">
              {selectedCourier.currentTemperatureC.toFixed(1)}°C
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Safe: ≤ {selectedCourier.tempThresholdMaxC}°C
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-slate-400">Speed</span>
              <Navigation className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="text-xl font-bold mt-1 text-slate-900 dark:text-slate-100">
              {selectedCourier.velocityKmH} km/h
            </div>
            <span className="text-[10px] text-slate-400">
              GPS Signal Verified
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-slate-400">Est. Arrival (ETA)</span>
              <Clock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
              {selectedCourier.etaMinutes} mins
            </div>
            <span className="text-[10px] text-slate-400">
              Departed: {selectedCourier.departureTime}
            </span>
          </div>
        </div>

        {/* Cargo Details */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-500 dark:text-slate-400 uppercase text-[10px]">Medical Cargo</span>
            <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
              {selectedCourier.units} Units • {selectedCourier.bloodGroup} {selectedCourier.resource}
            </span>
          </div>
        </div>

        {/* Temperature Alert Box & Action */}
        {isExcursion ? (
          <div className="mt-4 p-3.5 rounded-xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div className="text-xs text-rose-800 dark:text-rose-200">
                <span className="font-bold">Temperature Exceeds Threshold!</span>
                <p className="text-[11px] text-rose-600 dark:text-rose-300">
                  Temperature exceeds 6.0°C limit. Deploy emergency secondary cooling pack.
                </p>
              </div>
            </div>
            <button
              onClick={() => resolveExcursion(selectedCourier.transferId)}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shrink-0 shadow-md cursor-pointer transition-all"
            >
              Activate Cooling
            </button>
          </div>
        ) : (
          <div className="mt-4 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Temperature is safe within clinical preservation limits (1.0°C – 6.0°C).</span>
          </div>
        )}
      </div>
    </div>
  );
}
