'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useVitalis } from '../../lib/store/vitalisContext';
import {
  Bell,
  Search,
  Zap,
  Clock,
  ShieldCheck,
  Radio,
  MapPin,
  CheckCircle,
  Sun,
  Moon,
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { openTriage, requests, telemetry, theme, toggleTheme } = useVitalis();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageInfo = () => {
    if (pathname.includes('/approvals')) {
      return {
        title: 'HITL Verification & Governance',
        subtitle: 'Human-in-the-Loop dispatch authorization with explainable AI reasoning',
        badge: 'Zero Autonomous Dispatch Enforced',
      };
    }
    if (pathname.includes('/analytics')) {
      return {
        title: 'Predictive Stockout & Demand Engine',
        subtitle: 'Meta Prophet time-series & XGBoost 72-hour clinical depletion matrices',
        badge: 'NHAMCS Calibrated',
      };
    }
    if (pathname.includes('/inventory')) {
      return {
        title: 'Biological Inventory Ledger',
        subtitle: 'Real-time telemetry, cold storage chambers, and batch viability tracking',
        badge: 'IoT RFID Synchronized',
      };
    }
    return {
      title: 'GIS Command & Logistics Grid',
      subtitle: 'Real-time Chennai clinical network, spatial routing & cold-chain telemetry',
      badge: 'Live Regional Mesh',
    };
  };

  const { title, subtitle, badge } = getPageInfo();
  const inTransitCount = telemetry.length;

  return (
    <header className="h-16 w-full border-b border-slate-200 dark:border-[#2B3545] bg-white/90 dark:bg-[#12161F]/95 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0 transition-colors">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h1>
            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 font-medium">
              {badge}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Live Network Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2D3748] bg-slate-50 dark:bg-[#1A202C]/80 font-mono text-xs text-slate-700 dark:text-slate-300 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          <span className="text-slate-400">IST:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{timeStr || '14:48:35'}</span>
        </div>

        {/* Network Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2D3748] bg-slate-50 dark:bg-[#1A202C]/80 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-mono font-medium">
            {inTransitCount} Couriers Active
          </span>
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to charcoal dark mode'}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-[#2D3748] bg-slate-50 dark:bg-[#1A202C] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#232B3B] transition-all cursor-pointer shadow-xs"
          title={theme === 'dark' ? 'Switch to Healthcare Light Mode' : 'Switch to Charcoal Grey Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>

        {/* Triage Simulator Action Button */}
        <button
          onClick={openTriage}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-sm hover:shadow-[0_0_15px_rgba(225,29,72,0.35)] transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-white text-white" />
          <span className="hidden sm:inline">Triage Simulator</span>
          <span className="text-[10px] font-mono bg-rose-800/70 px-1 py-0.2 rounded text-rose-100">
            Jev + ReAct
          </span>
        </button>

        {/* Operator Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-[#2B3545]">
          <div className="h-8 w-8 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-xs font-mono font-bold text-rose-600 dark:text-rose-400 shadow-xs">
            VT
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
              Dr. R. Menon
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Chief Dispatch Officer
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
