'use client';

import { useState, useEffect } from 'react';
import { DeviceEvent } from '@/types';
import { AlertTriangle, Info, CheckCircle, Radio } from 'lucide-react';

export default function LiveEvents({ events }: { events: DeviceEvent[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getSeverityStyle = (severity: DeviceEvent['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/25';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-300 border-orange-500/25';
      case 'LOW':
        return 'bg-teal-500/10 text-teal-300 border-teal-500/25';
      case 'INFO':
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
    }
  };

  const getSeverityIcon = (severity: DeviceEvent['severity']) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />;
      case 'LOW':
        return <CheckCircle className="w-3 h-3 text-teal-400 shrink-0" />;
      case 'INFO':
      default:
        return <Info className="w-3 h-3 text-emerald-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-[#060b08] border border-[#14221b] rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-3.5 border-b border-[#14221b] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Live Telemetry &amp; Security Stream
          </h3>
        </div>
        <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          LIVE
        </span>
      </div>

      {/* Event Stream List */}
      <div className="p-3 space-y-2 max-h-[320px] overflow-y-auto">
        {!events || events.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-mono text-xs">
            Listening for device events...
          </div>
        ) : (
          events.slice(0, 10).map((evt) => (
            <div
              key={evt.id}
              className="p-2 rounded-lg bg-[#09110d] border border-white/5 hover:border-[#1c3226] transition-all flex items-start gap-2.5"
            >
              <div className="mt-0.5">{getSeverityIcon(evt.severity)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[8px] font-mono font-semibold px-1.5 py-0.2 rounded border ${getSeverityStyle(
                        evt.severity
                      )}`}
                    >
                      {evt.severity}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-200">
                      {evt.eventType}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      &bull; {evt.deviceId}
                    </span>
                  </div>
                  <span
                    className="text-[9px] font-mono text-slate-400 shrink-0"
                    suppressHydrationWarning
                  >
                    {mounted ? new Date(evt.timestamp).toLocaleTimeString() : '--:--:--'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-snug">
                  {evt.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}