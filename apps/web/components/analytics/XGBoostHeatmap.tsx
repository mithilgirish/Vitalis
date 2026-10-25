'use client';

import React, { useState, useMemo } from 'react';
import {
  BLOOD_GROUPS_LIST,
} from '../../lib/data/mockData';
import { XGBoostRiskCell, BiologicalResourceType } from '../../lib/types';
import { ShieldAlert, Sparkles, Building2, Zap } from 'lucide-react';
import { buildCompleteHeatmapData } from '../../lib/services/analyticsService';
import { useVitalis } from '../../lib/store/vitalisContext';

interface XGBoostHeatmapProps {
  selectedFacility?: string;
  onSelectFacility?: (facilityId: string) => void;
  selectedResource?: BiologicalResourceType;
}

export function XGBoostHeatmap({
  selectedFacility,
  onSelectFacility,
  selectedResource = 'PRBC',
}: XGBoostHeatmapProps) {
  const { hospitals } = useVitalis();
  const [surgeStressTest, setSurgeStressTest] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'selected'>('all');

  // Build the complete 8-hospital x 8-blood group matrix
  const baseHeatmapData = useMemo(() => buildCompleteHeatmapData(), []);

  // Compute live heatmap data, adjusting for simulated emergency trauma stress test
  const heatmapData = useMemo(() => {
    if (!surgeStressTest) return baseHeatmapData;
    return baseHeatmapData.map((cell) => {
      const surgeMultiplier = 1.35;
      const boostedRisk = Math.min(0.96, cell.riskProbability * surgeMultiplier);
      const reducedStock = Math.max(0, Math.round(cell.currentStock * 0.75));
      const boostedDemand = Math.round(cell.baselineDemand * 1.3);

      return {
        ...cell,
        riskProbability: parseFloat(boostedRisk.toFixed(2)),
        currentStock: reducedStock,
        baselineDemand: boostedDemand,
        shapValues: [
          { feature: 'Simulated Weekend Trauma Influx (+35%)', impact: +45 },
          ...cell.shapValues,
        ],
      };
    });
  }, [baseHeatmapData, surgeStressTest]);

  // User manual selection state
  const [userSelectedCell, setUserSelectedCell] = useState<XGBoostRiskCell | null>(null);

  // Compute active cell dynamically without cascading effects
  const activeCell = useMemo(() => {
    if (userSelectedCell && (!selectedFacility || userSelectedCell.facilityId === selectedFacility)) {
      return userSelectedCell;
    }
    if (selectedFacility) {
      const facilityCells = heatmapData.filter((c) => c.facilityId === selectedFacility);
      if (facilityCells.length > 0) {
        return [...facilityCells].sort((a, b) => b.riskProbability - a.riskProbability)[0];
      }
    }
    return heatmapData[7] || heatmapData[0] || null;
  }, [userSelectedCell, selectedFacility, heatmapData]);

  const facilities = useMemo(() => {
    const allFacs = Array.from(new Set(heatmapData.map((d) => d.facilityName)));
    if (filterMode === 'selected' && selectedFacility) {
      const target = hospitals.find((h) => h.id === selectedFacility);
      if (target) {
        return [target.shortName];
      }
    }
    return allFacs;
  }, [heatmapData, filterMode, selectedFacility, hospitals]);

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
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#222329] p-5 space-y-4 shadow-xs">
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Hospital {selectedResource} Shortage Risk Matrix (72 Hours)
            </h3>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-medium">
              Critical Shortage: &ge; 40% Risk
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time depletion probability across all 8 regional hospitals. Click any cell to inspect clinical SHAP demand drivers.
          </p>
        </div>

        {/* Interactive Controls: Stress Test & Filter Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stress Test Simulator Button */}
          <button
            onClick={() => setSurgeStressTest((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
              surgeStressTest
                ? 'bg-rose-500 text-white border-rose-600 shadow-sm animate-pulse'
                : 'bg-slate-100 dark:bg-[#18191E] border-slate-300 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-400'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${surgeStressTest ? 'text-yellow-300' : 'text-rose-500'}`} />
            <span>{surgeStressTest ? 'Stress Test Active (+35% Surge)' : 'Simulate Trauma Surge'}</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-[#18191E] p-1 rounded-xl border border-slate-200 dark:border-white/[0.08] text-xs font-mono">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-[#2A2B33] text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All 8 Hospitals
            </button>
            <button
              onClick={() => setFilterMode('selected')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'selected'
                  ? 'bg-white dark:bg-[#2A2B33] text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Selected Hospital Only
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] font-mono pt-1">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40" />
          <span className="text-slate-600 dark:text-slate-400">&lt; 20% Safe Reserve</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-50 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40" />
          <span className="text-slate-600 dark:text-slate-400">20–39% Guardrail Caution</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-rose-50 dark:bg-rose-500/30 border border-rose-300 dark:border-rose-500/60" />
          <span className="text-rose-600 dark:text-rose-400 font-bold">&ge; 40% Imminent Breach</span>
        </div>
      </div>

      {/* Heatmap Grid Table */}
      <div className="overflow-x-auto pb-2 border border-slate-200 dark:border-white/[0.06] rounded-xl">
        <table className="w-full border-collapse font-mono text-xs">
          <thead className="bg-slate-50 dark:bg-[#1E1F25]">
            <tr>
              <th className="p-3 text-left text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 min-w-[220px] font-semibold">
                Hospital Facility
              </th>
              {BLOOD_GROUPS_LIST.map((bg) => (
                <th
                  key={bg}
                  className="p-3 text-center text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 min-w-[75px]"
                >
                  {bg}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {facilities.map((facName) => {
              const matchedHospital = hospitals.find((h) => h.shortName === facName || h.name === facName);
              const isCurrentFacility = matchedHospital?.id === selectedFacility;

              return (
                <tr
                  key={facName}
                  className={`transition-colors ${
                    isCurrentFacility
                      ? 'bg-rose-500/[0.07] dark:bg-rose-500/[0.12] ring-1 ring-rose-500/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                  }`}
                >
                  {/* Hospital Row Header (Clickable to switch active facility) */}
                  <td className="p-3 text-slate-900 dark:text-slate-200 font-sans font-medium text-xs whitespace-nowrap">
                    <button
                      onClick={() => matchedHospital && onSelectFacility && onSelectFacility(matchedHospital.id)}
                      className="flex items-center gap-2 text-left hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer group"
                    >
                      <Building2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isCurrentFacility ? 'text-rose-500' : 'text-slate-400 group-hover:text-rose-500'
                        }`}
                      />
                      <span className="font-semibold">{facName}</span>
                      {isCurrentFacility && (
                        <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/15 px-1.5 py-0.5 rounded-full border border-rose-500/25 ml-1">
                          Active
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Blood Group Columns */}
                  {BLOOD_GROUPS_LIST.map((bg) => {
                    const cellData = heatmapData.find(
                      (d) => d.facilityName === facName && d.bloodGroup === bg
                    );

                    if (!cellData) {
                      return (
                        <td key={bg} className="p-2 text-center text-slate-400">
                          —
                        </td>
                      );
                    }

                    const { bg: cellBg } = getCellStyling(cellData.riskProbability);
                    const isSelected =
                      activeCell?.facilityName === facName && activeCell?.bloodGroup === bg;

                    return (
                      <td key={bg} className="p-1.5 text-center">
                        <button
                          onClick={() => {
                            setUserSelectedCell(cellData);
                            if (matchedHospital && onSelectFacility) {
                              onSelectFacility(matchedHospital.id);
                            }
                          }}
                          className={`w-full py-2 px-1 rounded-xl border text-center transition-all cursor-pointer shadow-2xs ${cellBg} ${
                            isSelected ? 'ring-2 ring-slate-900 dark:ring-white shadow-md scale-102' : ''
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Clinical Shortage Risk Breakdown & Explainability Drawer */}
      {activeCell && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 animate-in fade-in duration-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Clinical Shortage Risk Breakdown — {activeCell.facilityName} ({activeCell.bloodGroup})</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Current Stock: {activeCell.currentStock} units • Expected Patient Demand: {activeCell.baselineDemand} units / 72h
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-xs px-2.5 py-1 rounded-lg font-bold ${
                  activeCell.riskProbability >= 0.4
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                }`}
              >
                72h Shortage Risk: {(activeCell.riskProbability * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Primary Demand Drivers */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-semibold">
              Primary Depletion & Demand Drivers (XGBoost SHAP Feature Attribution):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeCell.shapValues.map((sv, idx) => {
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
                        style={{ width: `${Math.min(100, Math.abs(sv.impact))}%` }}
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
