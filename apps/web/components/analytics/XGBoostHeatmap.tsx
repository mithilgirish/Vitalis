'use client';

import React, { useState } from 'react';
import {
  BLOOD_GROUPS_LIST,
  XGBOOST_HEATMAP_DATA,
} from '../../lib/data/mockData';
import { XGBoostRiskCell, BloodGroup } from '../../lib/types';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Sparkles, X } from 'lucide-react';

export function XGBoostHeatmap() {
  const [selectedCell, setSelectedCell] = useState<XGBoostRiskCell | null>(
    XGBOOST_HEATMAP_DATA[7] // Default selected: Apollo O- (68% risk)
  );

  const facilities = Array.from(
    new Set(XGBOOST_HEATMAP_DATA.map((d) => d.facilityName))
  );

  const getCellStyling = (prob: number) => {
    if (prob >= 0.4) {
      return {
        bg: 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-500/25 dark:hover:bg-rose-500/40 dark:border-rose-500/50 dark:text-rose-300 font-bold',
        pill: 'bg-rose-600 text-white',
        status: 'CRITICAL',
      };
    }
    if (prob >= 0.2) {
      return {
        bg: 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-500/20 dark:hover:bg-amber-500/35 dark:border-amber-500/40 dark:text-amber-300 font-semibold',
        pill: 'bg-amber-500 text-slate-950',
        status: 'WARNING',
      };
    }
    return {
      bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/25 dark:border-emerald-500/20 dark:text-emerald-400 font-medium',
      pill: 'bg-emerald-600 text-white',
      status: 'SAFE',
    };
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#2D3748] bg-white dark:bg-[#1A202C] p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              XGBoost 72-Hour Stockout Probability Risk Matrix
            </h3>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-medium">
              Guardrail: ≥ 40% Flagged
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Trained on 100k+ clinical episodes. Click any facility-blood group cell to inspect local SHAP explainability weights.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40" />
            <span className="text-slate-600 dark:text-slate-400">&lt; 20% Safe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-amber-50 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40" />
            <span className="text-slate-600 dark:text-slate-400">20–39% Caution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-rose-50 dark:bg-rose-500/30 border border-rose-300 dark:border-rose-500/60" />
            <span className="text-rose-600 dark:text-rose-400 font-bold">≥ 40% Breach</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Table */}
      <div className="overflow-x-auto pb-2">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr>
              <th className="p-2.5 text-left text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 min-w-[200px] font-semibold">
                Hospital Facility
              </th>
              {BLOOD_GROUPS_LIST.map((bg) => (
                <th
                  key={bg}
                  className="p-2.5 text-center text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 min-w-[70px]"
                >
                  {bg}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {facilities.map((facName) => (
              <tr key={facName} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                <td className="p-2.5 text-slate-900 dark:text-slate-200 font-sans font-medium text-xs whitespace-nowrap">
                  {facName}
                </td>
                {BLOOD_GROUPS_LIST.map((bg) => {
                  const cellData = XGBOOST_HEATMAP_DATA.find(
                    (d) => d.facilityName === facName && d.bloodGroup === bg
                  );

                  if (!cellData) {
                    return (
                      <td key={bg} className="p-2 text-center text-slate-400">
                        —
                      </td>
                    );
                  }

                  const { bg: cellBg, status } = getCellStyling(cellData.riskProbability);
                  const isSelected =
                    selectedCell?.facilityName === facName && selectedCell?.bloodGroup === bg;

                  return (
                    <td key={bg} className="p-1.5 text-center">
                      <button
                        onClick={() => setSelectedCell(cellData)}
                        className={`w-full py-2 px-1 rounded-xl border text-center transition-all cursor-pointer shadow-2xs ${cellBg} ${
                          isSelected ? 'ring-2 ring-slate-900 dark:ring-white shadow-md' : ''
                        }`}
                        title={`${facName} (${bg}): ${(cellData.riskProbability * 100).toFixed(0)}% risk`}
                      >
                        <div className="text-xs">
                          {(cellData.riskProbability * 100).toFixed(0)}%
                        </div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {cellData.currentStock}u
                        </div>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SHAP Feature Contribution Inspector Box */}
      {selectedCell && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  SHAP Explainability Tree Inspector — {selectedCell.facilityName} ({selectedCell.bloodGroup})
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Current Stock: {selectedCell.currentStock} units • Baseline Demand: {selectedCell.baselineDemand} units / 72h
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-xs px-2.5 py-1 rounded-lg font-bold ${
                  selectedCell.riskProbability >= 0.4
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                }`}
              >
                72h Depletion Probability: {(selectedCell.riskProbability * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* SHAP Value Impact Bars */}
          <div className="mt-3 space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-semibold">
              Feature Weight Contributions to Depletion Risk:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedCell.shapValues.map((sv, idx) => {
                const isPositive = sv.impact > 0;
                return (
                  <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-mono shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-800 dark:text-slate-300 font-sans">{sv.feature}</span>
                      <span
                        className={`font-bold ${
                          isPositive ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isPositive ? `+${sv.impact}% Risk` : `${sv.impact}% Protective`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden flex">
                      <div
                        className={`h-full ${isPositive ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.abs(sv.impact)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
