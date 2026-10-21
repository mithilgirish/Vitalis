'use client';

import React, { useState } from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { InventoryBatch, BiologicalResourceType, BloodGroup } from '../../lib/types';
import { formatHoursRemaining } from '../../lib/utils';
import { BatchDetailModal } from './BatchDetailModal';
import {
  Search,
  Filter,
  Thermometer,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Boxes,
  ArrowUpDown,
  CheckCircle,
  Eye,
} from 'lucide-react';

export function InventoryTable() {
  const { inventory } = useVitalis();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState<string>('all');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');
  const [selectedAlertFilter, setSelectedAlertFilter] = useState<'all' | 'expiring' | 'thermal'>('all');
  const [inspectedBatch, setInspectedBatch] = useState<InventoryBatch | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<keyof InventoryBatch>('hoursUntilExpiry');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: keyof InventoryBatch) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter batches
  const filteredBatches = inventory.filter((b) => {
    const searchMatch =
      b.batchUuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.resourceType.toLowerCase().includes(searchTerm.toLowerCase());
    if (!searchMatch) return false;

    if (selectedResource !== 'all' && b.resourceType !== selectedResource) return false;
    if (selectedBloodGroup !== 'all' && b.bloodGroup !== selectedBloodGroup) return false;

    if (selectedAlertFilter === 'expiring' && b.hoursUntilExpiry >= 24) return false;
    if (selectedAlertFilter === 'thermal' && b.tempStatus === 'safe') return false;

    return true;
  });

  // Sort batches
  const sortedBatches = [...filteredBatches].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'string') {
      return sortAsc
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }
    return sortAsc
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar - Apple / Google Clean Pill Bar */}
      <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#222329]/80 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        {/* Search Input - Apple Spotlight Style */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Batch ID, Hospital, Blood Type..."
            className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] pl-10 pr-4 py-2 text-xs font-sans text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#0071E3] dark:focus:border-[#0A84FF] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 transition-all shadow-inner-xs"
          />
        </div>

        {/* Dropdown Filters & Segmented Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Resource Filter */}
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:border-[#0071E3] focus:outline-none cursor-pointer transition-colors shadow-2xs"
          >
            <option value="all">All Resources</option>
            <option value="PRBC">PRBC (Packed Red Cells)</option>
            <option value="Whole Blood">Whole Blood</option>
            <option value="Platelets">Platelets</option>
            <option value="FFP">FFP (Fresh Frozen Plasma)</option>
            <option value="Cryoprecipitate">Cryoprecipitate</option>
            <option value="Kidney">Kidney</option>
          </select>

          {/* Blood Group Filter */}
          <select
            value={selectedBloodGroup}
            onChange={(e) => setSelectedBloodGroup(e.target.value)}
            className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:border-[#0071E3] focus:outline-none cursor-pointer transition-colors shadow-2xs"
          >
            <option value="all">All Blood Groups</option>
            <option value="O-">O- Universal Donor</option>
            <option value="O+">O+ Positive</option>
            <option value="A-">A- Negative</option>
            <option value="A+">A+ Positive</option>
            <option value="B-">B- Negative</option>
            <option value="B+">B+ Positive</option>
            <option value="AB-">AB- Negative</option>
            <option value="AB+">AB+ Universal Plasma</option>
          </select>

          {/* Quick Alert Filter Pills */}
          <button
            onClick={() =>
              setSelectedAlertFilter(selectedAlertFilter === 'expiring' ? 'all' : 'expiring')
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              selectedAlertFilter === 'expiring'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold shadow-xs ring-1 ring-amber-500/20'
                : 'border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>&lt; 24h Expiry</span>
          </button>

          <button
            onClick={() =>
              setSelectedAlertFilter(selectedAlertFilter === 'thermal' ? 'all' : 'thermal')
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              selectedAlertFilter === 'thermal'
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold shadow-xs ring-1 ring-rose-500/20'
                : 'border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span>Thermal Alert</span>
          </button>
        </div>
      </div>

      {/* Main Ledger Table - Apple Numbers / Google Cloud Minimalist Aesthetic */}
      <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-[#222329]/90 backdrop-blur-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="border-b border-black/[0.05] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none font-semibold">
                <th
                  onClick={() => handleSort('batchUuid')}
                  className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Batch ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('facilityName')}
                  className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Hospital</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">Trauma Level</th>
                <th className="p-3.5">Resource</th>
                <th className="p-3.5">Blood Group</th>
                <th
                  onClick={() => handleSort('unitsAvailable')}
                  className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Units</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('liveStorageTempC')}
                  className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Storage Temp</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('hoursUntilExpiry')}
                  className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Viability Expiry</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
              {sortedBatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-400 font-mono text-xs">
                    No biological inventory batches match the specified criteria.
                  </td>
                </tr>
              ) : (
                sortedBatches.map((batch) => {
                  const isExpiringWithin24h = batch.hoursUntilExpiry < 24;
                  const isThermalCritical =
                    batch.tempStatus === 'critical' ||
                    (batch.resourceType === 'PRBC' && batch.liveStorageTempC > 5.0);
                  const isThermalWarning =
                    batch.tempStatus === 'warning' && !isThermalCritical;

                  return (
                    <tr
                      key={batch.batchUuid}
                      className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors ${
                        isThermalCritical
                          ? 'bg-rose-500/[0.05] dark:bg-rose-500/[0.08]'
                          : isExpiringWithin24h
                          ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.06]'
                          : ''
                      }`}
                    >
                      {/* Batch UUID */}
                      <td className="p-3.5 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <span className="bg-black/[0.03] dark:bg-white/[0.05] px-2 py-1 rounded-lg border border-black/[0.05] dark:border-white/[0.07]">
                          {batch.batchUuid}
                        </span>
                      </td>

                      {/* Facility Name */}
                      <td className="p-3.5 font-medium text-slate-900 dark:text-slate-100">
                        {batch.facilityName}
                      </td>

                      {/* Trauma Level */}
                      <td className="p-3.5">
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                          Level {batch.traumaLevel}
                        </span>
                      </td>

                      {/* Resource Type */}
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {batch.resourceType}
                      </td>

                      {/* Blood Group */}
                      <td className="p-3.5">
                        <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono">
                          {batch.bloodGroup}
                        </span>
                      </td>

                      {/* Units Available */}
                      <td className="p-3.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {batch.unitsAvailable}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">units</span>
                      </td>

                      {/* Live Storage Temp (°C) */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span
                            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs ${
                              isThermalCritical
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse'
                                : isThermalWarning
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            <Thermometer className="w-3.5 h-3.5" />
                            <span>{batch.liveStorageTempC.toFixed(1)}°C</span>
                          </span>
                          {isThermalCritical && (
                            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">
                              EXCURSION
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Expiration Countdown */}
                      <td className="p-3.5 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-xs ${
                              isExpiringWithin24h
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse'
                                : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>{formatHoursRemaining(batch.hoursUntilExpiry)}</span>
                          </span>
                          {isExpiringWithin24h && (
                            <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400">
                              EXPIRING SOON
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setInspectedBatch(batch)}
                          className="p-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs hover:scale-105"
                          title="Inspect batch telemetry"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer - Clean Apple Ledger Status Bar */}
        <div className="px-4 py-3 bg-black/[0.015] dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-sans">Showing {sortedBatches.length} of {inventory.length} biological batches</span>
          <div className="flex items-center gap-1.5 font-sans">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">RFID Smart Vaults Synchronized</span>
          </div>
        </div>
      </div>

      {/* Batch Detail Modal */}
      <BatchDetailModal
        batch={inspectedBatch}
        onClose={() => setInspectedBatch(null)}
      />
    </div>
  );
}
