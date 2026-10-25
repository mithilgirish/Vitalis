'use client';

import React, { useState } from 'react';
import { useAuth, USER_CREDENTIALS } from '../../lib/store/authContext';
import { VitalisLogo } from '../common/VitalisLogo';
import {
  Lock,
  User,
  ArrowRight,
  KeyRound,
  AlertCircle,
  ShieldCheck,
  Truck,
  Boxes,
  FileSearch,
  Eye,
  EyeOff,
} from 'lucide-react';

export function AuthScreen() {
  const { loginWithCredentials } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginWithCredentials(identifier, password);
      setIsLoading(false);
      if (!res.success && res.error) {
        setError(res.error);
      }
    }, 200);
  };

  const handleFillCredentials = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setError(null);
  };

  const roleIcons = {
    coordinator: ShieldCheck,
    courier: Truck,
    inventory_officer: Boxes,
    auditor: FileSearch,
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#0E0F12] relative overflow-hidden select-none">
      {/* Background radial glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/[0.10] bg-[#16171C]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] p-6 sm:p-8 z-10">
        {/* Brand & Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center justify-center">
            <VitalisLogo size="lg" showText={true} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Clinical Supply Chain Command
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your clinical credentials to access your designated role workspace
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            Role-Based Access Control (RBAC) Active
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{error}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Username or Clinical Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. coordinator, courier, inventory, auditor"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.10] bg-white/[0.03] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                Password
              </label>
              <span className="text-[11px] text-slate-500 font-mono">Default: vitalis123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/[0.10] bg-white/[0.03] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white text-sm font-semibold shadow-lg shadow-rose-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer mt-3"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Credentials Quick Reference (For Evaluation & Demo) */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono uppercase tracking-wider font-semibold">
              Authorized Test Credentials
            </span>
            <span className="text-[10px] text-slate-500">Tap to pre-fill</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {USER_CREDENTIALS.map((c) => {
              const Icon = roleIcons[c.role];
              return (
                <button
                  type="button"
                  key={c.username}
                  onClick={() => handleFillCredentials(c.username, c.password)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-left transition-colors cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-white/[0.05] flex items-center justify-center text-slate-300 shrink-0 group-hover:text-rose-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-mono font-semibold text-white block truncate">
                      {c.username}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {c.user.name.split(' ')[0]} ({c.role.replace('_', ' ')})
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trust & Security Footnote */}
        <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Password: vitalis123</span>
          <span>Chennai Regional Grid</span>
        </div>
      </div>
    </div>
  );
}
