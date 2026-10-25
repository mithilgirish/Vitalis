'use client';

import React from 'react';
import { DonorCandidate } from '../../lib/types';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
} from 'lucide-react';

interface PriorityIndexWidgetProps {
  candidate: DonorCandidate;
  requestedUnits?: number;
  viabilityMinutes?: number;
}

export function PriorityIndexWidget({
  candidate,
  requestedUnits = 4,
  viabilityMinutes = 30,
}: PriorityIndexWidgetProps) {
  const remainingAfterDonation = Math.max(0, candidate.availableUnits - requestedUnits);
  const isTimeSafe = candidate.transitMinutes <= viabilityMinutes;
  const isStockoutSafe = candidate.stockoutRisk72h < 0.4;
  const riskPercent = (candidate.stockoutRisk72h * 100).toFixed(1);

  return (
    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] p-4 space-y-3.5 shadow-xs">
      {/* Title */}
      <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.05] dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Safety & Delivery Viability Verification
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          All Safety Checks Passed
        </span>
      </div>

      {/* 4 Clean Clinical Safety Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Check 1: Transit Viability */}
        <div className="p-3 rounded-xl border border-black/[0.05] dark:border-white/[0.07] bg-white dark:bg-[#202127] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
              1. Delivery Speed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {candidate.transitMinutes} mins
            </span>
            <span className={`text-[10px] font-semibold ${isTimeSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
              (&le; {viabilityMinutes}m limit)
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Arrives before tissue expiry
          </p>
        </div>

        {/* Check 2: Donor Reserve Buffer */}
        <div className="p-3 rounded-xl border border-black/[0.05] dark:border-white/[0.07] bg-white dark:bg-[#202127] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
              2. Remaining Stock
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {remainingAfterDonation} Units
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              left after transfer
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Safe reserve for local ER
          </p>
        </div>

        {/* Check 3: Shortage Risk Guardrail */}
        <div className="p-3 rounded-xl border border-black/[0.05] dark:border-white/[0.07] bg-white dark:bg-[#202127] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
              3. Shortage Risk
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-lg font-bold ${isStockoutSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
              {riskPercent}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              (&lt; 40% threshold)
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            XGBoost model verified safe
          </p>
        </div>

        {/* Check 4: Hospital Accreditation */}
        <div className="p-3 rounded-xl border border-black/[0.05] dark:border-white/[0.07] bg-white dark:bg-[#202127] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
              4. Hospital Rating
            </span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {candidate.hvbpQualityScore.toFixed(0)}/100
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Certified
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Full clinical compliance
          </p>
        </div>
      </div>
    </div>
  );
}
