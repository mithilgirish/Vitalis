import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/store/authContext';
import { VitalisProvider } from '../lib/store/vitalisContext';
import { AppShell } from '../components/layout/AppShell';

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
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-50 dark:bg-[#18191E] text-slate-900 dark:text-slate-100 selection:bg-rose-500/20 selection:text-rose-600 dark:selection:text-rose-200"
      >
        <AuthProvider>
          <VitalisProvider>
            <AppShell>{children}</AppShell>
          </VitalisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
