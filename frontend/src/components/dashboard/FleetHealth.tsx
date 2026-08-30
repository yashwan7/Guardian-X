'use client';

import { FleetSummary } from '@/types';
import { ShieldCheck } from 'lucide-react';

export default function FleetHealth({
  summary,
  isLoading,
}: {
  summary: FleetSummary | null;
  isLoading?: boolean;
}) {
  if (isLoading || !summary) {
    return (
      <div className="h-44 bg-[#0c182a] border border-[#1a3250] rounded-xl animate-pulse" />
    );
  }

  const total = summary.totalDevices || 1;
  const healthyPct = Math.round((summary.healthy / total) * 100);

  return (
    <div className="bg-[#0c182a] border border-[#1a3250] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a3250] pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#84B6E4]" />
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Fleet Health &amp; Dual-Bank Integrity
          </h3>
        </div>
        <span className="text-[10px] font-mono font-semibold text-[#84B6E4]">
          {healthyPct}% HEALTHY
        </span>
      </div>

      {/* Progress Multi-Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full flex overflow-hidden bg-[#060c16] border border-white/5">
          <div
            style={{ width: `${(summary.healthy / total) * 100}%` }}
            className="bg-[#84B6E4] shadow-[0_0_8px_#84B6E4] transition-all duration-500"
            title="Healthy"
          />
          <div
            style={{ width: `${(summary.updating / total) * 100}%` }}
            className="bg-cyan-400 transition-all duration-500"
            title="Updating"
          />
          <div
            style={{ width: `${(summary.safeMode / total) * 100}%` }}
            className="bg-amber-400 transition-all duration-500"
            title="Safe Mode"
          />
          <div
            style={{ width: `${(summary.failed / total) * 100}%` }}
            className="bg-rose-400 transition-all duration-500"
            title="Failed"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#84B6E4]" />
            Healthy ({summary.healthy})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Updating ({summary.updating})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Safe Mode ({summary.safeMode})
          </span>
        </div>
      </div>

      {/* Dual-Bank Memory Slot Allocation Breakdown */}
      <div className="pt-2 border-t border-[#1a3250] grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-[#08111e] border border-[#1a3250] flex flex-col">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[8px] font-mono text-slate-400">SLOT A (GOLDEN)</span>
            <span className="text-[8px] font-mono text-[#84B6E4] font-semibold">0x00000000</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-200">v1.0.0 SmartPass</span>
          <span className="text-[8px] text-slate-400 mt-0.5">Immutable Fallback Image</span>
        </div>

        <div className="p-2 rounded-lg bg-[#08111e] border border-[#1a3250] flex flex-col">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[8px] font-mono text-slate-400">SLOT B (STAGED)</span>
            <span className="text-[8px] font-mono text-cyan-300 font-semibold">0x00100000</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-200">v2.0.0 MetroPay</span>
          <span className="text-[8px] text-slate-400 mt-0.5">Dynamic Feature Slot</span>
        </div>
      </div>
    </div>
  );
}