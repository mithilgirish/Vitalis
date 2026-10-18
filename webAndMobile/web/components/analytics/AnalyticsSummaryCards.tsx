'use client';

import React from 'react';
import { AlertTriangle, TrendingDown, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';

export function AnalyticsSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Summary Card 1: Regional Deficit Warning */}
      <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-white dark:bg-[#1A202C] shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-300 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Projected Weekend Surge
          </span>
          <span className="text-[10px] font-mono text-rose-700 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded-md border border-rose-500/30 font-medium">
            +28% Demand
          </span>
        </div>
        <div className="mt-2.5">
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
            O- PRBC & AB- FFP
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Trauma intake projected to exceed regional safety buffer by 14 units across Central Chennai on Oct 23–24.
          </p>
        </div>
      </div>

      {/* Summary Card 2: Proactive Rebalance Advisory */}
      <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-[#1A202C] shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-300 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            Autonomous Rebalance Route
          </span>
          <span className="text-[10px] font-mono text-blue-700 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded-md border border-blue-500/30 font-medium">
            Optimal
          </span>
        </div>
        <div className="mt-2.5">
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
            RBTC → Fortis Malar
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pre-emptive redistribution of 6 units O- PRBC recommended prior to Friday night trauma peak to keep Fortis risk below 40%.
          </p>
        </div>
      </div>

      {/* Summary Card 3: Model Health & Accuracy */}
      <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-[#1A202C] shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Ensemble Model Precision
          </span>
          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-md border border-emerald-500/30 font-medium">
            AUROC 0.942
          </span>
        </div>
        <div className="mt-2.5">
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
            Prophet + XGBoost v2.4
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Continuous cross-validation against Tamil Nadu Transfusion Registry. Zero false-negative stockout predictions in last 30 days.
          </p>
        </div>
      </div>
    </div>
  );
}
