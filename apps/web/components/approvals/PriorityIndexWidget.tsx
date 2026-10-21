'use client';

import React from 'react';
import { DonorCandidate } from '../../lib/types';
import {
  Calculator,
  ShieldCheck,
  Navigation,
  Clock,
  Award,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface PriorityIndexWidgetProps {
  candidate: DonorCandidate;
}

export function PriorityIndexWidget({ candidate }: PriorityIndexWidgetProps) {
  const isRiskSafe = candidate.stockoutRisk72h < 0.4;
  const riskPercent = (candidate.stockoutRisk72h * 100).toFixed(1);

  return (
    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] p-4 space-y-3.5 shadow-2xs">
      {/* Widget Header & Mathematical Formula */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-black/[0.05] dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#0071E3] dark:text-[#0A84FF]" />
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Mathematical Priority Index ($PI$) Sub-Metric Decomposition
          </h4>
        </div>
        <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400 bg-black/[0.03] dark:bg-white/[0.04] px-2.5 py-1 rounded-full border border-black/[0.05] dark:border-white/[0.08] shadow-2xs">
          {"PI = w₁ · Viability(t) + w₂ · (1 - StockoutRisk₇₂ₕ) + w₃ · HVBP - w₄ · Distance"}
        </div>
      </div>

      {/* Primary Visual Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Badge 1: Priority Score */}
        <div className="p-3.5 rounded-2xl border border-[#0071E3]/20 bg-[#0071E3]/[0.05] dark:bg-[#0A84FF]/[0.08] shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0071E3] dark:text-[#0A84FF] block font-semibold">
            Priority Score
          </span>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {candidate.priorityScore.toFixed(3)}
            </span>
            <span className="text-[10px] text-[#0071E3] dark:text-[#0A84FF] font-medium">/ 5.000</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Ranked Top Trajectory</p>
        </div>

        {/* Badge 2: Distance & Transit */}
        <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#161820] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Distance & Transit
            </span>
            <Navigation className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {candidate.distanceKm} km
            </span>
            <span className="text-xs text-[#0071E3] dark:text-[#0A84FF] font-semibold">
              ({candidate.transitMinutes} mins)
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Via Dedicated Green Corridor</p>
        </div>

        {/* Badge 3: XGBoost 72h Stockout Risk (with Guardrail Progress Bar) */}
        <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08] shadow-2xs sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-semibold">
              XGBoost 72h Risk
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {riskPercent}%
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              (Limit &lt; 40%)
            </span>
          </div>

          {/* Guardrail Visual Progress Bar */}
          <div className="mt-2 space-y-1">
            <div className="w-full h-1.5 bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all"
                style={{ width: `${Math.min(candidate.stockoutRisk72h * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>0%</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">40% Guardrail</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Badge 4: Medicare HVBP/HAC Quality Score */}
        <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#161820] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              HVBP / HAC Quality
            </span>
            <Award className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {candidate.hvbpQualityScore.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400">/ 100</span>
          </div>
          <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Zero quality penalty applied
          </p>
        </div>
      </div>
    </div>
  );
}
