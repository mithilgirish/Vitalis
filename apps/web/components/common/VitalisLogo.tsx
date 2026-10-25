'use client';

import React from 'react';

interface VitalisLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function VitalisLogo({ size = 'md', showText = true, className = '' }: VitalisLogoProps) {
  const sizeMap = {
    sm: { box: 26, font: 'text-sm' },
    md: { box: 34, font: 'text-base' },
    lg: { box: 44, font: 'text-xl' },
  };

  const { box, font } = sizeMap[size];

  return (
    <div className={`flex items-center ${showText ? 'gap-3' : 'justify-center'} ${className}`}>
      {/* Interlocking Crimson & Cobalt Ribbon Logo */}
      <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-slate-400/20 dark:bg-slate-500/25">
        <svg
          width={box}
          height={box}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_12px_rgba(225,29,72,0.4)]"
        >
          <defs>
            {/* Crimson Ribbon Gradient (Blood / Urgency) */}
            <linearGradient id="crimsonRibbon" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="45%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#9F1239" />
            </linearGradient>

            {/* Cobalt Ribbon Gradient (Network / Logistics) */}
            <linearGradient id="cobaltRibbon" x1="42" y1="6" x2="6" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="55%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>

            {/* Intersection glow */}
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Underloop - Cobalt Ribbon */}
          <path
            d="M12 36C8 30 10 18 20 12C28 7.2 38 12 38 20C38 28 28 34 24 38C20 42 16 42 12 36Z"
            stroke="url(#cobaltRibbon)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.9"
          />

          {/* Overloop - Crimson Ribbon Interlocking */}
          <path
            d="M36 36C40 30 38 18 28 12C20 7.2 10 12 10 20C10 28 20 34 24 38C28 42 32 42 36 36Z"
            stroke="url(#crimsonRibbon)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Central Crossing Node / Viability Core */}
          <circle cx="24" cy="20" r="2.5" fill="#FFFFFF" opacity="0.95" />
          <circle cx="24" cy="20" r="5" fill="url(#centerGlow)" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight select-none">
          <span className={`font-semibold tracking-tight text-slate-900 dark:text-white ${font}`}>
            VITALIS
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            Emergency Medical Logistics
          </span>
        </div>
      )}
    </div>
  );
}
