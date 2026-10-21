import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { VitalisProvider } from '../lib/store/vitalisContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { TriageSimulatorDrawer } from '../components/triage/TriageSimulatorDrawer';
import { ToastContainer } from '../components/common/ToastContainer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Vitalis — Agentic Clinical Supply Chain Network',
  description:
    'Autonomous, predictive clinical supply chain network for blood, organ, and critical biological redistribution across Chennai regional medical infrastructure.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#18191E] text-slate-900 dark:text-slate-100 selection:bg-rose-500/20 selection:text-rose-600 dark:selection:text-rose-200">
        <VitalisProvider>
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
        </VitalisProvider>
      </body>
    </html>
  );
}
