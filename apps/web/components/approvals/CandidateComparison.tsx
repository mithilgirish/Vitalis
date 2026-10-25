'use client';

import React from 'react';
import { DonorCandidate } from '../../lib/types';
import {
  Building2,
  CheckCircle2,
  Clock,
  Boxes,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface CandidateComparisonProps {
  candidates: DonorCandidate[];
  selectedCandidateId: string;
  onSelectCandidate: (candidateId: string) => void;
}

export function CandidateComparison({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
}: CandidateComparisonProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Select Donor Facility</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Compare nearby hospitals holding matching unexpired units
          </p>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          Click card to switch donor
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {candidates.map((c) => {
          const isSelected = selectedCandidateId === c.id;
          const isRank1 = c.rank === 1;

          return (
            <div
              key={c.id}
              onClick={() => onSelectCandidate(c.id)}
              className={`relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'border-emerald-500/80 bg-emerald-500/[0.06] ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-black/[0.06] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              {/* Top Row: Recommendation Badge & Selection Indicator */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isRank1
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border-black/[0.06] dark:border-white/[0.08]'
                  }`}
                >
                  {isRank1 ? '⭐ AI Recommended Donor' : 'Alternate Backup'}
                </span>

                {isSelected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    Select
                  </span>
                )}
              </div>

              {/* Hospital Name & Location */}
              <div className="mt-2.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{c.facilityName}</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {c.area} • {c.distanceKm} km away
                </p>
              </div>

              {/* Key Metrics: Transit, Stock, Safety */}
              <div className="mt-3.5 grid grid-cols-3 gap-2 pt-3 border-t border-black/[0.05] dark:border-white/[0.06] text-center">
                <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                  <span className="text-[10px] uppercase text-slate-400 font-medium block">
                    Travel Time
                  </span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {c.transitMinutes} mins
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                  <span className="text-[10px] uppercase text-slate-400 font-medium block">
                    Their Stock
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                    <Boxes className="w-3 h-3 text-slate-400" />
                    {c.availableUnits} Units
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                  <span className="text-[10px] uppercase text-slate-400 font-medium block">
                    Donor Safe?
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    Safe ({((1 - c.stockoutRisk72h) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
