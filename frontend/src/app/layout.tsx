import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Secure OTA Guardian — Firmware Lifecycle & Fleet Resilience Platform',
  description:
    'A production-grade Secure Firmware Lifecycle & Fleet Resilience Platform with physical NXP FRDM-MCXN236 hardware demonstrator.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased selection:bg-emerald-500/20 selection:text-emerald-300 min-h-screen transition-colors duration-200"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}