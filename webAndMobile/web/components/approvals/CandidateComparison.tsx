'use client';

import React from 'react';
import { DonorCandidate } from '../../lib/types';
import { Building2, CheckCircle2, ShieldAlert, Award, Clock, Navigation } from 'lucide-react';

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
              className={`relative p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 shadow-xs ${
                isSelected
                  ? 'border-blue-400 dark:border-blue-500/70 bg-blue-50/60 dark:bg-blue-950/20 ring-1 ring-blue-400 dark:ring-blue-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Top Row: Rank Tag + Priority Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                      isRank1
                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    Rank {c.rank} {isRank1 ? '• Recommended' : '• Alternate'}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-slate-400 text-[10px]">PI Score:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
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
              <div className="mt-3 grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 font-mono text-[11px]">
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[9px] uppercase text-slate-400 block">Available</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{c.availableUnits} Units</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[9px] uppercase text-slate-400 block">Transit</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{c.transitMinutes} mins</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[9px] uppercase text-slate-400 block">72h Risk</span>
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
