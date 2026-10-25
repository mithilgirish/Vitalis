'use client';

import React from 'react';
import { useAuth } from '../../lib/store/authContext';
import { AuthScreen } from '../auth/AuthScreen';
import { UserProfileModal } from '../auth/UserProfileModal';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TriageSimulatorDrawer } from '../triage/TriageSimulatorDrawer';
import { ToastContainer } from '../common/ToastContainer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      {/* Main Interface Layout */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Left Collapsible Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-[#18191E]">
            <div className="max-w-[1920px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Slide-over Triage Simulator Drawer (Operator Console) */}
      <TriageSimulatorDrawer />

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* User Profile & Role Permissions Modal */}
      <UserProfileModal />
    </>
  );
}
