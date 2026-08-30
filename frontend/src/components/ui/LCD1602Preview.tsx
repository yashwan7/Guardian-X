'use client';

import React from 'react';

interface LCD1602PreviewProps {
  line1?: string;
  line2?: string;
  backlight?: 'green' | 'blue' | 'yellow';
}

export default function LCD1602Preview({
  line1 = 'SmartPass v1.0',
  line2 = 'Tap Card...',
  backlight = 'green',
}: LCD1602PreviewProps) {
  // Pad strings to 16 characters for authentic 16x2 LCD behavior
  const formattedLine1 = (line1 || '').padEnd(16, ' ').slice(0, 16);
  const formattedLine2 = (line2 || '').padEnd(16, ' ').slice(0, 16);

  const bgStyle =
    backlight === 'green'
      ? 'bg-[#021c0e] border-emerald-500/40 text-[#10b981] shadow-[0_0_24px_rgba(16,185,129,0.25)]'
      : backlight === 'blue'
      ? 'bg-[#031c2e] border-blue-500/40 text-[#38bdf8] shadow-[0_0_24px_rgba(56,189,248,0.25)]'
      : 'bg-[#2b1902] border-amber-500/40 text-[#fbbf24] shadow-[0_0_24px_rgba(251,191,36,0.25)]';

  const pixelGlow =
    backlight === 'green'
      ? 'drop-shadow-[0_0_6px_#10b981]'
      : backlight === 'blue'
      ? 'drop-shadow-[0_0_6px_#38bdf8]'
      : 'drop-shadow-[0_0_6px_#fbbf24]';

  return (
    <div className="flex flex-col items-center w-full">
      {/* Outer LCD Bezel Frame (Apple Vision Frosted Chassis) */}
      <div className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04),_inset_0_1px_1px_rgba(255,255,255,1)] relative transition-all">
        {/* Mounting Screws on corners (Frosted Titanium) */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-slate-400 dark:bg-slate-500" />
        </div>
        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-slate-400 dark:bg-slate-500" />
        </div>
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-slate-400 dark:bg-slate-500" />
        </div>
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-slate-400 dark:bg-slate-500" />
        </div>

        {/* LCD Header Label */}
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[10px] font-mono tracking-wider text-slate-600 dark:text-slate-300 font-bold uppercase">
            16x2 HD44780 LCD (I2C: 0x27)
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200/80 dark:border-blue-700/50 font-semibold shadow-xs">
            SDA: P4_0 &bull; SCL: P4_1
          </span>
        </div>

        {/* Backlit Display Screen */}
        <div
          className={`relative rounded-xl border p-4 font-mono text-base tracking-[0.2em] flex flex-col justify-center gap-2 select-none overflow-hidden transition-all duration-300 shadow-inner ${bgStyle}`}
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {/* Subtle LCD Dot Matrix Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '3px 3px',
            }}
          />

          {/* Line 1 */}
          <div className={`font-bold whitespace-pre leading-none ${pixelGlow} transition-all duration-200`}>
            {formattedLine1}
          </div>

          {/* Line 2 */}
          <div className={`font-bold whitespace-pre leading-none ${pixelGlow} transition-all duration-200`}>
            {formattedLine2}
          </div>
        </div>
      </div>
    </div>
  );
}
