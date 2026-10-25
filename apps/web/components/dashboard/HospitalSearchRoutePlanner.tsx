'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Hospital } from '../../lib/types';
import {
  searchHospitals,
  calculateTomTomRoute,
  getTomTomApiKey,
  setTomTomApiKey,
  HospitalSearchResult,
  TomTomRouteResult,
} from '../../lib/services/tomtomRoutingService';
import {
  Search,
  Route,
  Navigation,
  Clock,
  ArrowRightLeft,
  Key,
  Droplet,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Truck,
  ExternalLink,
} from 'lucide-react';

interface HospitalSearchRoutePlannerProps {
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital | null) => void;
  onRouteCalculated?: (route: TomTomRouteResult | null) => void;
  onDispatchRoute?: (originId: string, destId: string, route: TomTomRouteResult) => void;
}

export function HospitalSearchRoutePlanner({
  hospitals,
  selectedHospital,
  onSelectHospital,
  onRouteCalculated,
  onDispatchRoute,
}: HospitalSearchRoutePlannerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tomTomKeyInput, setTomTomKeyInput] = useState(() =>
    typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_TOMTOM_API_KEY || process.env.TOMTOM_API_KEY)
      ? (process.env.NEXT_PUBLIC_TOMTOM_API_KEY || process.env.TOMTOM_API_KEY || '')
      : ''
  );
  const [keyStatus, setKeyStatus] = useState<'idle' | 'valid' | 'testing' | 'invalid'>(() =>
    typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_TOMTOM_API_KEY || process.env.TOMTOM_API_KEY)
      ? 'valid'
      : 'idle'
  );

  // Sync client-side saved TomTom API key from localStorage after hydration
  useEffect(() => {
    const key = getTomTomApiKey();
    if (key) {
      setTomTomKeyInput(key);
      setKeyStatus('valid');
    }
  }, []);

  // Route Planning State
  const [originHospitalId, setOriginHospitalId] = useState<string>('FAC-RBTC');
  const [selectedDestId, setSelectedDestId] = useState<string>('FAC-APOLLO');
  const [routingEngine, setRoutingEngine] = useState<'tomtom' | 'dijkstra' | 'osrm'>('tomtom');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [activeRouteResult, setActiveRouteResult] = useState<TomTomRouteResult | null>(null);
  const [showTurnByTurn, setShowTurnByTurn] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Effective destination prioritizes explicitly chosen destination, then selected hospital on map
  const destHospitalId = selectedHospital?.id || selectedDestId;

  // Filter / Search hospitals
  const searchResults = useMemo(() => {
    return searchHospitals(searchQuery, hospitals);
  }, [searchQuery, hospitals]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trigger route calculation
  const handleCalculateRoute = async (
    customOriginId?: string,
    customDestId?: string,
    engineOverride?: 'tomtom' | 'dijkstra' | 'osrm'
  ) => {
    const origId = customOriginId || originHospitalId;
    const dstId = customDestId || destHospitalId;
    const engine = engineOverride || routingEngine;

    const originHosp = hospitals.find((h) => h.id === origId) || hospitals[0];
    const destHosp = hospitals.find((h) => h.id === dstId) || hospitals[1];

    if (!originHosp || !destHosp) return;

    setIsCalculatingRoute(true);
    try {
      const res = await calculateTomTomRoute(
        [originHosp.lat, originHosp.lng],
        [destHosp.lat, destHosp.lng],
        originHosp.shortName,
        destHosp.shortName,
        origId,
        dstId,
        engine
      );
      setActiveRouteResult(res);
      if (onRouteCalculated) {
        onRouteCalculated(res);
      }
    } catch (err) {
      console.error('Failed to calculate route:', err);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Swap origin and destination
  const handleSwapRoute = () => {
    const prevOrigin = originHospitalId;
    const prevDest = destHospitalId;
    setOriginHospitalId(prevDest);
    setSelectedDestId(prevOrigin);
    handleCalculateRoute(prevDest, prevOrigin);
  };

  // Test and save TomTom API key
  const handleSaveApiKey = async () => {
    if (!tomTomKeyInput.trim()) {
      setTomTomApiKey('');
      setKeyStatus('idle');
      setIsKeyModalOpen(false);
      return;
    }

    setKeyStatus('testing');
    try {
      const testUrl = `https://api.tomtom.com/routing/1/calculateRoute/13.0827,80.2707:13.0567,80.2505/json?key=${tomTomKeyInput.trim()}`;
      const res = await fetch(testUrl);
      if (res.ok) {
        setTomTomApiKey(tomTomKeyInput.trim());
        setKeyStatus('valid');
        setTimeout(() => setIsKeyModalOpen(false), 800);
      } else {
        setKeyStatus('invalid');
      }
    } catch {
      setKeyStatus('invalid');
    }
  };

  const handleSelectHospitalFromSearch = (result: HospitalSearchResult) => {
    const fullHospital = hospitals.find((h) => h.id === result.id);
    if (fullHospital) {
      onSelectHospital(fullHospital);
      setSelectedDestId(fullHospital.id);
    }
    setSearchQuery(result.name);
    setIsSearchOpen(false);
  };

  const handleRouteToHospital = (result: HospitalSearchResult) => {
    const fullHospital = hospitals.find((h) => h.id === result.id);
    if (fullHospital) {
      onSelectHospital(fullHospital);
    }
    setSelectedDestId(result.id);
    setIsSearchOpen(false);
    setIsPlannerOpen(true);
    handleCalculateRoute(originHospitalId, result.id);
  };

  return (
    <div className="relative z-30 flex flex-col gap-2 pointer-events-auto">
      {/* 1. Main Search & Route Action Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Hospital Search Input Pill */}
        <div ref={searchContainerRef} className="relative">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white/90 dark:bg-[#1E2026]/90 backdrop-blur-xl shadow-sm hover:border-black/20 dark:hover:border-white/20 transition-all w-72 sm:w-84">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search hospital (Apollo, Fortis...)"
              className="w-full text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Hospital Search Typeahead Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-84 sm:w-96 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white/95 dark:bg-[#1E2026]/95 backdrop-blur-2xl shadow-xl overflow-hidden p-1.5 max-h-80 overflow-y-auto animate-in fade-in duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>Chennai Hospital Network ({searchResults.length})</span>
                <span className="text-[9px] font-normal text-blue-500">Live Geo-Search</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No matching medical facilities found. Try searching &quot;Apollo&quot;, &quot;Fortis&quot;, or &quot;Stanley&quot;.
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((hosp) => (
                    <div
                      key={hosp.id}
                      className="group p-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div
                        onClick={() => handleSelectHospitalFromSearch(hosp)}
                        className="flex-1 min-w-0 pr-2"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {hosp.name}
                          </span>
                          {hosp.isRegisteredHospital && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                              L{hosp.traumaLevel || 1}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {hosp.area} &bull; {hosp.address}
                        </p>
                        {hosp.currentStockUnits !== undefined && (
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-0.5 text-rose-500">
                              <Droplet className="w-3 h-3" />
                              {hosp.currentStockUnits} Units
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quick Route Shortcut */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRouteToHospital(hosp);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm shrink-0 cursor-pointer active:scale-95 transition-all"
                        title="Route to this hospital"
                      >
                        <Route className="w-3 h-3" />
                        <span>Route</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Route Planner Toggle Button */}
        <button
          onClick={() => {
            setIsPlannerOpen(!isPlannerOpen);
            if (!isPlannerOpen && !activeRouteResult) {
              handleCalculateRoute();
            }
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
            isPlannerOpen
              ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
              : 'border-black/[0.08] dark:border-white/[0.1] bg-white/90 dark:bg-[#1E2026]/90 text-slate-700 dark:text-slate-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Hospital Route Planner</span>
          {isPlannerOpen ? (
            <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
          )}
        </button>

        {/* TomTom API Key & Routing Config Button */}
        <button
          onClick={() => setIsKeyModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all cursor-pointer shadow-sm ${
            keyStatus === 'valid'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'border-black/[0.08] dark:border-white/[0.1] bg-white/90 dark:bg-[#1E2026]/90 text-slate-600 dark:text-slate-400'
          }`}
          title="TomTom Routing API Settings"
        >
          <Key className="w-3.5 h-3.5 text-blue-500" />
          <span>{keyStatus === 'valid' ? 'TomTom Live Active' : 'TomTom / Dijkstra Engine'}</span>
        </button>
      </div>

      {/* 2. Expandable Hospital Route Planner Drawer */}
      {isPlannerOpen && (
        <div className="w-full max-w-xl rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white/95 dark:bg-[#1E2026]/95 backdrop-blur-2xl shadow-xl p-4 space-y-3.5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Route className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Hospital-to-Hospital Road Routing
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  TomTom Real-Time Traffic &bull; Dijkstra Shortest Path &bull; Turn-by-Turn Waypoints
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Engine Selector Pills */}
              <div className="p-0.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.05] flex items-center gap-1 text-[10px]">
                <button
                  onClick={() => {
                    setRoutingEngine('tomtom');
                    handleCalculateRoute(undefined, undefined, 'tomtom');
                  }}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                    routingEngine === 'tomtom'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  TomTom
                </button>
                <button
                  onClick={() => {
                    setRoutingEngine('dijkstra');
                    handleCalculateRoute(undefined, undefined, 'dijkstra');
                  }}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                    routingEngine === 'dijkstra'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Dijkstra
                </button>
              </div>

              <button
                onClick={() => setIsPlannerOpen(false)}
                className="p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Origin & Destination Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-2 items-center">
            {/* Origin Hospital Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Origin (Dispatch Facility):
              </label>
              <select
                value={originHospitalId}
                onChange={(e) => {
                  setOriginHospitalId(e.target.value);
                  handleCalculateRoute(e.target.value, destHospitalId);
                }}
                className="w-full text-xs font-medium rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#15161A] text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {hospitals.map((h) => (
                  <option key={`origin-${h.id}`} value={h.id}>
                    {h.shortName} ({h.area})
                  </option>
                ))}
              </select>
            </div>

            {/* Invert Button */}
            <div className="flex justify-center pt-3 sm:pt-4">
              <button
                onClick={handleSwapRoute}
                className="p-2 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-blue-500/10 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="Swap Origin and Destination"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Destination Hospital Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Destination (Receiving Hospital):
              </label>
              <select
                value={destHospitalId}
                onChange={(e) => {
                  setSelectedDestId(e.target.value);
                  const hosp = hospitals.find((h) => h.id === e.target.value);
                  if (hosp) onSelectHospital(hosp);
                  handleCalculateRoute(originHospitalId, e.target.value);
                }}
                className="w-full text-xs font-medium rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#15161A] text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {hospitals.map((h) => (
                  <option key={`dest-${h.id}`} value={h.id}>
                    {h.shortName} ({h.area})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Route Metrics Card */}
          {activeRouteResult && (
            <div className="p-3 rounded-xl bg-blue-500/[0.05] dark:bg-blue-500/[0.08] border border-blue-500/20 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    {isCalculatingRoute ? 'Calculating Route...' : activeRouteResult.engineLabel}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {activeRouteResult.originName} ➔ {activeRouteResult.destinationName}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    activeRouteResult.congestionLevel === 'heavy'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : activeRouteResult.congestionLevel === 'moderate'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {activeRouteResult.congestionLevel === 'heavy'
                    ? 'Heavy Traffic'
                    : activeRouteResult.congestionLevel === 'moderate'
                    ? 'Moderate Traffic'
                    : 'Clear Corridor'}
                </span>
              </div>

              {/* KPIs Row */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="p-2 rounded-lg bg-white/70 dark:bg-black/30 border border-black/5 dark:border-white/5">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">
                    Road Distance
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {activeRouteResult.totalDistanceKm} km
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white/70 dark:bg-black/30 border border-black/5 dark:border-white/5">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">
                    Transit Time
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    ~{activeRouteResult.estimatedMinutes} mins
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white/70 dark:bg-black/30 border border-black/5 dark:border-white/5">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">
                    GPS Waypoints
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <Navigation className="w-3.5 h-3.5" />
                    {activeRouteResult.waypoints.length} pts
                  </span>
                </div>
              </div>

              {/* Turn-by-Turn Instruction Toggle */}
              {activeRouteResult.instructions && activeRouteResult.instructions.length > 0 && (
                <div className="pt-1">
                  <button
                    onClick={() => setShowTurnByTurn(!showTurnByTurn)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showTurnByTurn ? 'Hide' : 'View'} Turn-by-Turn Maneuvers ({activeRouteResult.instructions.length} steps)</span>
                    {showTurnByTurn ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {showTurnByTurn && (
                    <div className="mt-2 space-y-1 max-h-36 overflow-y-auto p-2 rounded-lg bg-white/50 dark:bg-black/20 text-[11px] font-sans">
                      {activeRouteResult.instructions.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 py-0.5 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0">
                          <span className="font-mono text-[10px] text-slate-400">{idx + 1}.</span>
                          <span className="text-slate-800 dark:text-slate-200">{step.instruction}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action: Dispatch on Route */}
              <div className="pt-2 flex items-center justify-between border-t border-blue-500/15">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Ready to deploy emergency vehicle via this computed path
                </span>
                <button
                  onClick={() => {
                    if (onDispatchRoute) {
                      onDispatchRoute(originHospitalId, destHospitalId, activeRouteResult);
                    }
                  }}
                  className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Assign Vehicle to Route</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TomTom API Key Settings Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#1C1D22] shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    TomTom Routing Engine Settings
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Real-time traffic calculation & hospital POI search
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                Vitalis supports live <strong>TomTom Traffic Routing & Search APIs</strong> for dynamic road travel time calculation and hospital search.
              </p>
              <div className="p-3 rounded-xl bg-blue-500/[0.06] border border-blue-500/20 text-[11px] space-y-1">
                <p className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Built-in Dijkstra Heuristic Included:
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Even without a TomTom key, Vitalis automatically runs our offline Chennai road graph Dijkstra engine with zero external dependencies.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                TomTom Developer API Key:
              </label>
              <input
                type="text"
                value={tomTomKeyInput}
                onChange={(e) => setTomTomKeyInput(e.target.value)}
                placeholder="Paste your TomTom API key here"
                className="w-full text-xs font-mono rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span>Free tier: 2,500 free requests/day</span>
                <a
                  href="https://developer.tomtom.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline flex items-center gap-0.5"
                >
                  developer.tomtom.com
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {keyStatus === 'valid' && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>TomTom API Key verified and active!</span>
              </div>
            )}

            {keyStatus === 'invalid' && (
              <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Invalid API key or network unreachable. Check key and retry.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] rounded-full transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={keyStatus === 'testing'}
                className="px-5 py-2 text-xs font-semibold rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
              >
                {keyStatus === 'testing' ? 'Testing Key...' : 'Save & Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
