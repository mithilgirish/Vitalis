'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck, Zap, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { BiologicalResourceType } from '../../lib/types';
import { getHospitalAnalyticsInsight } from '../../lib/services/analyticsService';

interface AnalyticsSummaryCardsProps {
  selectedFacility: string;
  selectedResource: BiologicalResourceType;
}

export function AnalyticsSummaryCards({
  selectedFacility,
  selectedResource,
}: AnalyticsSummaryCardsProps) {
  const { hospitals } = useVitalis();
  const insight = getHospitalAnalyticsInsight(selectedFacility, selectedResource, hospitals);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Summary Card 1: Hospital Projected Demand Surge / Deficit */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-200 ${
          insight.card1.isAlert
            ? 'border-rose-200 dark:border-rose-500/30 bg-rose-500/[0.03] dark:bg-rose-500/[0.05]'
            : 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05]'
        } bg-white dark:bg-[#222329] shadow-xs`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5 ${
              insight.card1.isAlert ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {insight.card1.isAlert ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
            {insight.card1.title}
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
              insight.card1.isAlert
                ? 'text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/30'
                : 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
            }`}
          >
            {insight.card1.badge}
          </span>
        </div>

        <div className="mt-3">
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{insight.card1.main}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {insight.card1.text}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span>{insight.facility.shortName}</span>
          </span>
          <span className="font-mono text-slate-400">
            {insight.targetHospital?.currentStockUnits || 42} units on hand
          </span>
        </div>
      </div>

      {/* Summary Card 2: Proactive Rebalance Advisory */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-200 ${
          insight.card2.isActionNeeded
            ? 'border-amber-200 dark:border-amber-500/30 bg-amber-500/[0.03] dark:bg-amber-500/[0.05]'
            : 'border-blue-200 dark:border-blue-500/30 bg-blue-500/[0.03] dark:bg-blue-500/[0.05]'
        } bg-white dark:bg-[#222329] shadow-xs`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5 ${
              insight.card2.isActionNeeded ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            {insight.card2.title}
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
              insight.card2.isActionNeeded
                ? 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/30'
                : 'text-blue-700 dark:text-blue-300 bg-blue-500/10 border-blue-500/30'
            }`}
          >
            {insight.card2.badge}
          </span>
        </div>

        <div className="mt-3">
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>{insight.card2.main}</span>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {insight.card2.text}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
            Route Viability: Safe
          </span>
          <span className="font-mono text-slate-400">
            Partner: {insight.partnerHospital?.shortName || 'RBTC'}
          </span>
        </div>
      </div>

      {/* Summary Card 3: Clinical Forecast Reliability & Model Status */}
      <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04] bg-white dark:bg-[#222329] shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            {insight.card3.title}
          </span>
          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
            {insight.card3.badge}
          </span>
        </div>

        <div className="mt-3">
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
            {insight.card3.main}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {insight.card3.text}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            Prophet + XGBoost Active
          </span>
          <span className="font-mono text-slate-400">
            72h Depletion Horizon
          </span>
        </div>
      </div>
    </div>
  );
}
