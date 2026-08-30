'use client';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { LogOut, Usb, Sun, Moon } from 'lucide-react';
import { webSerial } from '@/lib/webSerial';

interface TopBarProps {
  user?: User | null;
}

export default function TopBar({ user: propUser }: TopBarProps) {
  const { user: authUser, profile, isGuest, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <header className="h-13 bg-[#040705]/95 backdrop-blur-md border-b border-[#121e17] flex items-center justify-between px-5 shrink-0 z-30 transition-colors">
      {/* Left spacer */}
      <div />

      {/* Right: Actions, Theme & User */}
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

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-[#08120c] hover:bg-[#0e1f15] border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 transition-all shadow-[0_0_8px_rgba(16,185,129,0.15)]"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-emerald-600 transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>

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