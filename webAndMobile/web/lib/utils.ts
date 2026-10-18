import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTemp(tempC: number): string {
  return `${tempC.toFixed(1)}°C`;
}

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function formatUrgencyTier(tier: number): { label: string; color: string; badgeBg: string } {
  switch (tier) {
    case 1:
      return { label: 'ESI Tier 1: Resuscitative', color: 'text-rose-400', badgeBg: 'bg-rose-500/15 border-rose-500/30' };
    case 2:
      return { label: 'ESI Tier 2: Emergent', color: 'text-amber-400', badgeBg: 'bg-amber-500/15 border-amber-500/30' };
    case 3:
      return { label: 'ESI Tier 3: Urgent', color: 'text-blue-400', badgeBg: 'bg-blue-500/15 border-blue-500/30' };
    default:
      return { label: `ESI Tier ${tier}: Routine`, color: 'text-slate-400', badgeBg: 'bg-slate-500/15 border-slate-500/30' };
  }
}

export function formatHoursRemaining(hours: number): string {
  if (hours <= 0) return 'EXPIRED';
  if (hours < 24) return `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  return `${days}d ${remainingHours}h`;
}
