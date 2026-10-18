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
      badge: telemetry.length > 0 ? `${telemetry.length} in transit` : undefined,
      badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    },
    {
      name: 'HITL Approval Queue',
      href: '/approvals',
      icon: CheckSquare,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40 animate-pulse',
    },
    {
      name: 'Predictive Engine',
      href: '/analytics',
      icon: TrendingUp,
      badge: 'XGBoost 72h',
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    },
    {
      name: 'Inventory Ledger',
      href: '/inventory',
      icon: Boxes,
      badge: excursionCount > 0 ? 'Excursion' : undefined,
      badgeColor: 'bg-rose-600/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
    },
  ];

  return (
    <aside
      className={`relative z-40 flex flex-col justify-between border-r border-slate-200 dark:border-[#2B3545] bg-white/95 dark:bg-[#12161F]/95 backdrop-blur-xl transition-all duration-300 ease-in-out shrink-0 select-none shadow-xs ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-[#2B3545]">
          <Link href="/dashboard" className="flex items-center overflow-hidden">
            <VitalisLogo size="md" showText={!collapsed} />
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-[#2D3748] bg-slate-50 dark:bg-[#1A202C] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#232B3B] transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Quick Triage Simulator Launcher Button */}
        <div className="p-3">
          <button
            onClick={openTriage}
            className={`w-full group relative flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/70 dark:bg-gradient-to-r dark:from-rose-950/40 dark:via-rose-900/20 dark:to-slate-900 p-2 text-left text-xs transition-all hover:border-rose-400 dark:hover:border-rose-500/60 hover:shadow-[0_0_15px_rgba(225,29,72,0.15)] cursor-pointer ${
              collapsed ? 'justify-center' : 'px-3'
            }`}
          >
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white shadow-xs">
              <Zap className="h-4 w-4 animate-pulse text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-rose-700 dark:text-rose-200 group-hover:text-rose-800 dark:group-hover:text-white transition-colors">
                  Triage Simulator
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Jev & ReAct Ingestion
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-2 px-2.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-500/30 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A202C] border border-transparent'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded border font-medium ${item.badgeColor}`}
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

      {/* Bottom Section: System Health Status */}
      <div className="p-3 border-t border-slate-200 dark:border-[#2B3545] bg-slate-50/50 dark:bg-[#12161F]">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-mono uppercase tracking-wider text-[10px]">System Telemetry</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                ONLINE
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-[#1A202C] p-2 rounded-xl border border-slate-200 dark:border-[#2D3748] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                  FastAPI Gateway
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">42ms</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Database className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                  PostGIS Spatial
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">Connected</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-rose-500 dark:text-rose-400" />
                  LangChain ReAct
                </span>
                <span className="text-slate-700 dark:text-slate-300">Active</span>
              </div>
            </div>

            {/* Demo Excursion Toggle Button */}
            <button
              onClick={() => toggleExcursionSimulator('84d59a58')}
              className="w-full text-center py-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A202C] rounded-lg border border-dashed border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
              title="Toggle cold chain excursion alert on Transfer #84d59a58 for testing"
            >
              [Toggle Demo Excursion]
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System Online (FastAPI 42ms)" />
            <button
              onClick={() => toggleExcursionSimulator('84d59a58')}
              className="text-[9px] font-mono text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              title="Toggle Excursion Alert"
            >
              Excur.
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
