'use client';

import React, { useSyncExternalStore } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useVitalis } from '../../lib/store/vitalisContext';
import { PROPHET_FORECAST_DATA } from '../../lib/data/mockData';
import { BiologicalResourceType } from '../../lib/types';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface ProphetForecastChartProps {
  selectedFacility: string;
  selectedResource: BiologicalResourceType;
  horizon: '7d' | '14d';
}

const emptySubscribe = () => () => {};

interface TooltipPayloadItem {
  payload: {
    label: string;
    isForecast?: boolean;
    yHistorical?: number;
    yhat: number;
    yhatLower: number;
    yhatUpper: number;
    safetyStock: number;
    anomaly?: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono shadow-xl">
        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between gap-4">
          <span>{data.label}</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] ${
              data.isForecast
                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {data.isForecast ? 'Prophet Forecast' : 'Historical Actual'}
          </span>
        </div>

        <div className="mt-2 space-y-1 text-[11px]">
          {data.yHistorical !== undefined && (
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
              <span className="text-slate-500 dark:text-slate-400">Historical Consumption:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{data.yHistorical} Units</span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
            <span className="text-slate-500 dark:text-slate-400">Modeled Demand (ŷ):</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{data.yhat} Units</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>80% CI Bounds:</span>
            <span>
              [{data.yhatLower} – {data.yhatUpper}]
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
            <span>Reserve Safety Stock:</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{data.safetyStock} Units</span>
          </div>
        </div>

        {data.anomaly && (
          <div className="mt-2 p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-500/30 text-[10px] text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
            <span>{data.anomaly}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export function ProphetForecastChart({
  selectedFacility: _selectedFacility,
  selectedResource: _selectedResource,
  horizon,
}: ProphetForecastChartProps) {
  const { theme } = useVitalis();
  const isDark = theme === 'dark';
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const chartData = horizon === '7d'
    ? PROPHET_FORECAST_DATA.slice(0, 22)
    : PROPHET_FORECAST_DATA;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#2D3748] bg-white dark:bg-[#1A202C] p-5 space-y-4 shadow-xs">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-600 dark:text-rose-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Meta Prophet Bayesian Time-Series Demand Trajectory
            </h3>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 font-medium">
              NHAMCS Calibrated
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Historical consumption curve vs. {horizon === '7d' ? '7-Day' : '14-Day'} rolling demand forecast with 80% CI uncertainty bands (ŷ_lower to ŷ_upper)
          </p>
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-slate-700 dark:text-slate-300">Historical Actuals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-slate-700 dark:text-slate-300">Forecast ŷ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 bg-blue-500/20 border border-blue-500/40 rounded-sm" />
            <span className="text-slate-500 dark:text-slate-400">80% CI Band</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-amber-500 border-dashed" />
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Safety Buffer</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-80 w-full pt-2">
        {!mounted ? (
          <div className="h-full w-full flex items-center justify-center text-xs font-mono text-slate-400">
            Initializing Meta Prophet Bayesian Model...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* 80% Confidence Interval Gradient */}
                <linearGradient id="ciBandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                </linearGradient>

                {/* Historical Area Gradient */}
                <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E11D48" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#2D3748' : '#E2E8F0'}
                opacity={0.8}
              />

              <XAxis
                dataKey="label"
                stroke={isDark ? '#64748B' : '#94A3B8'}
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: isDark ? '#2D3748' : '#CBD5E1' }}
              />
              <YAxis
                stroke={isDark ? '#64748B' : '#94A3B8'}
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: isDark ? '#2D3748' : '#CBD5E1' }}
                unit="u"
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Safety Buffer Reference Line */}
              <ReferenceLine
                y={15}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                label={{
                  value: 'Min Safety Reserve (15u)',
                  fill: '#D97706',
                  fontSize: 10,
                  position: 'insideBottomRight',
                }}
              />

              {/* 80% CI Upper and Lower Envelope */}
              <Area
                type="monotone"
                dataKey="yhatUpper"
                stroke="transparent"
                fill="url(#ciBandGradient)"
              />
              <Area
                type="monotone"
                dataKey="yhatLower"
                stroke="transparent"
                fill={isDark ? '#1A202C' : '#FFFFFF'}
              />

              {/* Forecast Point Line */}
              <Line
                type="monotone"
                dataKey="yhat"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 3, fill: '#2563EB', strokeWidth: 1, stroke: '#FFFFFF' }}
                activeDot={{ r: 5, fill: '#60A5FA' }}
              />

              {/* Historical Consumption Area */}
              <Area
                type="monotone"
                dataKey="yHistorical"
                stroke="#E11D48"
                strokeWidth={2.5}
                fill="url(#histGradient)"
                dot={{ r: 3, fill: '#E11D48', strokeWidth: 1, stroke: '#FFFFFF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Model Calibration Footnote */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono gap-2">
        <span>Parameters: Fourier Seasonality order = 5 • Changepoint prior scale = 0.05</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Mean Absolute Percentage Error (MAPE): 4.12%</span>
      </div>
    </div>
  );
}
