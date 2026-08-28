'use client';

import React from 'react';
import {
  Server,
  CheckCircle2,
  RefreshCw,
  XCircle,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';

interface MetricCardProps {
  label: string;
  value?: number;
  icon: string;
  color: 'accent' | 'success' | 'warning' | 'danger' | 'orange' | 'info';
  isLoading?: boolean;
}

const colorStyles = {
  accent: {
    bg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
  },
  success: {
    bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    dot: 'bg-emerald-400',
    text: 'text-emerald-200',
  },
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
    dot: 'bg-amber-400',
    text: 'text-amber-300',
  },
  danger: {
    bg: 'bg-rose-500/10 border-rose-500/25 text-rose-400',
    dot: 'bg-rose-400',
    text: 'text-rose-300',
  },
  orange: {
    bg: 'bg-orange-500/10 border-orange-500/25 text-orange-400',
    dot: 'bg-orange-400',
    text: 'text-orange-300',
  },
  info: {
    bg: 'bg-teal-500/10 border-teal-500/25 text-teal-400',
    dot: 'bg-teal-400',
    text: 'text-teal-300',
  },
};

const iconMap = {
  server: Server,
  'check-circle': CheckCircle2,
  refresh: RefreshCw,
  'x-circle': XCircle,
  'shield-alert': ShieldAlert,
  'alert-triangle': AlertTriangle,
};

export default function MetricCard({
  label,
  value = 0,
  icon,
  color,
  isLoading,
}: MetricCardProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Server;
  const style = colorStyles[color] || colorStyles.accent;

  return (
    <div className="bg-[#070c09] border border-[#14221b] hover:border-[#1d3228] rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-all duration-150 shadow-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`p-1.5 rounded-lg border ${style.bg} shrink-0`}>
          <IconComponent className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block truncate">
            {label}
          </span>
          <div className="flex items-baseline gap-1.5">
            {isLoading ? (
              <div className="h-5 w-8 bg-slate-800 rounded animate-pulse" />
            ) : (
              <span className="text-base font-bold font-mono text-slate-100 leading-tight">
                {value}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot} ${
          value > 0 && color === 'warning' ? 'animate-pulse' : ''
        }`}
      />
    </div>
  );
}