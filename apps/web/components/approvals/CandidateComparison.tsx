'use client';

import React from 'react';
import { DonorCandidate } from '../../lib/types';
import { Building2, CheckCircle2 } from 'lucide-react';

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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold">
          Ranked Donor Hospital Candidates (PostGIS Isochrone Match)
        </label>
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
          Click to inspect alternate candidate
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
              className={`relative p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 shadow-2xs ${
                isSelected
                  ? 'border-[#0071E3] dark:border-[#0A84FF] bg-[#0071E3]/[0.05] dark:bg-[#0A84FF]/[0.08] ring-1 ring-[#0071E3]/30 dark:ring-[#0A84FF]/30 shadow-sm'
                  : 'border-black/[0.05] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:border-black/[0.1] dark:hover:border-white/[0.1]'
              }`}
            >
              {/* Top Row: Rank Tag + Priority Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                      isRank1
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-black/[0.06] dark:border-white/[0.08]'
                    }`}
                  >
                    Rank {c.rank} {isRank1 ? '• Recommended' : '• Alternate'}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-[#0071E3] dark:text-[#0A84FF] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-slate-400 text-[10px]">PI Score:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 bg-black/[0.03] dark:bg-white/[0.06] px-1.5 py-0.5 rounded-md border border-black/[0.05] dark:border-white/[0.08]">
                    {c.priorityScore.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Candidate Facility Name & Location */}
              <div className="mt-2.5">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{c.facilityName}</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-5">{c.area}</p>
              </div>

              {/* Sub-Metrics Grid */}
              <div className="mt-3 grid grid-cols-3 gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.05] font-mono text-[11px]">
                <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.07] text-center">
                  <span className="text-[9px] uppercase text-slate-400 block font-medium">Available</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{c.availableUnits} Units</span>
                </div>
                <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.07] text-center">
                  <span className="text-[9px] uppercase text-slate-400 block font-medium">Transit</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{c.transitMinutes} mins</span>
                </div>
                <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.07] text-center">
                  <span className="text-[9px] uppercase text-slate-400 block font-medium">72h Risk</span>
                  <span
                    className={`font-bold ${
                      c.stockoutRisk72h < 0.4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {(c.stockoutRisk72h * 100).toFixed(1)}%
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
