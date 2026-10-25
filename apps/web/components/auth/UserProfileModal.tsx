'use client';

import React from 'react';
import { useAuth, DEMO_USERS, UserRole } from '../../lib/store/authContext';
import {
  X,
  ShieldCheck,
  Building2,
  Mail,
  CheckCircle2,
  XCircle,
  LogOut,
  RefreshCw,
  UserCheck,
  Truck,
  Boxes,
  FileSearch,
} from 'lucide-react';

export function UserProfileModal() {
  const { user, isAuthModalOpen, setIsAuthModalOpen, switchRole, logout } = useAuth();

  if (!isAuthModalOpen || !user) return null;

  const roleIcons: Record<UserRole, React.ComponentType<{ className?: string }>> = {
    coordinator: ShieldCheck,
    courier: Truck,
    inventory_officer: Boxes,
    auditor: FileSearch,
  };

  const roleColors: Record<UserRole, { badge: string; border: string; bg: string; text: string }> = {
    coordinator: {
      badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/10',
      text: 'text-rose-500',
    },
    courier: {
      badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
    },
    inventory_officer: {
      badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-500',
    },
    auditor: {
      badge: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      border: 'border-sky-500/30',
      bg: 'bg-sky-500/10',
      text: 'text-sky-500',
    },
  };

  const CurrentRoleIcon = roleIcons[user.role];
  const currentColors = roleColors[user.role];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#1C1D22] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              User Profile & Role-Based Permissions
            </h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4 p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02]">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold font-mono border ${currentColors.border} ${currentColors.bg} ${currentColors.text} shrink-0`}
            >
              {user.avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                  {user.name}
                </h4>
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border uppercase tracking-wider ${currentColors.badge}`}
                >
                  <CurrentRoleIcon className="w-3 h-3 shrink-0" />
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user.roleTitle}
              </p>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-600 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{user.facilityName}</span>
                </span>
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Granular Clinical Permissions Matrix */}
          <div>
            <h5 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-medium">
              Effective Role Permissions
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg border border-black/[0.04] dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02]">
                {user.permissions.canApproveTransfers ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className={user.permissions.canApproveTransfers ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400'}>
                  Doctor Sign-Off / Approval
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg border border-black/[0.04] dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02]">
                {user.permissions.canTriggerTriage ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className={user.permissions.canTriggerTriage ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400'}>
                  Emergency NLP Triage
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg border border-black/[0.04] dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02]">
                {user.permissions.canManageInventory ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className={user.permissions.canManageInventory ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400'}>
                  Manage Blood Reserves
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg border border-black/[0.04] dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02]">
                {user.permissions.canLogFieldTelemetry ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className={user.permissions.canLogFieldTelemetry ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400'}>
                  Field Courier Telematics
                </span>
              </div>
            </div>
          </div>

          {/* Quick Role Switcher (Presentation Demo) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-medium">
                Switch Role (Instant Demo Switcher)
              </h5>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-rose-500" /> 1-Click Role Switch
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(DEMO_USERS) as UserRole[]).map((rKey) => {
                const targetUser = DEMO_USERS[rKey];
                const isCurrent = user.role === rKey;
                const Icon = roleIcons[rKey];
                const colors = roleColors[rKey];

                return (
                  <button
                    key={rKey}
                    onClick={() => switchRole(rKey)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isCurrent
                        ? `${colors.border} ${colors.bg} ring-1 ring-rose-500/20`
                        : 'border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${colors.border} ${colors.bg} ${colors.text} shrink-0 mt-0.5`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {targetUser.name.split(' ')[0]} {targetUser.name.split(' ')[1] || ''}
                        </span>
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        {targetUser.badgeLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-black/[0.06] dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Session: Active (ID: {user.id})
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
