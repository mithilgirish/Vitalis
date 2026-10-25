'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useVitalis } from '../../lib/store/vitalisContext';
import { VitalisLogo } from '../common/VitalisLogo';
import { HospitalSearchRoutePlanner } from './HospitalSearchRoutePlanner';
import { TomTomRouteResult } from '../../lib/services/tomtomRoutingService';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Compass,
  Route,
} from 'lucide-react';

// Dynamic import of the Leaflet Map to ensure zero SSR / window issues in Next.js
const ChennaiLeafletMap = dynamic(
  () => import('./ChennaiLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[620px] rounded-3xl flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] animate-pulse">
        <div className="p-3.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] mb-3">
          <VitalisLogo size="lg" showText={false} className="animate-pulse" />
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Loading Vitalis OpenStreetMap Leaflet Engine...
        </p>
      </div>
    ),
  }
);

export function ChennaiCommandMap() {
  const {
    hospitals,
    telemetry,
    selectedHospital,
    setSelectedHospital,
    selectedCourier,
    setSelectedCourier,
    theme,
    dispatchRouteMission,
  } = useVitalis();

  const [activeFilter, setActiveFilter] = useState<'all' | 'emergency' | 'stockout' | 'surplus'>('all');
  const [tileProvider, setTileProvider] = useState<'osm' | 'hot' | 'satellite'>('osm');
  const [showCorridors, setShowCorridors] = useState<boolean>(true);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [plannedRoute, setPlannedRoute] = useState<TomTomRouteResult | null>(null);

  const isDark = theme === 'dark';

  const handleZoomIn = () => setMapZoom((z) => Math.min(z + 1, 18));
  const handleZoomOut = () => setMapZoom((z) => Math.max(z - 1, 10));
  const handleResetZoom = () => setMapZoom(12);

  return (
    <div className="relative w-full h-[620px] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-[#F8FAFC] dark:bg-[#18191E] overflow-hidden select-none shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-colors">
      {/* Interactive OpenStreetMap Leaflet Canvas */}
      <div className="w-full h-full relative z-0">
        <ChennaiLeafletMap
          hospitals={hospitals}
          telemetry={telemetry}
          selectedHospital={selectedHospital}
          onSelectHospital={setSelectedHospital}
          selectedCourier={selectedCourier}
          onSelectCourier={setSelectedCourier}
          theme={isDark ? 'dark' : 'light'}
          activeFilter={activeFilter}
          tileProvider={tileProvider}
          showCorridors={showCorridors}
          mapZoom={mapZoom}
          plannedRoute={plannedRoute}
        />
      </div>

      {/* Top Map Controls, Hospital Search, Route Planner & Layer Filters */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto max-w-[calc(100%-80px)]">
        {/* Hospital Search & TomTom Route Planner */}
        <HospitalSearchRoutePlanner
          hospitals={hospitals}
          selectedHospital={selectedHospital}
          onSelectHospital={setSelectedHospital}
          onRouteCalculated={(route) => setPlannedRoute(route)}
          onDispatchRoute={(originId, destId, route) => dispatchRouteMission(originId, destId, route)}
        />

        {/* Node Filters & Layer Pill Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Node Filters Pill Group */}
          <div className="p-1 rounded-full flex items-center gap-1 border border-black/[0.06] dark:border-white/[0.08] bg-white/85 dark:bg-[#24262E]/85 backdrop-blur-xl shadow-sm">
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

        {/* Green Corridor Toggle Pill */}
        <button
          onClick={() => setShowCorridors(!showCorridors)}
          className={`p-1 px-3 py-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-xl flex items-center gap-1.5 text-xs font-medium transition-all shadow-sm cursor-pointer ${
            showCorridors
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold'
              : 'bg-white/85 dark:bg-[#24262E]/85 text-slate-500 dark:text-slate-400'
          }`}
          title="Toggle Chennai Emergency Medical Green Corridors"
        >
          <Route className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Green Corridors</span>
        </button>

        {/* OpenStreetMap Layer Provider Dropdown Pill - 100% Free, Zero API Key */}
        <div className="p-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-white/85 dark:bg-[#24262E]/85 backdrop-blur-xl flex items-center gap-1 shadow-sm">
          <Layers className="w-3.5 h-3.5 ml-2 text-slate-400" />
          <button
            onClick={() => setTileProvider('osm')}
            className={`px-3 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
              tileProvider === 'osm'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Standard OpenStreetMap (100% Free, Zero API Key)"
          >
            OSM Standard
          </button>
          <button
            onClick={() => setTileProvider('hot')}
            className={`px-3 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
              tileProvider === 'hot'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Humanitarian OpenStreetMap for Medical Logistics (100% Free, Zero API Key)"
          >
            Humanitarian
          </button>
          <button
            onClick={() => setTileProvider('satellite')}
            className={`px-3 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
              tileProvider === 'satellite'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="High-Resolution Satellite Imagery"
          >
            Satellite
          </button>
        </div>
      </div>
    </div>

      {/* Map Zoom & Compass Controls (Top Right) - Floating Dock */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="p-1 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/85 dark:bg-[#24262E]/85 backdrop-blur-xl flex flex-col items-center shadow-sm">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px w-4 bg-black/[0.06] dark:bg-white/[0.08] my-0.5" />
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px w-4 bg-black/[0.06] dark:bg-white/[0.08] my-0.5" />
          <button
            onClick={handleResetZoom}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Reset Chennai View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compass Indicator */}
        <div className="p-2 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/85 dark:bg-[#24262E]/85 backdrop-blur-xl flex flex-col items-center justify-center shadow-sm">
          <Compass className="w-4 h-4 text-[#FF375F] dark:text-[#FF453A]" />
          <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-0.5">N</span>
        </div>
      </div>

      {/* Map Legend (Bottom Left) - Apple Frosted Panel */}
      <div className="absolute bottom-4 left-4 z-20 p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/85 dark:bg-[#24262E]/85 backdrop-blur-xl text-[11px] font-sans space-y-2 shadow-sm pointer-events-auto">
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
        {showCorridors && (
          <div className="flex items-center gap-2 pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
            <span className="h-1 w-5 bg-emerald-600 rounded-full" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Green Corridor Active</span>
          </div>
        )}
      </div>

      {/* Selected Hospital Quick Inspector Modal (Slide-in card) */}
      {selectedHospital && (
        <div className="absolute bottom-4 right-4 z-30 w-84 rounded-3xl border border-black/[0.08] dark:border-white/[0.1] bg-white/95 dark:bg-[#24262E]/95 backdrop-blur-2xl p-4 shadow-[0_16px_48px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
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

      {/* Vitalis Brand Watermark Pill (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden sm:block">
        <div className="px-3 py-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-white/85 dark:bg-[#24262E]/85 backdrop-blur-xl flex items-center gap-2 shadow-xs">
          <VitalisLogo size="sm" showText={false} />
          <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-600 dark:text-slate-300">
            VITALIS MEDICAL GRID
          </span>
        </div>
      </div>
    </div>
  );
}
