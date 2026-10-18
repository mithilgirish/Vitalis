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
    let aVal = a[sortField];
    let bVal = b[sortField];
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
      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#2D3748] bg-white dark:bg-[#1A202C] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Batch UUID, Facility, Blood Group..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-colors shadow-xs"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Resource Filter */}
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:outline-none shadow-xs"
          >
            <option value="all">All Resources</option>
            <option value="PRBC">PRBC</option>
            <option value="Whole Blood">Whole Blood</option>
            <option value="Platelets">Platelets</option>
            <option value="FFP">FFP</option>
            <option value="Cryoprecipitate">Cryoprecipitate</option>
            <option value="Kidney">Kidney</option>
          </select>

          {/* Blood Group Filter */}
          <select
            value={selectedBloodGroup}
            onChange={(e) => setSelectedBloodGroup(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:outline-none shadow-xs"
          >
            <option value="all">All Blood Groups</option>
            <option value="O-">O- Negative</option>
            <option value="O+">O+ Positive</option>
            <option value="A-">A- Negative</option>
            <option value="A+">A+ Positive</option>
            <option value="B-">B- Negative</option>
            <option value="B+">B+ Positive</option>
            <option value="AB-">AB- Negative</option>
            <option value="AB+">AB+ Positive</option>
          </select>

          {/* Quick Alert Filters */}
          <button
            onClick={() =>
              setSelectedAlertFilter(selectedAlertFilter === 'expiring' ? 'all' : 'expiring')
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              selectedAlertFilter === 'expiring'
                ? 'border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-500/20 dark:text-amber-300 font-semibold shadow-xs'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>&lt; 24h Expiry</span>
          </button>

          <button
            onClick={() =>
              setSelectedAlertFilter(selectedAlertFilter === 'thermal' ? 'all' : 'thermal')
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              selectedAlertFilter === 'thermal'
                ? 'border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-500 dark:bg-rose-500/20 dark:text-rose-300 font-semibold shadow-xs'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span>Thermal Warning</span>
          </button>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#2D3748] bg-white dark:bg-[#1A202C] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 select-none font-semibold">
                <th
                  onClick={() => handleSort('batchUuid')}
                  className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Batch UUID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('facilityName')}
                  className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Facility Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3.5">Trauma Level</th>
                <th className="p-3.5">Resource Type</th>
                <th className="p-3.5">Blood Group</th>
                <th
                  onClick={() => handleSort('unitsAvailable')}
                  className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Units</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('liveStorageTempC')}
                  className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Live Temp (°C)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('hoursUntilExpiry')}
                  className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Expiration Countdown</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {sortedBatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-mono">
                    No biological inventory batches match the specified filter criteria.
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
                      className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                        isThermalCritical
                          ? 'bg-rose-50/70 dark:bg-rose-950/20'
                          : isExpiringWithin24h
                          ? 'bg-amber-50/60 dark:bg-amber-950/15'
                          : ''
                      }`}
                    >
                      {/* Batch UUID */}
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        <span className="bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 shadow-2xs">
                          {batch.batchUuid}
                        </span>
                      </td>

                      {/* Facility Name */}
                      <td className="p-3.5 font-sans font-medium text-slate-900 dark:text-slate-100">
                        {batch.facilityName}
                      </td>

                      {/* Trauma Level */}
                      <td className="p-3.5">
                        <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 font-semibold">
                          Level {batch.traumaLevel}
                        </span>
                      </td>

                      {/* Resource Type */}
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium font-sans">
                        {batch.resourceType}
                      </td>

                      {/* Blood Group */}
                      <td className="p-3.5">
                        <span className="font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                          {batch.bloodGroup}
                        </span>
                      </td>

                      {/* Units Available */}
                      <td className="p-3.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {batch.unitsAvailable}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">units</span>
                      </td>

                      {/* Live Storage Temp (°C) */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold ${
                              isThermalCritical
                                ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/25 dark:text-rose-300 dark:border-rose-500/50 animate-pulse'
                                : isThermalWarning
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                            }`}
                          >
                            <Thermometer className="w-3.5 h-3.5" />
                            <span>{batch.liveStorageTempC.toFixed(1)}°C</span>
                          </span>
                          {isThermalCritical && (
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              EXCURSION
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Expiration Countdown */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold ${
                              isExpiringWithin24h
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/25 dark:text-amber-300 dark:border-amber-500/50 animate-pulse'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>{formatHoursRemaining(batch.hoursUntilExpiry)}</span>
                          </span>
                          {isExpiringWithin24h && (
                            <span className="text-[9px] uppercase font-bold text-amber-700 dark:text-amber-400">
                              EXPIRING SOON
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setInspectedBatch(batch)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
                          title="Inspect batch IoT telemetry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span>Showing {sortedBatches.length} of {inventory.length} biological batches</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">RFID Chambers: 100% Synchronized</span>
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
