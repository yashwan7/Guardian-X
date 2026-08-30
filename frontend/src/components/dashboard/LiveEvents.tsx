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
        return 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700/40';
      case 'HIGH':
        return 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/40';
      case 'LOW':
        return 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/40';
      case 'INFO':
      default:
        return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/40';
    }
  };

  const getSeverityIcon = (severity: DeviceEvent['severity']) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />;
      case 'LOW':
        return <CheckCircle className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />;
      case 'INFO':
      default:
        return <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/90 dark:border-white/10 rounded-2xl overflow-hidden shadow-[0_12px_32px_-8px_rgba(0,0,0,0.04),_inset_0_1px_1px_rgba(255,255,255,1)] flex flex-col transition-all">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <h3 className="text-xs font-sans font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Live Telemetry &amp; Security Stream
          </h3>
        </div>
        <span className="text-[10px] font-sans font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200/80 dark:border-blue-700/40">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          LIVE STREAM
        </span>
      </div>

      {/* Event Stream List */}
      <div className="p-3.5 space-y-2.5 max-h-[380px] overflow-y-auto">
        {!events || events.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-sans text-xs">
            Listening for device events...
          </div>
        ) : (
          events.slice(0, 10).map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-400/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-3 group cursor-default"
            >
              <div>{getSeverityIcon(evt.severity)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-full border shadow-xs ${getSeverityStyle(
                        evt.severity
                      )}`}
                    >
                      {evt.severity}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {evt.eventType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      &bull; {evt.deviceId}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-mono text-slate-400 shrink-0"
                    suppressHydrationWarning
                  >
                    {mounted ? new Date(evt.timestamp).toLocaleTimeString() : '--:--:--'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
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