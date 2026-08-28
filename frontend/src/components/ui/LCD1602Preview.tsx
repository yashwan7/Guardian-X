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
      ? 'bg-[#02180c] border-[#074020] text-[#00f5a0] shadow-[0_0_20px_rgba(0,245,160,0.18)]'
      : backlight === 'blue'
      ? 'bg-[#001d24] border-[#06505e] text-[#2dd4bf] shadow-[0_0_20px_rgba(45,212,191,0.18)]'
      : 'bg-[#261800] border-[#5e3c00] text-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.18)]';

  const pixelGlow =
    backlight === 'green'
      ? 'drop-shadow-[0_0_4px_#00f5a0]'
      : backlight === 'blue'
      ? 'drop-shadow-[0_0_4px_#2dd4bf]'
      : 'drop-shadow-[0_0_4px_#fbbf24]';

  return (
    <div className="flex flex-col items-center w-full">
      {/* Outer LCD Bezel Frame */}
      <div className="w-full bg-[#060b08] border-2 border-[#14261c] rounded-xl p-3.5 shadow-2xl relative">
        {/* Mounting Screws on corners */}
        <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-slate-800 border border-slate-900 shadow-inner flex items-center justify-center">
          <div className="w-1 h-0.5 bg-slate-950" />
        </div>
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-800 border border-slate-900 shadow-inner flex items-center justify-center">
          <div className="w-1 h-0.5 bg-slate-950" />
        </div>
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-slate-800 border border-slate-900 shadow-inner flex items-center justify-center">
          <div className="w-1 h-0.5 bg-slate-950" />
        </div>
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-800 border border-slate-900 shadow-inner flex items-center justify-center">
          <div className="w-1 h-0.5 bg-slate-950" />
        </div>

        {/* LCD Header Label */}
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase">
            16x2 HD44780 LCD (I2C: 0x27)
          </span>
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            SDA: P4_0 &bull; SCL: P4_1
          </span>
        </div>

        {/* Backlit Display Screen */}
        <div
          className={`relative rounded-lg border-2 p-3 font-mono text-sm tracking-[0.18em] flex flex-col justify-center gap-1.5 select-none overflow-hidden transition-all duration-300 ${bgStyle}`}
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {/* Subtle LCD Dot Matrix Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
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
