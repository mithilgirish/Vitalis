'use client';

import React from 'react';
import { KpiOverlayCards } from '../../components/dashboard/KpiOverlayCards';
import { ChennaiCommandMap } from '../../components/dashboard/ChennaiCommandMap';
import { CourierDetailModal } from '../../components/dashboard/CourierDetailModal';
import { Activity, ShieldCheck, MapPin, Truck } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      {/* Floating KPI Cards Layer */}
      <KpiOverlayCards />

      {/* Regional Map Main Canvas Container */}
      <div className="relative">
        <ChennaiCommandMap />
      </div>

      {/* Courier Inspector Modal (Active when courier is selected) */}
      <CourierDetailModal />
    </div>
  );
}
