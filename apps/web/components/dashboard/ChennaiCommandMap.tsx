'use client';

import React, { useState } from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { Hospital, TransitTelemetry } from '../../lib/types';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Thermometer,
  Truck,
  Activity,
  AlertCircle,
  X,
  Compass,
} from 'lucide-react';

export function ChennaiCommandMap() {
  const {
    hospitals,
    telemetry,
    selectedHospital,
    setSelectedHospital,
    selectedCourier,
    setSelectedCourier,
    theme,
  } = useVitalis();

  const [activeFilter, setActiveFilter] = useState<'all' | 'emergency' | 'stockout' | 'surplus'>('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredHospital, setHoveredHospital] = useState<Hospital | null>(null);
  const [hoveredCourier, setHoveredCourier] = useState<TransitTelemetry | null>(null);

  const isDark = theme === 'dark';

  // Filter hospitals based on filter button
  const filteredHospitals = hospitals.filter((h) => {
    if (activeFilter === 'emergency') return h.status === 'emergency_active';
    if (activeFilter === 'stockout') return h.status === 'stockout_risk';
    if (activeFilter === 'surplus') return h.status === 'surplus';
    return true;
  });

  // Calculate quadratic bezier curve path for SVG
  const calculateArcPath = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const offset = Math.min(dist * 0.28, 70);
    const nx = -dy / dist;
    const ny = dx / dist;
    const cx = mx + nx * offset;
    const cy = my + ny * offset;

    return {
      path: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
      cx,
      cy,
    };
  };

  return (
    <div className="relative w-full h-[620px] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-[#F8FAFC] dark:bg-[#0B0D12] overflow-hidden select-none shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-colors">
      {/* Top Map Controls & Layer Filters - Apple Floating Pill Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="p-1 rounded-full flex items-center gap-1 border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#161820]/80 backdrop-blur-xl shadow-sm">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Nodes ({hospitals.length})
          </button>
          <button
            onClick={() => setActiveFilter('emergency')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeFilter === 'emergency'
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            Emergency ({hospitals.filter((h) => h.status === 'emergency_active').length})
          </button>
          <button
            onClick={() => setActiveFilter('stockout')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeFilter === 'stockout'
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Stockout Risk ({hospitals.filter((h) => h.status === 'stockout_risk').length})
          </button>
          <button
            onClick={() => setActiveFilter('surplus')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeFilter === 'surplus'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Surplus Hubs ({hospitals.filter((h) => h.status === 'surplus').length})
          </button>
        </div>
      </div>

      {/* Map Zoom & Compass Controls (Top Right) - Floating Dock */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="p-1 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#161820]/80 backdrop-blur-xl flex flex-col items-center shadow-sm">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px w-4 bg-black/[0.06] dark:bg-white/[0.08] my-0.5" />
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px w-4 bg-black/[0.06] dark:bg-white/[0.08] my-0.5" />
          <button
            onClick={() => setZoomLevel(1)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compass Indicator */}
        <div className="p-2 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#161820]/80 backdrop-blur-xl flex flex-col items-center justify-center shadow-sm">
          <Compass className="w-4 h-4 text-[#FF375F] dark:text-[#FF453A]" />
          <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-0.5">N</span>
        </div>
      </div>

      {/* Map Legend (Bottom Left) - Apple Frosted Panel */}
      <div className="absolute bottom-4 left-4 z-20 p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#161820]/80 backdrop-blur-xl text-[11px] font-sans space-y-2 shadow-sm">
        <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
          Node Status Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-slate-700 dark:text-slate-300">Active Emergency (ESI 1)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-slate-700 dark:text-slate-300">72h Stockout Risk &gt; 40%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-slate-700 dark:text-slate-300">Surplus Repository Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full animate-pulse" />
          <span className="text-slate-700 dark:text-slate-300">Live Cold-Chain Dispatch</span>
        </div>
      </div>

      {/* Interactive Main SVG Canvas */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
      >
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke={isDark ? '#232D3F' : '#E2E8F0'}
                strokeWidth="0.5"
                opacity={isDark ? 0.5 : 0.7}
              />
              <circle cx="50" cy="50" r="1" fill={isDark ? '#2D3748' : '#CBD5E1'} opacity="0.6" />
            </pattern>

            {/* Ocean / Bay of Bengal Gradient - Dark Charcoal vs Soft Clean Blue */}
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {isDark ? (
                <>
                  <stop offset="0%" stopColor="#141822" />
                  <stop offset="60%" stopColor="#182338" />
                  <stop offset="100%" stopColor="#1A2D4C" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#F1F5F9" />
                  <stop offset="50%" stopColor="#E0F2FE" />
                  <stop offset="100%" stopColor="#BAE6FD" />
                </>
              )}
            </linearGradient>

            {/* In-Transit Arc Gradient */}
            <linearGradient id="arcNormal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* Excursion Arc Gradient */}
            <linearGradient id="arcExcursion" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>

            {/* Node Pulse Glow Filters */}
            <filter id="crimsonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#E11D48" floodOpacity={isDark ? 0.7 : 0.4} />
            </filter>
            <filter id="emeraldGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10B981" floodOpacity={isDark ? 0.6 : 0.35} />
            </filter>
            <filter id="amberGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F59E0B" floodOpacity={isDark ? 0.6 : 0.35} />
            </filter>
          </defs>

          {/* Canvas Background */}
          <rect width="1000" height="700" fill={isDark ? '#141822' : '#F8FAFC'} />

          {/* Eastern Bay of Bengal Coastline & Sea */}
          <path
            d="M 680 0 C 670 120, 660 220, 640 310 C 620 400, 605 500, 595 620 C 590 660, 588 700, 585 700 L 1000 700 L 1000 0 Z"
            fill="url(#oceanGradient)"
            opacity={isDark ? 0.85 : 0.75}
          />

          {/* Coastline Surf Edge */}
          <path
            d="M 680 0 C 670 120, 660 220, 640 310 C 620 400, 605 500, 595 620 C 590 660, 588 700, 585 700"
            fill="none"
            stroke={isDark ? '#2E4C7A' : '#7DD3FC'}
            strokeWidth="2.5"
            strokeDasharray="4 2"
            opacity="0.8"
          />

          {/* Bay of Bengal Text Label */}
          <text
            x="760"
            y="350"
            fill={isDark ? '#2E4C7A' : '#0369A1'}
            fontSize="14"
            fontFamily="monospace"
            letterSpacing="6"
            className="select-none font-bold opacity-70"
          >
            BAY OF BENGAL
          </text>
          <text
            x="640"
            y="360"
            fill={isDark ? '#4B5563' : '#64748B'}
            fontSize="9"
            fontFamily="monospace"
            letterSpacing="2"
            className="select-none opacity-60 rotate-90"
          >
            MARINA & BESANT NAGAR COASTLINE
          </text>

          {/* Geographic Coordinates Grid Overlay */}
          <rect width="1000" height="700" fill="url(#grid)" />

          {/* Major Chennai Arteries */}
          {/* Poonamallee High Road */}
          <path
            d="M 220 380 Q 360 320 540 270 Q 580 260 620 250"
            fill="none"
            stroke={isDark ? '#283244' : '#CBD5E1'}
            strokeWidth="3.5"
            opacity="0.9"
          />
          <text x="240" y="370" fill={isDark ? '#64748B' : '#94A3B8'} fontSize="8" fontFamily="monospace">
            Poonamallee High Rd
          </text>

          {/* Anna Salai / Mount Road */}
          <path
            d="M 570 255 Q 490 330 460 410 Q 420 500 370 600"
            fill="none"
            stroke={isDark ? '#283244' : '#CBD5E1'}
            strokeWidth="4"
            opacity="0.9"
          />
          <text x="495" y="390" fill={isDark ? '#64748B' : '#94A3B8'} fontSize="8" fontFamily="monospace" transform="rotate(35 495 390)">
            Anna Salai (Mount Rd)
          </text>

          {/* OMR IT Expressway */}
          <path
            d="M 520 510 Q 490 580 460 690"
            fill="none"
            stroke={isDark ? '#283244' : '#CBD5E1'}
            strokeWidth="3.5"
            opacity="0.9"
          />
          <text x="510" y="580" fill={isDark ? '#64748B' : '#94A3B8'} fontSize="8" fontFamily="monospace" transform="rotate(70 510 580)">
            Rajiv Gandhi IT Expressway (OMR)
          </text>

          {/* Adyar River & Cooum River paths */}
          <path
            d="M 180 340 Q 330 350 490 320 Q 560 300 640 310"
            fill="none"
            stroke={isDark ? '#1C314E' : '#BAE6FD'}
            strokeWidth="2.5"
            opacity="0.8"
          />
          <path
            d="M 280 500 Q 400 490 490 510 Q 540 520 610 530"
            fill="none"
            stroke={isDark ? '#1C314E' : '#BAE6FD'}
            strokeWidth="3"
            opacity="0.8"
          />

          {/* ================================================================ */}
          {/* ANIMATED SVG BEZIER ARCS: In-Transit Dispatches */}
          {/* ================================================================ */}
          {telemetry.map((t) => {
            const { path } = calculateArcPath(t.originX, t.originY, t.destX, t.destY);
            const isExcursion = t.excursionFlag;

            return (
              <g key={t.transferId} className="cursor-pointer" onClick={() => setSelectedCourier(t)}>
                {/* Background Shadow Glow for Arc */}
                <path
                  d={path}
                  fill="none"
                  stroke={isExcursion ? '#EF4444' : '#2563EB'}
                  strokeWidth="6"
                  opacity={isDark ? 0.25 : 0.15}
                />

                {/* Main Animated Bezier Arc */}
                <path
                  d={path}
                  fill="none"
                  stroke={isExcursion ? 'url(#arcExcursion)' : 'url(#arcNormal)'}
                  strokeWidth="2.5"
                  className="animate-dash-flow"
                  strokeLinecap="round"
                />

                {/* Moving Courier Vehicle Marker along Arc */}
                <g
                  transform={`translate(${t.mapX}, ${t.mapY})`}
                  className="transition-transform duration-700"
                  onMouseEnter={() => setHoveredCourier(t)}
                  onMouseLeave={() => setHoveredCourier(null)}
                >
                  {/* Courier Radar Ping Ring */}
                  <circle
                    r="12"
                    fill={isExcursion ? '#EF4444' : '#3B82F6'}
                    opacity="0.3"
                    className="animate-ping"
                  />
                  {/* Courier Vehicle Center Badge */}
                  <circle
                    r="7"
                    fill={isExcursion ? '#E11D48' : '#2563EB'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="drop-shadow-md"
                  />
                  {/* Vehicle Icon representation */}
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isExcursion ? '!' : '▶'}
                  </text>

                  {/* Courier In-Transit Tooltip Label */}
                  <g transform="translate(14, -10)">
                    <rect
                      x="0"
                      y="0"
                      width="120"
                      height="28"
                      rx="4"
                      fill={isDark ? '#1A202C' : '#FFFFFF'}
                      stroke={isExcursion ? '#E11D48' : isDark ? '#374151' : '#CBD5E1'}
                      strokeWidth="1"
                      opacity="0.96"
                      className="shadow-sm"
                    />
                    <text
                      x="8"
                      y="12"
                      fill={isDark ? '#F1F5F9' : '#0F172A'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {t.courierId} ({t.velocityKmH} km/h)
                    </text>
                    <text
                      x="8"
                      y="22"
                      fill={isExcursion ? '#E11D48' : '#2563EB'}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {t.currentTemperatureC.toFixed(1)}°C • ETA {t.etaMinutes}m
                    </text>
                  </g>
                </g>
              </g>
            );
          })}

          {/* ================================================================ */}
          {/* REGIONAL CHENNAI HOSPITAL NODES */}
          {/* ================================================================ */}
          {filteredHospitals.map((h) => {
            const isSelected = selectedHospital?.id === h.id;
            const isHovered = hoveredHospital?.id === h.id;

            let nodeColor = '#3B82F6';
            let glowFilter = '';
            let isPulsing = false;

            if (h.status === 'emergency_active') {
              nodeColor = '#E11D48';
              glowFilter = 'url(#crimsonGlow)';
              isPulsing = true;
            } else if (h.status === 'stockout_risk') {
              nodeColor = '#F59E0B';
              glowFilter = 'url(#amberGlow)';
            } else if (h.status === 'surplus') {
              nodeColor = '#10B981';
              glowFilter = 'url(#emeraldGlow)';
            }

            return (
              <g
                key={h.id}
                transform={`translate(${h.mapX}, ${h.mapY})`}
                className="cursor-pointer group"
                onClick={() => setSelectedHospital(h)}
                onMouseEnter={() => setHoveredHospital(h)}
                onMouseLeave={() => setHoveredHospital(null)}
              >
                {/* Active Emergency Radar Waves */}
                {isPulsing && (
                  <>
                    <circle r="24" fill="#E11D48" opacity="0.15" className="animate-radar" />
                    <circle r="16" fill="#E11D48" opacity="0.3" className="animate-ping" />
                  </>
                )}

                {/* Selection Halo */}
                {isSelected && (
                  <circle
                    r="18"
                    fill="none"
                    stroke={isDark ? '#FFFFFF' : '#0F172A'}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="animate-spin-slow"
                  />
                )}

                {/* Outer Node Ring */}
                <circle
                  r="9"
                  fill={isDark ? '#1A202C' : '#FFFFFF'}
                  stroke={nodeColor}
                  strokeWidth="2.5"
                  filter={glowFilter}
                  className="transition-transform duration-200 group-hover:scale-125 shadow-sm"
                />

                {/* Inner Core */}
                <circle r="4" fill={nodeColor} />

                {/* Hospital Short Label */}
                <g transform="translate(14, 4)">
                  <rect
                    x="0"
                    y="-12"
                    width={h.shortName.length * 6.5 + 16}
                    height="18"
                    rx="4"
                    fill={isDark ? '#1A202C' : '#FFFFFF'}
                    stroke={isSelected ? (isDark ? '#FFFFFF' : '#0F172A') : isDark ? '#2D3748' : '#CBD5E1'}
                    strokeWidth={isSelected ? '1.2' : '0.8'}
                    opacity="0.95"
                    className="shadow-xs"
                  />
                  <text
                    x="8"
                    y="0"
                    fill={isDark ? '#F1F5F9' : '#0F172A'}
                    fontSize="9"
                    fontFamily="sans-serif"
                    fontWeight={isPulsing || isSelected ? '700' : '600'}
                  >
                    {h.shortName}
                  </text>
                </g>

                {/* Quick Stock Indicator Badge */}
                <g transform="translate(14, 18)">
                  <text
                    x="0"
                    y="0"
                    fill={nodeColor}
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    {h.currentStockUnits} Units • Risk: {(h.stockoutRisk72h * 100).toFixed(0)}%
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Hospital Quick Inspector Modal (Slide-in card) */}
      {selectedHospital && (
        <div className="absolute bottom-4 right-4 z-30 w-84 rounded-3xl border border-black/[0.08] dark:border-white/[0.1] bg-white/90 dark:bg-[#161820]/90 backdrop-blur-2xl p-4 shadow-[0_16px_48px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                  Level {selectedHospital.traumaLevel} Trauma
                </span>
                <span
                  className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full font-semibold ${
                    selectedHospital.status === 'emergency_active'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : selectedHospital.status === 'stockout_risk'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {selectedHospital.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2">
                {selectedHospital.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{selectedHospital.address}</p>
            </div>
            <button
              onClick={() => setSelectedHospital(null)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3.5 text-xs">
            <div className="p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.07]">
              <span className="text-[10px] text-slate-400 block font-medium">Current Stock</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">{selectedHospital.currentStockUnits} Units</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.07]">
              <span className="text-[10px] text-slate-400 block font-medium">72h Stockout Risk</span>
              <span
                className={`text-sm font-bold font-mono ${
                  selectedHospital.stockoutRisk72h >= 0.4 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {(selectedHospital.stockoutRisk72h * 100).toFixed(0)}%
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.07]">
              <span className="text-[10px] text-slate-400 block font-medium">Storage Temp</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">{selectedHospital.coldStorageTemp}°C</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.07]">
              <span className="text-[10px] text-slate-400 block font-medium">ICU Beds Free</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">{selectedHospital.icuBedsAvailable} / {selectedHospital.totalBeds}</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-black/[0.05] dark:border-white/[0.07] flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Direct ER Dispatch:</span>
            <span className="text-rose-600 dark:text-rose-400 font-mono font-medium">{selectedHospital.contactPhone}</span>
          </div>
        </div>
      )}
    </div>
  );
}
