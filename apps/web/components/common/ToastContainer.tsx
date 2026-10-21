'use client';

import React from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, dismissToast } = useVitalis();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />,
        };

        const borderMap = {
          success: 'border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-emerald-950/90',
          warning: 'border-amber-200 dark:border-amber-500/30 bg-white dark:bg-amber-950/90',
          error: 'border-rose-200 dark:border-rose-500/30 bg-white dark:bg-rose-950/90',
          info: 'border-blue-200 dark:border-blue-500/30 bg-white dark:bg-blue-950/90',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-xl shadow-lg transition-all duration-200 animate-in slide-in-from-bottom-2 ${borderMap[toast.type]}`}
          >
            {iconMap[toast.type]}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{toast.title}</h4>
                <span className="text-[10px] font-mono text-slate-400">{toast.timestamp}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-0.5 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
