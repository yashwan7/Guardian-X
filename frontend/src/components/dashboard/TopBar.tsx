'use client';

import { useDeviceStore } from '@/stores/deviceStore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { LogOut, Wifi, WifiOff, Terminal, Usb } from 'lucide-react';
import { buzzerAudio } from '../ui/BuzzerAudio';
import { webSerial } from '@/lib/webSerial';

interface TopBarProps {
  user?: User | null;
}

export default function TopBar({ user: propUser }: TopBarProps) {
  const { wsConnected, backendConnected, addEvent } = useDeviceStore();
  const { user: authUser, profile, isGuest, signOut } = useAuth();
  const router = useRouter();

  const currentUser = authUser || propUser;
  const avatar = profile?.avatarUrl || currentUser?.user_metadata?.avatar_url;
  const name =
    profile?.fullName ||
    currentUser?.user_metadata?.full_name ||
    currentUser?.email ||
    (isGuest ? 'Guest Operator' : 'Guardian Engineer');

  const handleConnectSerial = async () => {
    await webSerial.connect();
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="h-13 bg-[#040705]/95 backdrop-blur-md border-b border-[#121e17] flex items-center justify-between px-5 shrink-0 z-30">
      {/* Left: Breadcrumbs & System Tag */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-500">SYSTEM /</span>
          <span className="text-slate-200 font-bold tracking-wide">COMMAND CENTER</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-mono text-[10px] text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
          <span>DUAL-BANK GUARDIAN ACTIVE</span>
        </div>
      </div>

      {/* Right: Telemetry Indicators & Actions */}
      <div className="flex items-center gap-3">
        {/* Quick WebSerial Trigger */}
        <button
          onClick={handleConnectSerial}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-[#08120c] hover:bg-[#0e1f15] text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-[0_0_10px_rgba(0,245,160,0.12)]"
          title="Connect NXP Board via USB WebSerial"
        >
          <Usb className="w-3.5 h-3.5 text-emerald-400" />
          <span>CONNECT SERIAL</span>
        </button>

        {/* API Link Pill */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#070d0a] border border-[#14241c] font-mono text-[10px]">
          <div
            className={`w-2 h-2 rounded-full ${
              backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <span className="text-emerald-400 font-semibold">API ONLINE</span>
        </div>

        {/* WebSocket / Stream Link Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-[#070d0a] border border-[#14241c] font-mono text-[10px]">
          {wsConnected ? (
            <Wifi className="w-3 h-3 text-emerald-400" />
          ) : (
            <Wifi className="w-3 h-3 text-emerald-400" />
          )}
          <span className="text-emerald-300 font-semibold">STREAM READY</span>
        </div>

        <div className="w-px h-4 bg-[#121e17]" />

        {/* User Pill & Logout */}
        <div className="flex items-center gap-2">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-6 h-6 rounded-full border border-emerald-500/30 object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-[10px] text-emerald-400 font-bold">
              {(name[0] || 'G').toUpperCase()}
            </div>
          )}
          <span className="text-xs text-slate-300 font-medium max-w-[120px] truncate hidden sm:inline">
            {name}
          </span>
          <button
            onClick={handleLogout}
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}