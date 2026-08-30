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
    <header className="h-16 bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border-b border-white/80 dark:border-white/10 flex items-center justify-between px-6 shrink-0 z-30 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      {/* Left Spacer */}
      <div />

      {/* Right: Actions, Theme & User */}
      <div className="flex items-center gap-3">
        {/* Quick WebSerial Trigger */}
        <button
          onClick={handleConnectSerial}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.04),_inset_0_1px_1px_rgba(255,255,255,1)] hover:bg-slate-50 transition-all hover:scale-102"
          title="Connect NXP Board via USB WebSerial"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center shadow-sm">
            <Usb className="w-3 h-3" />
          </div>
          <span>Connect Serial</span>
        </button>

        {/* Apple Vision Pro Tactile Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.04),_inset_0_1px_1px_rgba(255,255,255,1)] hover:scale-105 transition-all text-slate-700 dark:text-slate-200"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>

        <div className="w-px h-6 bg-slate-200/80 dark:bg-slate-800" />

        {/* User Pill & Logout */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.04),_inset_0_1px_1px_rgba(255,255,255,1)]">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-6 h-6 rounded-full border border-slate-200 object-cover shadow-sm"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#ffa8ba] to-[#60a5fa] flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
              {(name[0] || 'G').toUpperCase()}
            </div>
          )}
          <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold max-w-[120px] truncate hidden sm:inline">
            {name}
          </span>
          <button
            onClick={handleLogout}
            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full transition-all"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}