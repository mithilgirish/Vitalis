'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useVitalis } from '../../lib/store/vitalisContext';
import { useAuth } from '../../lib/store/authContext';
import { VitalisLogo } from '../common/VitalisLogo';
import {
  Zap,
  Clock,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { openTriage, telemetry, theme, toggleTheme } = useVitalis();
  const { user, setIsAuthModalOpen } = useAuth();
  const [timeStr, setTimeStr] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        title: 'Doctor Dispatch Authorizations',
        subtitle: 'Review & approve urgent hospital transfer requests before drivers depart',
        badge: 'Physician Sign-Off Required',
      };
    }
    if (pathname.includes('/analytics')) {
      return {
        title: '72-Hour Blood Stock Forecast',
        subtitle: 'Anticipate hospital shortages early and balance regional blood supply',
        badge: 'Clinical Demand Prediction',
      };
    }
    if (pathname.includes('/inventory')) {
      return {
        title: 'Regional Blood & Organ Bank',
        subtitle: 'Live hospital reserves, cold chain refrigeration status, and expiration tracking',
        badge: 'Hospital Reserves Online',
      };
    }
    return {
      title: 'Live Medical Transfers',
      subtitle: 'Track in-transit blood, organs, and critical supplies across Chennai hospitals',
      badge: 'Live Hospital Network',
    };
  };

  const { title, subtitle, badge } = getPageInfo();
  const inTransitCount = telemetry.length;

  return (
    <header className="h-16 w-full border-b border-black/[0.06] dark:border-white/[0.08] apple-glass px-6 flex items-center justify-between z-30 shrink-0 transition-colors">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <VitalisLogo size="sm" showText={false} />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <span className="font-mono text-[10px] tracking-wide uppercase px-2.5 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
              {badge}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Live Network Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] font-mono text-xs text-slate-700 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-slate-400">IST</span>
          <span className="font-semibold text-slate-900 dark:text-white" suppressHydrationWarning>{timeStr || '14:48:35'}</span>
        </div>

        {/* Network Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-xs text-slate-700 dark:text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-mono font-medium">
            {inTransitCount} Active Drivers
          </span>
        </div>

        {/* Apple Segmented Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={!mounted || theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all cursor-pointer"
          title={!mounted || theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          suppressHydrationWarning
        >
          {!mounted || theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>

        {/* Emergency Intake Action Button */}
        <button
          onClick={openTriage}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white shadow-sm hover:shadow-[0_2px_12px_rgba(225,29,72,0.3)] transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-white text-white" />
          <span className="hidden sm:inline">Emergency Intake</span>
          <span className="text-[10px] font-mono bg-rose-700 px-1.5 py-0.5 rounded-full text-rose-100">
            AI Triage
          </span>
        </button>

        {/* Operator / User Role Profile Pill */}
        {user && (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            title="Click to view profile, permissions or switch roles"
            className="flex items-center gap-2.5 pl-2.5 py-1 pr-2 rounded-xl border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all cursor-pointer group"
          >
            <div
              className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-transform group-hover:scale-105 ${
                user.badgeColor === 'rose'
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : user.badgeColor === 'amber'
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : user.badgeColor === 'emerald'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400'
              }`}
            >
              {user.avatarInitials}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[130px]">
                  {user.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform group-hover:translate-y-0.5" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                {user.roleTitle}
              </span>
            </div>
          </button>
        )}
      </div>
    </header>
  );
}
