'use client';

import React, { useState } from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { BiologicalResourceType } from '../../lib/types';
import { ProphetForecastChart } from '../../components/analytics/ProphetForecastChart';
import { XGBoostHeatmap } from '../../components/analytics/XGBoostHeatmap';
import { AnalyticsSummaryCards } from '../../components/analytics/AnalyticsSummaryCards';
import { Filter, Calendar, Building2, Shield, Thermometer, Boxes, BedDouble } from 'lucide-react';
import { FACILITY_PROFILES } from '../../lib/services/analyticsService';

export default function AnalyticsPage() {
  const { hospitals } = useVitalis();

  const [selectedFacility, setSelectedFacility] = useState<string>('FAC-APOLLO');
  const [selectedResource, setSelectedResource] = useState<BiologicalResourceType>('PRBC');
  const [timeHorizon, setTimeHorizon] = useState<'7d' | '14d'>('7d');

  const resourceTypes: BiologicalResourceType[] = [
    'PRBC',
    'Whole Blood',
    'Platelets',
    'FFP',
    'Cryoprecipitate',
    'Kidney',
    'Liver',
    'Heart',
  ];

  const currentHospital = hospitals.find((h) => h.id === selectedFacility) || hospitals[0];
  const profile = FACILITY_PROFILES[selectedFacility] || FACILITY_PROFILES['FAC-APOLLO'];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar: Facility & Resource Selector */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#222329] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Facility Selector */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-white/[0.08] bg-slate-50 dark:bg-[#18191E] px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:border-rose-500 focus:outline-none shadow-xs cursor-pointer font-medium"
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
              className="rounded-xl border border-slate-300 dark:border-white/[0.08] bg-slate-50 dark:bg-[#18191E] px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:border-rose-500 focus:outline-none shadow-xs cursor-pointer font-medium"
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
        <div className="flex items-center gap-1.5 self-end md:self-auto bg-slate-100 dark:bg-[#18191E] p-1 rounded-xl border border-slate-200 dark:border-white/[0.08] text-xs font-mono">
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

      {/* Dynamic Hospital Profile Strip */}
      {currentHospital && (
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#1E1F25]/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {currentHospital.name}
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline text-[11px]">
              {profile.specialtyTag}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] flex-wrap">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Trauma Level {currentHospital.traumaLevel}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <Boxes className="w-3.5 h-3.5 text-rose-500" />
              <span>{currentHospital.currentStockUnits} Units On Hand</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <BedDouble className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentHospital.icuBedsAvailable} ICU Beds</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <Thermometer className="w-3.5 h-3.5 text-emerald-500" />
              <span>{currentHospital.coldStorageTemp}°C Cold Vault</span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Summary Advisory Cards */}
      <AnalyticsSummaryCards
        selectedFacility={selectedFacility}
        selectedResource={selectedResource}
      />

      {/* Dynamic Meta Prophet Time-Series Forecast Chart */}
      <ProphetForecastChart
        selectedFacility={selectedFacility}
        selectedResource={selectedResource}
        horizon={timeHorizon}
      />

      {/* Complete Interactive XGBoost Depletion Risk Heatmap Matrix */}
      <XGBoostHeatmap
        selectedFacility={selectedFacility}
        onSelectFacility={setSelectedFacility}
        selectedResource={selectedResource}
      />
    </div>
  );
}
