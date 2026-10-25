'use client';

import React, { useState } from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { BiologicalResourceType, BloodGroup } from '../../lib/types';
import { Boxes, X, PlusCircle, Building2, Droplet, Thermometer, Clock } from 'lucide-react';

interface AddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBatchModal({ isOpen, onClose }: AddBatchModalProps) {
  const { hospitals, addInventoryBatch } = useVitalis();

  const [facilityId, setFacilityId] = useState<string>(hospitals[0]?.id || 'FAC-APOLLO');
  const [resourceType, setResourceType] = useState<BiologicalResourceType>('PRBC');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [units, setUnits] = useState<number>(4);
  const [tempC, setTempC] = useState<number>(3.6);
  const [chamberId, setChamberId] = useState<string>('CHAMBER-VAULT-A1');
  const [expiryDays, setExpiryDays] = useState<number>(35);
  const [anticoagulant, setAnticoagulant] = useState<string>('CPDA-1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedHosp = hospitals.find((h) => h.id === facilityId) || hospitals[0];

    addInventoryBatch({
      facilityId: selectedHosp.id,
      facilityName: selectedHosp.shortName,
      traumaLevel: selectedHosp.traumaLevel,
      resourceType,
      bloodGroup,
      unitsAvailable: Number(units) || 1,
      liveStorageTempC: Number(tempC) || 3.6,
      storageChamberId: chamberId,
      anticoagulant,
      hoursUntilExpiry: (Number(expiryDays) || 30) * 24,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#1E1F25] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-xs">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Log New Biological Batch Intake</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Register incoming donor units into regional hospital cold-chain storage vault.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Target Hospital Facility */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Target Hospital Vault</span>
            </label>
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-white/[0.1] bg-slate-50 dark:bg-[#18191E] px-3 py-2 text-xs font-sans text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:outline-none cursor-pointer"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.shortName})
                </option>
              ))}
            </select>
          </div>

          {/* Biological Resource & Blood Group */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Boxes className="w-3.5 h-3.5 text-rose-500" />
                <span>Resource Type</span>
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as BiologicalResourceType)}
                className="w-full rounded-xl border border-slate-300 dark:border-white/[0.1] bg-slate-50 dark:bg-[#18191E] px-3 py-2 text-xs font-sans text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:outline-none cursor-pointer"
              >
                <option value="PRBC">PRBC (Packed Red Cells)</option>
                <option value="Whole Blood">Whole Blood</option>
                <option value="Platelets">Platelets (Apheresis)</option>
                <option value="FFP">FFP (Fresh Frozen Plasma)</option>
                <option value="Cryoprecipitate">Cryoprecipitate</option>
                <option value="Kidney">Kidney (Transplant)</option>
                <option value="Liver">Liver (Transplant)</option>
                <option value="Heart">Heart (Transplant)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Droplet className="w-3.5 h-3.5 text-rose-500" />
                <span>Blood Group</span>
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full rounded-xl border border-slate-300 dark:border-white/[0.1] bg-slate-50 dark:bg-[#18191E] px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:outline-none cursor-pointer"
              >
                <option value="O-">O- Universal Donor</option>
                <option value="O+">O+ Positive</option>
                <option value="A-">A- Negative</option>
                <option value="A+">A+ Positive</option>
                <option value="B-">B- Negative</option>
                <option value="B+">B+ Positive</option>
                <option value="AB-">AB- Negative</option>
                <option value="AB+">AB+ Universal Plasma</option>
              </select>
            </div>
          </div>

          {/* Units Available & Storage Temp */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <span>Units Received</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={units}
                onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-300 dark:border-white/[0.1] bg-slate-50 dark:bg-[#18191E] px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Thermometer className="w-3.5 h-3.5 text-emerald-500" />
                <span>Storage Temp (°C)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="8.0"
                value={tempC}
                onChange={(e) => setTempC(parseFloat(e.target.value) || 3.6)}
                className="w-full rounded-xl border border-slate-300 dark:border-white/[0.1] bg-slate-50 dark:bg-[#18191E] px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Chamber ID & Expiry Days */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <span>Storage Chamber ID</span>
              </label>
              <input
                type="text"
                value={chamberId}
                onChange={(e) => setChamberId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-white/[0.1] bg-slate-50 dark:bg-[#18191E] px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Shelf-Life (Days)</span>
              </label>
              <input
                type="number"
                min="1"
                max="45"
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value) || 35)}
                className="w-full rounded-xl border border-slate-300 dark:border-white/[0.1] bg-slate-50 dark:bg-[#18191E] px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Anticoagulant Preset Pill Bar */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Preservation Solution
            </label>
            <div className="flex items-center gap-2">
              {['CPDA-1', 'SAGM', 'ACD-A', 'University of Wisconsin (UW)'].map((sol) => (
                <button
                  type="button"
                  key={sol}
                  onClick={() => setAnticoagulant(sol)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer ${
                    anticoagulant === sol
                      ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {sol}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer font-sans"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Intake & Generate RFID</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
