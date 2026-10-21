'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useVitalis } from '../../lib/store/vitalisContext';
import { VitalisLogo } from '../common/VitalisLogo';
import {
  MapPin,
  CheckSquare,
  TrendingUp,
  Boxes,
  Activity,
  Database,
  Radio,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  AlertTriangle,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { requests, telemetry, openTriage, toggleExcursionSimulator } = useVitalis();
  const [collapsed, setCollapsed] = useState(false);

  const pendingRequestsCount = requests.filter((r) => r.status === 'pending_approval').length;
  const excursionCount = telemetry.filter((t) => t.excursionFlag).length;

  const navItems = [
    {
      name: 'Command Map',
      href: '/dashboard',
      icon: MapPin,
      badge: telemetry.length > 0 ? `${telemetry.length}` : undefined,
      badgeLabel: 'in transit',
    },
    {
      name: 'Approvals Queue',
      href: '/approvals',
      icon: CheckSquare,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : undefined,
      urgent: pendingRequestsCount > 0,
      badgeLabel: 'pending',
    },
    {
      name: 'Predictive Engine',
      href: '/analytics',
      icon: TrendingUp,
      badge: undefined,
    },
    {
      name: 'Inventory Ledger',
      href: '/inventory',
      icon: Boxes,
      badge: excursionCount > 0 ? `${excursionCount}` : undefined,
      urgent: excursionCount > 0,
      badgeLabel: 'alert',
    },
  ];

  return (
    <aside
      className={`relative z-40 flex flex-col justify-between apple-liquid-glass transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 select-none ${
        collapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      {/* Upper Navigation Block */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-black/[0.04] dark:border-white/[0.06]">
          <Link
            href="/dashboard"
            className="flex items-center overflow-hidden focus:outline-none"
            title="Vitalis Autonomous Logistics Grid"
          >
            <VitalisLogo size="md" showText={!collapsed} />
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-7 w-7 items-center justify-center rounded-xl border border-black/[0.04] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all cursor-pointer active:scale-95"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Quick Triage Simulator Action */}
        <div className="p-3">
          <button
            onClick={openTriage}
            className={`w-full group relative flex items-center rounded-xl border border-rose-500/20 bg-rose-500/[0.07] hover:bg-rose-500/[0.13] dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all duration-200 cursor-pointer shadow-xs ${
              collapsed ? 'h-10 justify-center p-0' : 'justify-between px-3 py-2.5'
            }`}
            title="Open AI Clinical Triage Simulator (Jev Extraction + ReAct)"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-xs">
                <Zap className="h-3.5 w-3.5 fill-white/20" />
              </div>
              {!collapsed && (
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-tight">
                    Triage Ingestion
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    AI Clinical Parser
                  </span>
                </div>
              )}
            </div>
            {!collapsed && (
              <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                AGENT
              </span>
            )}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="mt-1 px-3 space-y-1">
          {!collapsed && (
            <div className="px-2 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold select-none">
              Platform
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href === '/dashboard' && pathname === '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center rounded-xl transition-all duration-200 group cursor-pointer ${
                  collapsed
                    ? 'h-11 justify-center p-0'
                    : 'gap-3 px-3 py-2.5 text-xs font-medium'
                } ${
                  isActive
                    ? 'text-slate-900 dark:text-white bg-slate-900/[0.05] dark:bg-white/[0.08] border border-black/[0.04] dark:border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border border-transparent'
                }`}
                title={collapsed ? item.name : undefined}
              >
                {/* Active Apple Glass Glow Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#0071E3] dark:bg-[#2997FF] shadow-[0_0_8px_rgba(0,113,227,0.5)]" />
                )}

                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    isActive
                      ? 'text-[#0071E3] dark:text-[#2997FF]'
                      : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }`}
                />

                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between">
                    <span className={isActive ? 'font-semibold' : ''}>{item.name}</span>
                    {item.badge && (
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          item.urgent
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse font-bold'
                            : 'bg-black/[0.04] dark:bg-white/[0.07] text-slate-600 dark:text-slate-300 border border-black/[0.04] dark:border-white/[0.06]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Telemetry & Controls - Minimalist Liquid Glass Pill Panel */}
      <div className="p-3 border-t border-black/[0.04] dark:border-white/[0.06]">
        {!collapsed ? (
          <div className="apple-glass-pill rounded-2xl p-3 space-y-2.5">
            {/* Row 1: System Status & Latency */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 tracking-tight">
                  Grid Nominal
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.05]">
                42ms
              </span>
            </div>

            {/* Row 2: Micro Telemetry Badges */}
            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-black/[0.04] dark:border-white/[0.05] text-[9px] font-mono text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>FastAPI</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>PostGIS</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                <span>ReAct</span>
              </div>
            </div>

            {/* Row 3: Elegant Cold-Chain Excursion Simulator Toggle */}
            <button
              onClick={() => toggleExcursionSimulator('84d59a58')}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[10px] font-mono text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-black/[0.02] dark:bg-white/[0.03] hover:bg-rose-500/10 border border-black/[0.04] dark:border-white/[0.06] hover:border-rose-500/25 transition-all cursor-pointer"
              title="Toggle cold chain excursion alarm on Transfer #84d59a58 for simulation"
            >
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              <span>Simulate Excursion</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <span
              className="relative flex h-2.5 w-2.5"
              title="System Online (FastAPI 42ms • PostGIS Connected)"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <button
              onClick={() => toggleExcursionSimulator('84d59a58')}
              className="h-7 w-7 rounded-lg flex items-center justify-center border border-black/[0.04] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.03] text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Toggle Cold Chain Excursion Simulator"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
