'use client';

import React from 'react';
import {
  Server,
  CheckCircle2,
  RefreshCw,
  XCircle,
  ShieldAlert,
  AlertTriangle,
  Layers,
} from 'lucide-react';

interface MetricCardProps {
  label: string;
  value?: number;
  icon: string;
  color: 'accent' | 'success' | 'warning' | 'danger' | 'orange' | 'info';
  isLoading?: boolean;
}

const colorStyles = {
  info: {
    gradient: 'from-[#3b82f6] to-[#60a5fa]',
    badgeBg: 'bg-blue-50 text-blue-600 border-blue-200/80 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/40',
    shadow: 'shadow-[0_10px_25px_-5px_rgba(59,130,246,0.35)]',
    dot: 'bg-blue-500',
  },
  success: {
    gradient: 'from-[#10b981] to-[#34d399]',
    badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/40',
    shadow: 'shadow-[0_10px_25px_-5px_rgba(16,185,129,0.35)]',
    dot: 'bg-emerald-500',
  },
  warning: {
    gradient: 'from-[#f59e0b] to-[#fbbf24]',
    badgeBg: 'bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/40',
    shadow: 'shadow-[0_10px_25px_-5px_rgba(245,158,11,0.35)]',
    dot: 'bg-amber-500',
  },
  danger: {
    gradient: 'from-[#f43f5e] to-[#fb7185]',
    badgeBg: 'bg-rose-50 text-rose-600 border-rose-200/80 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700/40',
    shadow: 'shadow-[0_10px_25px_-5px_rgba(244,63,94,0.35)]',
    dot: 'bg-rose-500',
  },
  orange: {
    gradient: 'from-[#fb923c] to-[#fed7aa]',
    badgeBg: 'bg-orange-50 text-orange-600 border-orange-200/80 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/40',
    shadow: 'shadow-[0_10px_25px_-5px_rgba(251,146,60,0.35)]',
    dot: 'bg-orange-500',
  },
  accent: {
    gradient: 'from-[#8b5cf6] to-[#c4b5fd]',
    badgeBg: 'bg-purple-50 text-purple-600 border-purple-200/80 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/40',
    shadow: 'shadow-[0_10px_25px_-5px_rgba(139,92,246,0.35)]',
    dot: 'bg-purple-500',
  },
};

const iconMap = {
  server: Server,
  'check-circle': CheckCircle2,
  refresh: RefreshCw,
  'x-circle': XCircle,
  'shield-alert': ShieldAlert,
  'alert-triangle': AlertTriangle,
  layers: Layers,
};

export default function MetricCard({
  label,
  value = 0,
  icon,
  color,
  isLoading,
}: MetricCardProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Server;
  const style = colorStyles[color] || colorStyles.info;

  return (
    <div className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl p-3 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-[0_8px_24px_-4px_rgba(0,0,0,0.04),_inset_0_1px_1px_rgba(255,255,255,1)]">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Apple Vision Pro Gradient Icon Pill */}
        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${style.gradient} ${style.shadow} p-0.5 flex items-center justify-center text-white shrink-0 border border-white/40`}
        >
          <IconComponent className="w-4 h-4 drop-shadow-sm" />
        </div>

        <div className="min-w-0">
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
            {label}
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            {isLoading ? (
              <div className="h-5 w-8 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
            ) : (
              <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white leading-tight">
                {value}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tactile 3D Knob Dot */}
      <div className="w-3 h-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-[0_2px_5px_rgba(0,0,0,0.12),_inset_0_1px_1px_rgba(255,255,255,1)] flex items-center justify-center shrink-0">
        <div
          className={`w-1.5 h-1.5 rounded-full ${style.dot} ${
            value > 0 && color === 'warning' ? 'animate-ping' : ''
          }`}
        />
      </div>
    </div>
  );
}