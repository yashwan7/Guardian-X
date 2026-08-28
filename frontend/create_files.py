import os
import json

base_dir = '/Users/yashwanth/Documents/GARDIAN X OTA/frontend'

files = {
    'package.json': r'''{
  "name": "guardian-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.45.4",
    "@supabase/ssr": "^0.5.1",
    "zustand": "^4.5.5",
    "@stomp/stompjs": "^7.0.0",
    "sockjs-client": "^1.6.1",
    "lucide-react": "^0.447.0",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "@types/node": "^22.7.5",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@types/sockjs-client": "^1.5.4",
    "tailwindcss": "^3.4.14",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "14.2.5"
  }
}''',

    'next.config.ts': r'''import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;''',

    'tailwind.config.ts': r'''import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
};

export default config;''',

    'tsconfig.json': r'''{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {"@/*": ["./src/*"]}
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}''',

    'postcss.config.js': r'''module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };''',

    '.env.local.example': r'''NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080''',

    'src/types/index.ts': r'''export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'UPDATING' | 'FAILED' | 'SAFE_MODE' | 'RECOVERING';
export type UpdateState = 'IDLE' | 'UPDATE_PENDING' | 'DOWNLOADING' | 'VERIFYING' | 'INSTALLING' | 'REBOOTING' | 'HEALTH_CHECK' | 'CONFIRMED' | 'FAILED' | 'ROLLBACK' | 'SAFE_MODE' | 'RECOVERY_PENDING' | 'RECOVERY_APPROVED' | 'RECOVERING';
export type ActiveBank = 'A' | 'B';
export type LEDColor = 'GREEN' | 'YELLOW' | 'BLUE' | 'RED' | 'OFF';
export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FirmwareType = 'STABLE' | 'BROKEN' | 'SECURITY_PATCH' | 'BETA';
export type FirmwareStatus = 'DRAFT' | 'APPROVED' | 'QUARANTINED' | 'DEPRECATED';
export type SignatureStatus = 'SIGNED' | 'UNSIGNED' | 'INVALID';

export interface Device {
  id?: string;
  deviceId: string;
  name: string;
  status: DeviceStatus;
  firmwareVersion: string;
  activeBank: ActiveBank;
  inactiveBank: ActiveBank;
  bankAFirmware: string;
  bankBFirmware: string | null;
  health: number;
  led: LEDColor;
  oledLines: string[];
  pirMotion: boolean;
  radarDistance: number;
  safeMode: boolean;
  watchdogHealthy: boolean;
  heartbeat: boolean;
  uptime: number;
  lastSeen: string;
  updateState: UpdateState;
  rollbackCount: number;
  targetHardware: string;
  isSimulated: boolean;
}

export interface FirmwareRelease {
  id: string;
  name: string;
  version: string;
  type: FirmwareType;
  sha256: string;
  signatureStatus: SignatureStatus;
  targetHardware: string;
  minimumBootloader: string;
  status: FirmwareStatus;
  createdAt: string;
  deploymentCount: number;
  description: string;
  healthGatePasses: boolean;
  isBreakingDemo: boolean;
}

export interface FleetSummary {
  totalDevices: number;
  healthy: number;
  updating: number;
  failed: number;
  safeMode: number;
  offline: number;
  recovering: number;
  activeFirmware: string;
  rollbackCount: number;
  securityEvents: number;
}

export interface DeviceEvent {
  id: string;
  deviceId: string;
  eventType: string;
  severity: EventSeverity;
  message: string;
  timestamp: string;
}

export interface TelemetryPayload {
  deviceId: string;
  timestamp: string;
  firmwareVersion: string;
  activeBank: ActiveBank;
  health: number;
  led: LEDColor;
  pirMotion: boolean;
  radarDistance: number;
  safeMode: boolean;
  watchdogHealthy: boolean;
  heartbeat: boolean;
  uptime: number;
  updateState: UpdateState;
  oledLines: string[];
}''',

    'src/lib/supabase/client.ts': r'''import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}''',

    'src/lib/supabase/server.ts': r'''import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}''',

    'src/lib/api/client.ts': r'''import { createClient } from '@/lib/supabase/client';
import type { Device, FirmwareRelease, FleetSummary, DeviceEvent } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // Not authenticated or Supabase not configured
  }
  return {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(options?.headers as Record<string, string> || {}),
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((error as { error?: string }).error || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; version: string; timestamp: string }>('/api/health'),
  devices: {
    list: () => request<Device[]>('/api/devices'),
    get: (deviceId: string) => request<Device>(`/api/devices/${deviceId}`),
  },
  fleet: {
    summary: () => request<FleetSummary>('/api/fleet/summary'),
  },
  firmware: {
    list: () => request<FirmwareRelease[]>('/api/firmware'),
    get: (id: string) => request<FirmwareRelease>(`/api/firmware/${id}`),
  },
  deployments: {
    create: (data: { firmwareReleaseId: string; deviceId: string }) =>
      request<unknown>('/api/deployments', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request<unknown[]>('/api/deployments'),
  },
  events: {
    list: () => request<DeviceEvent[]>('/api/events'),
    security: () => request<unknown[]>('/api/events/security'),
  },
};''',

    'src/lib/websocket/client.ts': r''''use client';

type MessageHandler = (data: unknown) => void;

class GuardianWebSocket {
  private client: import('@stomp/stompjs').Client | null = null;
  private subscriptionHandlers: Map<string, MessageHandler[]> = new Map();
  private _connected = false;

  async connect(onConnect?: () => void, onError?: () => void) {
    if (typeof window === 'undefined') return;
    
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080';
    
    const { Client } = await import('@stomp/stompjs');
    const SockJS = (await import('sockjs-client')).default;

    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        this._connected = true;
        this.resubscribeAll();
        onConnect?.();
      },
      onStompError: () => {
        this._connected = false;
        onError?.();
      },
      onDisconnect: () => {
        this._connected = false;
      },
    });

    this.client.activate();
  }

  disconnect() {
    this.client?.deactivate();
    this._connected = false;
  }

  subscribe(topic: string, handler: MessageHandler) {
    if (!this.subscriptionHandlers.has(topic)) {
      this.subscriptionHandlers.set(topic, []);
    }
    this.subscriptionHandlers.get(topic)!.push(handler);

    if (this._connected && this.client) {
      this.client.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          handler(data);
        } catch (e) {
          console.error('WS parse error:', e);
        }
      });
    }
  }

  private resubscribeAll() {
    if (!this.client) return;
    this.subscriptionHandlers.forEach((handlers, topic) => {
      this.client!.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          handlers.forEach((h) => h(data));
        } catch (e) {
          console.error('WS parse error:', e);
        }
      });
    });
  }

  get isConnected() { return this._connected; }
}

export const wsClient = new GuardianWebSocket();''',

    'src/stores/deviceStore.ts': r'''import { create } from 'zustand';
import type { Device, TelemetryPayload, DeviceEvent, FleetSummary, FirmwareRelease } from '@/types';

interface DeviceStore {
  devices: Device[];
  fleetSummary: FleetSummary | null;
  firmware: FirmwareRelease[];
  events: DeviceEvent[];
  wsConnected: boolean;
  backendConnected: boolean;
  isLoading: boolean;
  setDevices: (devices: Device[]) => void;
  updateDevice: (deviceId: string, update: Partial<Device>) => void;
  setFleetSummary: (summary: FleetSummary) => void;
  setFirmware: (firmware: FirmwareRelease[]) => void;
  addEvent: (event: DeviceEvent) => void;
  setEvents: (events: DeviceEvent[]) => void;
  setWsConnected: (connected: boolean) => void;
  setBackendConnected: (connected: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  updateFromTelemetry: (telemetry: TelemetryPayload) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  devices: [],
  fleetSummary: null,
  firmware: [],
  events: [],
  wsConnected: false,
  backendConnected: false,
  isLoading: true,
  setDevices: (devices) => set({ devices }),
  updateDevice: (deviceId, update) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.deviceId === deviceId ? { ...d, ...update } : d
      ),
    })),
  setFleetSummary: (fleetSummary) => set({ fleetSummary }),
  setFirmware: (firmware) => set({ firmware }),
  addEvent: (event) =>
    set((state) => ({ events: [event, ...state.events].slice(0, 100) })),
  setEvents: (events) => set({ events }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
  setBackendConnected: (backendConnected) => set({ backendConnected }),
  setIsLoading: (isLoading) => set({ isLoading }),
  updateFromTelemetry: (telemetry) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.deviceId === telemetry.deviceId
          ? {
              ...d,
              firmwareVersion: telemetry.firmwareVersion,
              activeBank: telemetry.activeBank,
              health: telemetry.health,
              led: telemetry.led,
              pirMotion: telemetry.pirMotion,
              radarDistance: telemetry.radarDistance,
              safeMode: telemetry.safeMode,
              watchdogHealthy: telemetry.watchdogHealthy,
              heartbeat: telemetry.heartbeat,
              uptime: telemetry.uptime,
              updateState: telemetry.updateState,
              oledLines: telemetry.oledLines,
              status: telemetry.safeMode ? 'SAFE_MODE' : 
                      (telemetry.updateState !== 'IDLE' && telemetry.updateState !== 'CONFIRMED') ? 'UPDATING' : 'ONLINE',
            }
          : d
      ),
    })),
}));''',

    'src/middleware.ts': r'''import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Skip middleware if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('YOUR_PROJECT')) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};''',

    'src/app/globals.css': r'''@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: #090c12; }
::-webkit-scrollbar-thumb { background: #1a2740; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: #243452; }

::selection { background: rgba(0, 212, 255, 0.15); }

.bg-grid {
  background-image: 
    linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px);
  background-size: 40px 40px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.animate-blink { animation: blink 2s ease-in-out infinite; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.4s ease-out; }''',

    'src/app/layout.tsx': r'''import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Secure OTA Guardian — Firmware Lifecycle Platform',
  description: 'One bad firmware release should never become a fleet-wide disaster.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#090c12', color: '#e2e8f0' }}>
        {children}
      </body>
    </html>
  );
}''',

    'src/app/page.tsx': r''''use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    setSupabaseConfigured(url.length > 10 && !url.includes('YOUR_PROJECT'));
  }, []);

  const handleGoogleLogin = async () => {
    if (!supabaseConfigured || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-grid"
      style={{ backgroundColor: '#090c12', position: 'relative', overflow: 'hidden' }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '300px', background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Top bar */}
      <header style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', border: '1px solid rgba(0,212,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#00d4ff', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            SECURE OTA GUARDIAN
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="animate-pulse-slow" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#4a5568' }}>SYSTEM ONLINE</span>
        </div>
      </header>

      {/* Main */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '40px 16px', position: 'relative', zIndex: 10
      }}>
        <div style={{ width: '100%', maxWidth: '420px', opacity: mounted ? 1 : 0, transition: 'opacity 0.5s, transform 0.5s', transform: mounted ? 'translateY(0)' : 'translateY(12px)' }}>
          
          {/* Main card */}
          <div style={{
            backgroundColor: '#0f1823',
            border: '1px solid #1a2740',
            padding: '40px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
          }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#00d4ff', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '16px' }}>
                COMMAND ACCESS
              </p>
              <h1 style={{ fontSize: '40px', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-1px', margin: '0 0 12px' }}>
                GUARDIAN
              </h1>
              <p style={{ fontSize: '13px', color: '#4a5568', lineHeight: '1.6', margin: 0 }}>
                Protect every firmware release.<br />
                Recover every device.<br />
                Stop fleet-wide failures.
              </p>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #1a2740', marginBottom: '32px' }} />

            {/* Setup warning */}
            {mounted && !supabaseConfigured && (
              <div style={{
                marginBottom: '24px', padding: '16px',
                backgroundColor: 'rgba(234,179,8,0.05)',
                border: '1px solid rgba(234,179,8,0.2)'
              }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#eab308', fontWeight: 600, marginBottom: '6px' }}>SUPABASE NOT CONFIGURED</p>
                    <p style={{ fontSize: '11px', color: '#4a5568', lineHeight: 1.5 }}>
                      Copy <code style={{ fontFamily: 'monospace', background: '#141d2b', padding: '1px 4px' }}>.env.local.example</code> to <code style={{ fontFamily: 'monospace', background: '#141d2b', padding: '1px 4px' }}>.env.local</code> and add your Supabase credentials to enable Google login.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '12px', color: '#ef4444' }}>
                {error}
              </div>
            )}

            {/* Google Button */}
            <button
              id="google-login-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading || !supabaseConfigured}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '12px', backgroundColor: 'white', color: '#374151', fontSize: '14px',
                fontWeight: 500, padding: '14px 20px', border: 'none', cursor: (isLoading || !supabaseConfigured) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !supabaseConfigured) ? 0.5 : 1,
                transition: 'opacity 0.2s, background-color 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => { if (!isLoading && supabaseConfigured) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white'; }}
            >
              {isLoading ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              )}
              {isLoading ? 'Authenticating...' : 'Continue with Google'}
            </button>

            {/* Security note */}
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span style={{ fontSize: '11px', color: '#4a5568' }}>Protected by enterprise-grade security</span>
            </div>
          </div>

          {/* Feature cards */}
          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { icon: 'shield', label: 'Secure Firmware Lifecycle' },
              { icon: 'activity', label: 'Real-time Fleet Protection' },
              { icon: 'refresh', label: 'Automatic Rollback' },
            ].map(({ icon, label }) => (
              <div key={label} style={{
                backgroundColor: '#0f1823', border: '1px solid #1a2740',
                padding: '16px 12px', textAlign: 'center'
              }}>
                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                  {icon === 'shield' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  )}
                  {icon === 'activity' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  )}
                  {icon === 'refresh' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                    </svg>
                  )}
                </div>
                <p style={{ fontSize: '10px', color: '#4a5568', lineHeight: 1.4 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Simulated badge */}
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#4a5568',
              border: '1px solid #1a2740', padding: '6px 12px'
            }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#eab308', borderRadius: '50%' }} />
              SIMULATED — Development Mode
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '16px', fontSize: '10px', color: '#2d3748', fontFamily: 'JetBrains Mono, monospace', position: 'relative', zIndex: 10 }}>
        SECURE OTA GUARDIAN v1.0.0 — NXP FRDM-MCXN236 Platform
      </footer>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}''',

    'src/app/auth/callback/route.ts': r'''import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}''',

    'src/components/dashboard/DashboardProvider.tsx': r''''use client';

import { useEffect } from 'react';
import { wsClient } from '@/lib/websocket/client';
import { useDeviceStore } from '@/stores/deviceStore';
import { api } from '@/lib/api/client';
import type { TelemetryPayload, DeviceEvent } from '@/types';

export default function DashboardProvider({ children }: { children: React.ReactNode }) {
  const {
    setDevices, setFirmware, setFleetSummary, setEvents,
    setWsConnected, setBackendConnected, updateFromTelemetry,
    addEvent, updateDevice, setIsLoading
  } = useDeviceStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [devices, firmware, summary, events] = await Promise.allSettled([
          api.devices.list(),
          api.firmware.list(),
          api.fleet.summary(),
          api.events.list(),
        ]);
        if (devices.status === 'fulfilled') setDevices(devices.value);
        if (firmware.status === 'fulfilled') setFirmware(firmware.value);
        if (summary.status === 'fulfilled') setFleetSummary(summary.value);
        if (events.status === 'fulfilled') setEvents(events.value);
        setBackendConnected(true);
      } catch {
        setBackendConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Refresh data periodically
    const refreshInterval = setInterval(() => {
      api.fleet.summary().then(setFleetSummary).catch(() => {});
    }, 10000);

    // Connect WebSocket
    wsClient.connect(
      () => {
        setWsConnected(true);
        wsClient.subscribe('/topic/telemetry', (data) => {
          updateFromTelemetry(data as TelemetryPayload);
        });
        wsClient.subscribe('/topic/events', (data) => {
          addEvent(data as DeviceEvent);
          api.fleet.summary().then(setFleetSummary).catch(() => {});
        });
        wsClient.subscribe('/topic/devices/NXP-001', (data) => {
          const device = data as import('@/types').Device;
          updateDevice(device.deviceId, device);
        });
      },
      () => setWsConnected(false)
    );

    return () => {
      clearInterval(refreshInterval);
      wsClient.disconnect();
    };
  }, []);

  return <>{children}</>;
}''',

    'src/app/dashboard/layout.tsx': r'''import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import DashboardProvider from '@/components/dashboard/DashboardProvider';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase not configured — allow access in dev mode
  }

  // In production with Supabase configured, redirect if not authenticated
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseConfigured = supabaseUrl.length > 10 && !supabaseUrl.includes('YOUR_PROJECT');
  if (supabaseConfigured && !user) {
    redirect('/');
  }

  return (
    <DashboardProvider>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#090c12', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <TopBar user={user} />
          <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}''',

    'src/components/dashboard/Sidebar.tsx': r''''use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Command Center', icon: 'grid', exact: true },
  { href: '/dashboard/fleet', label: 'Fleet', icon: 'server' },
  { href: '/dashboard/devices', label: 'Devices', icon: 'cpu' },
  { href: '/dashboard/firmware', label: 'Firmware', icon: 'hard-drive' },
  { href: '/dashboard/rollouts', label: 'Rollouts', icon: 'git-branch' },
  null,
  { href: '/dashboard/attack-lab', label: 'Attack Lab', icon: 'flask' },
  { href: '/dashboard/security', label: 'Security Center', icon: 'shield-alert' },
  { href: '/dashboard/recovery', label: 'Recovery Center', icon: 'heart-pulse' },
  { href: '/dashboard/ai', label: 'Guardian AI', icon: 'bot' },
  null,
  { href: '/dashboard/audit', label: 'Audit Logs', icon: 'scroll' },
  { href: '/dashboard/policies', label: 'Policies', icon: 'shield' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
];

function Icon({ name }: { name: string }) {
  const props = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
  switch (name) {
    case 'grid': return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
    case 'server': return <svg {...props}><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>;
    case 'cpu': return <svg {...props}><rect x="9" y="9" width="6" height="6"/><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="9" y1="2" x2="9" y2="22"/><line x1="15" y1="2" x2="15" y2="22"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="22" y2="15"/></svg>;
    case 'hard-drive': return <svg {...props}><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>;
    case 'git-branch': return <svg {...props}><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>;
    case 'flask': return <svg {...props}><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11l-4 8h14l-4-8V3"/></svg>;
    case 'shield-alert': return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
    case 'heart-pulse': return <svg {...props}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
    case 'bot': return <svg {...props}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>;
    case 'scroll': return <svg {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
    case 'shield': return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case 'settings': return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>;
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside style={{
      width: '224px', flexShrink: 0, backgroundColor: '#0a0e18',
      borderRight: '1px solid #1a2740', display: 'flex', flexDirection: 'column'
    }}>
      {/* Brand */}
      <div style={{ padding: '20px', borderBottom: '1px solid #1a2740', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px', height: '28px', border: '1px solid rgba(0,212,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          backgroundColor: 'rgba(0,212,255,0.05)'
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.05em', margin: 0 }}>GUARDIAN</p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#4a5568', letterSpacing: '0.2em', margin: 0 }}>OTA PLATFORM</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map((item, i) => {
          if (!item) return <div key={i} style={{ margin: '8px 20px', borderTop: '1px solid #1a2740' }} />;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 20px',
                marginLeft: isActive ? 0 : '0',
                borderLeft: isActive ? '2px solid #00d4ff' : '2px solid transparent',
                backgroundColor: isActive ? 'rgba(0,212,255,0.06)' : 'transparent',
                color: isActive ? '#00d4ff' : '#4a5568',
                fontSize: '12px', fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.15s',
                paddingLeft: isActive ? '18px' : '18px',
              }}
            >
              <span style={{ flexShrink: 0 }}><Icon name={item.icon} /></span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Version */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #1a2740' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#2d3748', margin: 0 }}>v1.0.0 — PHASE 1</p>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#2d3748', margin: '2px 0 0' }}>NXP-FRDM-MCXN236</p>
      </div>
    </aside>
  );
}''',

    'src/components/dashboard/TopBar.tsx': r''''use client';

import { useDeviceStore } from '@/stores/deviceStore';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface TopBarProps { user: User | null; }

export default function TopBar({ user }: TopBarProps) {
  const { wsConnected, backendConnected } = useDeviceStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    router.push('/');
  };

  const avatar = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name || user?.email || 'Dev User';

  return (
    <header style={{
      height: '56px', backgroundColor: '#0a0e18', borderBottom: '1px solid #1a2740',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', flexShrink: 0
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#4a5568' }}>GUARDIAN /</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#8899aa' }}>Command Center</span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Backend status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: backendConnected ? '#22c55e' : '#ef4444' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: backendConnected ? '#22c55e' : '#ef4444' }}>
            {backendConnected ? 'API' : 'API DOWN'}
          </span>
        </div>

        {/* WS status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={wsConnected ? '#22c55e' : '#4a5568'} strokeWidth="2">
            {wsConnected ? (
              <><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>
            ) : (
              <><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/><path d="M5 12.55a10.94 10.94 0 015.17-2.39"/><path d="M10.71 5.05A16 16 0 0122.56 9"/><path d="M1.42 9a15.91 15.91 0 014.7-2.88"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>
            )}
          </svg>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: wsConnected ? '#22c55e' : '#4a5568' }}>
            {wsConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        <div style={{ width: '1px', height: '20px', backgroundColor: '#1a2740' }} />

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {avatar ? (
            <img src={avatar} alt={name} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #1a2740' }} />
          ) : (
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(0,212,255,0.3)',
              backgroundColor: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', color: '#00d4ff', fontWeight: 700
            }}>
              {(name[0] || 'D').toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: '12px', color: '#8899aa', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#4a5568', display: 'flex', alignItems: 'center' }}
          title="Sign out"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  );
}''',

    'src/app/dashboard/page.tsx': r''''use client';

import { useDeviceStore } from '@/stores/deviceStore';
import MetricCard from '@/components/ui/MetricCard';
import FleetHealth from '@/components/dashboard/FleetHealth';
import FirmwareDeployment from '@/components/dashboard/FirmwareDeployment';
import LiveEvents from '@/components/dashboard/LiveEvents';
import DeviceTwin from '@/components/dashboard/DeviceTwin';

export default function DashboardPage() {
  const { fleetSummary, devices, events, isLoading } = useDeviceStore();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-200 tracking-tight">Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time fleet overview and firmware deployment.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-xs font-mono font-medium text-yellow-500 uppercase tracking-widest">Demo Mode</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard label="Total Devices" value={fleetSummary?.totalDevices} icon="server" color="info" isLoading={isLoading} />
        <MetricCard label="Healthy" value={fleetSummary?.healthy} icon="check-circle" color="success" isLoading={isLoading} />
        <MetricCard label="Updating" value={fleetSummary?.updating} icon="refresh" color="accent" isLoading={isLoading} />
        <MetricCard label="Failed" value={fleetSummary?.failed} icon="x-circle" color="danger" isLoading={isLoading} />
        <MetricCard label="Safe Mode" value={fleetSummary?.safeMode} icon="shield-alert" color="warning" isLoading={isLoading} />
        <MetricCard label="Security Events" value={fleetSummary?.securityEvents} icon="alert-triangle" color="orange" isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <FleetHealth summary={fleetSummary} isLoading={isLoading} />
          <DeviceTwin device={devices.find(d => d.deviceId === 'NXP-001')} />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <FirmwareDeployment />
          <LiveEvents events={events} />
        </div>
      </div>
    </div>
  );
}''',

    'src/components/ui/MetricCard.tsx': r''''use client';

import clsx from 'clsx';
import { Server, CheckCircle, RefreshCw, XCircle, ShieldAlert, AlertTriangle } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value?: number;
  icon: string;
  color: 'accent' | 'success' | 'warning' | 'danger' | 'orange' | 'info';
  isLoading?: boolean;
}

const colorMap = {
  accent: 'text-[#00d4ff] bg-[#00d4ff]/10',
  success: 'text-[#22c55e] bg-[#22c55e]/10',
  warning: 'text-[#eab308] bg-[#eab308]/10',
  danger: 'text-[#ef4444] bg-[#ef4444]/10',
  orange: 'text-[#f97316] bg-[#f97316]/10',
  info: 'text-[#3b82f6] bg-[#3b82f6]/10',
};

const IconMap = {
  'server': Server,
  'check-circle': CheckCircle,
  'refresh': RefreshCw,
  'x-circle': XCircle,
  'shield-alert': ShieldAlert,
  'alert-triangle': AlertTriangle,
};

export default function MetricCard({ label, value, icon, color, isLoading }: MetricCardProps) {
  const IconComponent = IconMap[icon as keyof typeof IconMap] || Server;

  return (
    <div className="bg-[#0f1823] border border-[#1a2740] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
        <IconComponent size={48} className={colorMap[color].split(' ')[0]} />
      </div>
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <div className={clsx('p-2 rounded-md', colorMap[color])}>
          <IconComponent size={16} />
        </div>
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">{label}</h3>
      </div>
      <div className="relative z-10">
        {isLoading ? (
          <div className="h-8 w-16 bg-[#1a2740] rounded animate-pulse" />
        ) : (
          <span className="text-2xl font-bold text-slate-100">{value ?? 0}</span>
        )}
      </div>
    </div>
  );
}''',

    'src/components/dashboard/FleetHealth.tsx': r''''use client';

import { FleetSummary } from '@/types';

export default function FleetHealth({ summary, isLoading }: { summary: FleetSummary | null; isLoading: boolean }) {
  if (isLoading || !summary) {
    return <div className="h-48 bg-[#0f1823] border border-[#1a2740] rounded-lg animate-pulse" />;
  }

  const total = summary.totalDevices || 1;
  const healthy = (summary.healthy / total) * 100;
  const updating = (summary.updating / total) * 100;
  const safeMode = (summary.safeMode / total) * 100;
  const failed = (summary.failed / total) * 100;

  return (
    <div className="bg-[#0f1823] border border-[#1a2740] rounded-lg p-6">
      <h3 className="text-sm font-mono text-slate-400 mb-6 uppercase tracking-wider">Fleet Health Overview</h3>
      
      <div className="w-full h-4 rounded-full flex overflow-hidden mb-6 bg-[#1a2740]">
        <div style={{ width: `${healthy}%` }} className="bg-green-500 transition-all duration-500" title="Healthy" />
        <div style={{ width: `${updating}%` }} className="bg-[#00d4ff] transition-all duration-500" title="Updating" />
        <div style={{ width: `${safeMode}%` }} className="bg-yellow-500 transition-all duration-500" title="Safe Mode" />
        <div style={{ width: `${failed}%` }} className="bg-red-500 transition-all duration-500" title="Failed" />
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-slate-300">Healthy ({summary.healthy})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#00d4ff]" />
          <span className="text-slate-300">Updating ({summary.updating})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-slate-300">Safe Mode ({summary.safeMode})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-300">Failed ({summary.failed})</span>
        </div>
      </div>
    </div>
  );
}''',

    'src/components/dashboard/DeviceTwin.tsx': r''''use client';

import { Device } from '@/types';
import LEDIndicator from '@/components/ui/LEDIndicator';
import OLEDPreview from '@/components/ui/OLEDPreview';

export default function DeviceTwin({ device }: { device?: Device }) {
  if (!device) return <div className="bg-[#0f1823] border border-[#1a2740] rounded-lg p-6 h-64 animate-pulse flex items-center justify-center text-slate-500 text-sm">Waiting for device telemetry...</div>;

  return (
    <div className="bg-[#0f1823] border border-[#1a2740] rounded-lg overflow-hidden flex flex-col">
      <div className="bg-[#141d2b] border-b border-[#1a2740] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#0a0e18] rounded border border-[#1a2740]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M12 18v.01M8 18v.01M16 18v.01" /><path d="M12 6v.01M8 6v.01M16 6v.01" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">{device.deviceId}</h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase">{device.targetHardware}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#0a0e18] px-3 py-1 rounded-full border border-[#1a2740]">
          <div className={`w-2 h-2 rounded-full ${device.status === 'ONLINE' ? 'bg-green-500' : device.status === 'UPDATING' ? 'bg-[#00d4ff] animate-pulse' : device.status === 'SAFE_MODE' ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-[10px] font-mono font-medium text-slate-300">{device.status}</span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Device Visual */}
        <div className="bg-[#0a0e18] border border-[#1a2740] rounded-lg p-4 flex flex-col items-center justify-center gap-6 relative">
          <div className="absolute top-2 right-2 flex gap-1">
             <div className={`w-1.5 h-1.5 rounded-full ${device.heartbeat ? 'bg-green-500/50 animate-pulse' : 'bg-slate-700'}`} title="Heartbeat" />
          </div>
          <OLEDPreview lines={device.oledLines} />
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] font-mono text-slate-500">SYS LED</span>
              <LEDIndicator color={device.led} size="md" />
            </div>
            <div className="h-8 w-px bg-[#1a2740]" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-mono text-slate-500">PIR</span>
              <div className={`text-xs font-mono px-2 py-0.5 rounded ${device.pirMotion ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-500'}`}>{device.pirMotion ? 'MOTION' : 'CLEAR'}</div>
            </div>
            <div className="h-8 w-px bg-[#1a2740]" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-mono text-slate-500">RADAR</span>
              <div className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded">{device.radarDistance.toFixed(1)}m</div>
            </div>
          </div>
        </div>

        {/* Right: Firmware & Status */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-[#0a0e18] border border-[#1a2740] p-3 rounded">
               <span className="text-[10px] font-mono text-slate-500 block mb-1">FIRMWARE</span>
               <span className="text-sm font-medium text-slate-200">{device.firmwareVersion}</span>
             </div>
             <div className="bg-[#0a0e18] border border-[#1a2740] p-3 rounded">
               <span className="text-[10px] font-mono text-slate-500 block mb-1">HEALTH</span>
               <span className="text-sm font-medium text-green-400">{device.health}%</span>
             </div>
          </div>

          <div className="bg-[#0a0e18] border border-[#1a2740] rounded p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-[#1a2740] to-transparent" />
            <h4 className="text-[10px] font-mono text-slate-500 mb-3 uppercase tracking-widest">Dual-Bank Storage</h4>
            <div className="space-y-2">
              <div className={`flex justify-between items-center p-2 rounded text-xs font-mono border ${device.activeBank === 'A' ? 'bg-[#00d4ff]/10 border-[#00d4ff]/30 text-[#00d4ff]' : 'bg-slate-800/50 border-slate-700/50 text-slate-500'}`}>
                <span>BANK A {device.activeBank === 'A' && '(ACTIVE)'}</span>
                <span>{device.bankAFirmware || 'EMPTY'}</span>
              </div>
              <div className={`flex justify-between items-center p-2 rounded text-xs font-mono border ${device.activeBank === 'B' ? 'bg-[#00d4ff]/10 border-[#00d4ff]/30 text-[#00d4ff]' : 'bg-slate-800/50 border-slate-700/50 text-slate-500'}`}>
                <span>BANK B {device.activeBank === 'B' && '(ACTIVE)'}</span>
                <span>{device.bankBFirmware || 'EMPTY'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0a0e18] border border-[#1a2740] rounded">
             <span className="text-xs text-slate-400 font-mono">OTA STATE</span>
             <span className={`text-xs font-mono px-2 py-1 rounded border ${device.updateState === 'IDLE' ? 'bg-slate-800 border-slate-700 text-slate-400' : device.updateState === 'CONFIRMED' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-[#00d4ff]/10 border-[#00d4ff]/30 text-[#00d4ff] animate-pulse'}`}>{device.updateState}</span>
          </div>
        </div>
      </div>
    </div>
  );
}''',

    'src/components/dashboard/LiveEvents.tsx': r''''use client';

import { DeviceEvent } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function LiveEvents({ events }: { events: DeviceEvent[] }) {
  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-red-500 text-red-500';
      case 'HIGH': return 'bg-orange-500 text-orange-500';
      case 'MEDIUM': return 'bg-yellow-500 text-yellow-500';
      case 'LOW': return 'bg-blue-500 text-blue-500';
      default: return 'bg-slate-500 text-slate-500';
    }
  };

  return (
    <div className="bg-[#0f1823] border border-[#1a2740] rounded-lg flex flex-col h-[400px]">
      <div className="p-4 border-b border-[#1a2740] flex justify-between items-center">
        <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider">Live Event Stream</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-slate-500">REALTIME</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-500 font-mono">No recent events</div>
        ) : (
          events.map((event, i) => (
            <div key={`${event.id}-${i}`} className="flex items-start gap-3 p-3 bg-[#0a0e18] border border-[#1a2740] rounded text-sm animate-fade-in">
              <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${getSeverityColor(event.severity).split(' ')[0]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[11px] text-slate-400">{event.deviceId}</span>
                  <span className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{event.message}</p>
                <div className="mt-2 flex gap-2">
                   <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${getSeverityColor(event.severity).replace('text-', 'border-').replace('bg-', 'bg-opacity-10 bg-')}`}>{event.severity}</span>
                   <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400">{event.eventType}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}''',

    'src/components/dashboard/FirmwareDeployment.tsx': r''''use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import { api } from '@/lib/api/client';

export default function FirmwareDeployment() {
  const { firmware, isLoading } = useDeviceStore();
  const [deployingId, setDeployingId] = useState<string | null>(null);

  const handleDeploy = async (id: string) => {
    setDeployingId(id);
    try {
      await api.deployments.create({ firmwareReleaseId: id, deviceId: 'NXP-001' });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setDeployingId(null), 1000);
    }
  };

  if (isLoading) {
    return <div className="bg-[#0f1823] border border-[#1a2740] rounded-lg p-6 h-64 animate-pulse flex items-center justify-center text-slate-500">Loading firmware...</div>;
  }

  const availableFirmware = firmware.filter(f => f.status === 'APPROVED' || f.status === 'DRAFT');

  return (
    <div className="bg-[#0f1823] border border-[#1a2740] rounded-lg flex flex-col max-h-[600px]">
      <div className="p-4 border-b border-[#1a2740]">
        <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider">Available Firmware</h3>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {availableFirmware.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-8 font-mono">No firmware releases available</div>
        ) : (
          availableFirmware.map((fw) => (
            <div key={fw.id} className="bg-[#0a0e18] border border-[#1a2740] p-4 rounded-lg flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-200">{fw.version}</h4>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${fw.type === 'STABLE' ? 'bg-green-500/10 text-green-400' : fw.type === 'BROKEN' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {fw.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{fw.name}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">{fw.description}</p>
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#1a2740]">
                <div className="font-mono text-[9px] text-slate-600 truncate max-w-[120px]">
                  SHA: {fw.sha256.substring(0, 8)}...
                </div>
                <button
                  onClick={() => handleDeploy(fw.id)}
                  disabled={!!deployingId}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
                    deployingId === fw.id ? 'bg-[#00d4ff]/20 text-[#00d4ff] cursor-wait' :
                    deployingId ? 'bg-slate-800 text-slate-600 cursor-not-allowed' :
                    'bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30'
                  }`}
                >
                  {deployingId === fw.id ? 'DEPLOYING...' : 'DEPLOY OTA'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}''',

    'src/components/ui/OLEDPreview.tsx': r''''use client';

export default function OLEDPreview({ lines = [] }: { lines?: string[] }) {
  const displayLines = [...lines, '', '', '', ''].slice(0, 4);
  return (
    <div className="bg-black border-2 border-slate-700 rounded p-3 w-40 h-24 flex flex-col justify-center gap-1 overflow-hidden relative shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.05)_0%,transparent_100%)] pointer-events-none" />
      {displayLines.map((line, i) => (
        <div key={i} className="font-mono text-[10px] text-cyan-400 whitespace-pre leading-none truncate" style={{ textShadow: '0 0 2px rgba(34,211,238,0.5)' }}>
          {line || ' '}
        </div>
      ))}
    </div>
  );
}''',

    'src/components/ui/LEDIndicator.tsx': r''''use client';

import { LEDColor } from '@/types';

export default function LEDIndicator({ color, size = 'md' }: { color: LEDColor; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-2 h-2', md: 'w-4 h-4', lg: 'w-6 h-6' };
  
  const getStyle = () => {
    switch (color) {
      case 'GREEN': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse';
      case 'YELLOW': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)] animate-pulse';
      case 'BLUE': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse';
      case 'RED': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse';
      case 'OFF': default: return 'bg-slate-700 shadow-none';
    }
  };

  return <div className={`${sizeMap[size]} rounded-full transition-all duration-300 ${getStyle()}`} />;
}''',

}

stub_pages = [
    'fleet', 'devices', 'firmware', 'rollouts', 'attack-lab', 
    'security', 'recovery', 'ai', 'audit', 'policies', 'settings'
]

for page in stub_pages:
    files[f'src/app/dashboard/{page}/page.tsx'] = f'''export default function {page.replace("-", "").capitalize()}Page() {{
  return (
    <div className="h-full flex items-center justify-center flex-col gap-4">
      <div className="w-16 h-16 rounded bg-[#1a2740] flex items-center justify-center opacity-50">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
      </div>
      <h2 className="text-xl font-mono text-slate-500 uppercase tracking-widest">PHASE 2 - COMING SOON</h2>
      <p className="text-slate-600 text-sm">The {page.replace("-", " ").capitalize()} module is currently under development.</p>
    </div>
  );
}}'''

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content)

print(f"Created {len(files)} files successfully.")
