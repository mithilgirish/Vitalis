'use client';

import React, { useState } from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { BiologicalResourceType } from '../../lib/types';
import { ProphetForecastChart } from '../../components/analytics/ProphetForecastChart';
import { XGBoostHeatmap } from '../../components/analytics/XGBoostHeatmap';
import { AnalyticsSummaryCards } from '../../components/analytics/AnalyticsSummaryCards';
import { TrendingUp, Filter, Sparkles, Calendar, Building2 } from 'lucide-react';

export default function AnalyticsPage() {
  const { hospitals } = useVitalis();

  const [selectedFacility, setSelectedFacility] = useState<string>('FAC-APOLLO');
  const [selectedResource, setSelectedResource] = useState<BiologicalResourceType>('PRBC');
  const [timeHorizon, setTimeHorizon] = useState<'7d' | '14d'>('7d');

  const resourceTypes: BiologicalResourceType[] = [
    'Whole Blood',
    'PRBC',
    'Platelets',
    'FFP',
    'Cryoprecipitate',
    'Kidney',
    'Liver',
    'Heart',
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar: Facility & Resource Selector */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#2D3748] bg-white dark:bg-[#1A202C] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Facility Selector */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:border-rose-500 focus:outline-none shadow-xs"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Biological Resource Selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value as BiologicalResourceType)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:border-rose-500 focus:outline-none shadow-xs"
            >
              {resourceTypes.map((res) => (
                <option key={res} value={res}>
                  {res}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Horizon Selector (7-Day vs 14-Day Forecast) */}
        <div className="flex items-center gap-1.5 self-end md:self-auto bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <button
            onClick={() => setTimeHorizon('7d')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              timeHorizon === '7d'
                ? 'bg-rose-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            7-Day Forecast
          </button>
          <button
            onClick={() => setTimeHorizon('14d')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              timeHorizon === '14d'
                ? 'bg-rose-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            14-Day Forecast
          </button>
        </div>
      </div>

      {/* Summary Advisory Cards */}
      <AnalyticsSummaryCards />

      {/* Meta Prophet Time-Series Forecast Chart */}
      <ProphetForecastChart
        selectedFacility={selectedFacility}
        selectedResource={selectedResource}
        horizon={timeHorizon}
      />

      {/* XGBoost Depletion Risk Heatmap Matrix */}
      <XGBoostHeatmap />
    </div>
  );
}
