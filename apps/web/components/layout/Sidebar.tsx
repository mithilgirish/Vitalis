'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useVitalis } from '../../lib/store/vitalisContext';
import { useAuth } from '../../lib/store/authContext';
import { VitalisLogo } from '../common/VitalisLogo';
import {
  MapPin,
  CheckSquare,
  TrendingUp,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Zap,
  Lock,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { requests, telemetry, openTriage, addToast } = useVitalis();
  const { user, setIsAuthModalOpen } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const pendingRequestsCount = requests.filter((r) => r.status === 'pending_approval').length;
  const excursionCount = telemetry.filter((t) => t.excursionFlag).length;

  const navItems = [
    {
      name: 'Live Transfers',
      href: '/dashboard',
      icon: MapPin,
      badge: telemetry.length > 0 ? `${telemetry.length}` : undefined,
    },
    {
      name: 'Dispatch Approvals',
      href: '/approvals',
      icon: CheckSquare,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : undefined,
      urgent: pendingRequestsCount > 0,
    },
    {
      name: 'Blood Stock Forecast',
      href: '/analytics',
      icon: TrendingUp,
      badge: undefined,
    },
    {
      name: 'Blood & Organ Bank',
      href: '/inventory',
      icon: Boxes,
      badge: excursionCount > 0 ? `${excursionCount}` : undefined,
      urgent: excursionCount > 0,
    },
  ];

  return (
    <aside
      className={`relative z-40 flex flex-col apple-liquid-glass transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 select-none ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`relative flex h-16 items-center border-b border-black/[0.04] dark:border-white/[0.05] transition-all ${
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        <Link
          href="/dashboard"
          className="flex items-center justify-center focus:outline-none"
          title="Vitalis Autonomous Logistics Grid"
        >
          <VitalisLogo size="md" showText={!collapsed} />
        </Link>

        {/* Toggle Button in Header (when expanded) */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all cursor-pointer active:scale-95"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Floating Slider Opening Handle on Edge (when collapsed) */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="absolute -right-3 top-5 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-[#222329] border border-black/10 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.12)] text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Quick Emergency Intake Action (Apple Intelligence style) */}
      <div className="p-3">
        <button
          onClick={() => {
            if (user && !user.permissions.canTriggerTriage) {
              addToast({
                type: 'warning',
                title: 'Access Restricted by Role',
                message: `Your current role (${user.roleTitle}) does not have Triage Ingestion permissions. Login as Clinical Coordinator.`,
              });
              return;
            }
            openTriage();
          }}
          className={`w-full group relative flex items-center rounded-xl border border-rose-500/15 dark:border-rose-500/20 bg-rose-500/[0.05] hover:bg-rose-500/[0.10] dark:bg-rose-500/[0.08] dark:hover:bg-rose-500/[0.14] transition-all duration-200 cursor-pointer ${
            collapsed ? 'h-10 w-10 mx-auto justify-center p-0' : 'justify-between px-3 py-2'
          }`}
          title="Open Emergency Clinical Intake Assistant"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-xs">
              {user && !user.permissions.canTriggerTriage ? (
                <Lock className="h-3.5 w-3.5 text-white/80" />
              ) : (
                <Zap className="h-3.5 w-3.5 fill-white/20" />
              )}
            </div>
            {!collapsed && (
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-tight">
                  Emergency Intake
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {user && !user.permissions.canTriggerTriage ? 'Restricted' : 'AI Triage Assistant'}
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <span className="text-[9px] font-mono font-medium tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              NEW
            </span>
          )}
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="mt-1 px-2.5 space-y-1 flex-1">
        {!collapsed && (
          <div className="px-2.5 pt-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium select-none">
            Clinical Operations
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
              className={`relative flex items-center rounded-xl transition-all duration-150 group cursor-pointer ${
                collapsed
                  ? 'h-10 w-10 mx-auto justify-center p-0'
                  : 'gap-3 px-3 py-2 text-xs font-medium'
              } ${
                isActive
                  ? 'text-slate-900 dark:text-white bg-black/[0.06] dark:bg-white/[0.09] border border-black/[0.04] dark:border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.035] dark:hover:bg-white/[0.045] border border-transparent'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                  isActive
                    ? 'text-[#0071E3] dark:text-[#2997FF]'
                    : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                }`}
              />

              {/* Collapsed notification indicator dot */}
              {collapsed && item.badge && item.urgent && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#18191E]" />
              )}

              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span className={isActive ? 'font-semibold text-slate-900 dark:text-white' : ''}>
                    {item.name}
                  </span>
                  {item.badge && (
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        item.urgent
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 font-bold'
                          : 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 border border-black/[0.03] dark:border-white/[0.04]'
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

      {/* User Identity / Role Pill */}
      {user && (
        <div className="p-2 border-t border-black/[0.04] dark:border-white/[0.05]">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`w-full flex items-center rounded-xl p-2 transition-all cursor-pointer hover:bg-black/[0.04] dark:hover:bg-white/[0.06] ${
              collapsed ? 'justify-center' : 'gap-2.5 text-left'
            }`}
            title={`Logged in as ${user.name} (${user.roleTitle}). Click to switch role.`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs border shrink-0 ${
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
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                  {user.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block truncate">
                  {user.badgeLabel.split('(')[0]}
                </span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Bottom Sidebar Collapse/Expand Toggle */}
      <div className="p-2.5 border-t border-black/[0.04] dark:border-white/[0.05]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex items-center rounded-xl text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-black/[0.035] dark:hover:bg-white/[0.045] transition-all cursor-pointer active:scale-95 ${
            collapsed
              ? 'h-10 w-10 mx-auto justify-center'
              : 'w-full gap-2.5 px-3 py-2 text-xs font-medium'
          }`}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
