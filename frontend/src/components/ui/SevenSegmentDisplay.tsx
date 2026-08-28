'use client';

import React from 'react';

interface SevenSegmentDisplayProps {
  char?: string; // 'A', 'b', '1', '2', 'd', 'E', 'r', 'S', '-'
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  glow?: boolean;
}

// 7-segment mapping: [a, b, c, d, e, f, g]
// Segment positions:
//     -- a --
//    |       |
//    f       b
//    |       |
//     -- g --
//    |       |
//    e       c
//    |       |
//     -- d --   (dp)
const SEGMENT_MAP: Record<string, boolean[]> = {
  'A': [true, true, true, false, true, true, true],   // Bank A
  'a': [true, true, true, false, true, true, true],
  'B': [false, false, true, true, true, true, true],  // 'b' Bank B
  'b': [false, false, true, true, true, true, true],
  '1': [false, true, true, false, false, false, false],
  '2': [true, true, false, true, true, false, true],
  'd': [false, true, true, true, true, false, true],  // 'd' Downloading
  'E': [true, false, false, true, true, true, true],  // 'E' Error / Fault
  'e': [true, false, false, true, true, true, true],
  'r': [false, false, false, false, true, false, true], // 'r' Rollback
  'S': [true, false, true, true, false, true, true],  // 'S' Safe Mode
  '-': [false, false, false, false, false, false, true], // '-' Idle
  ' ': [false, false, false, false, false, false, false],
};

export default function SevenSegmentDisplay({
  char = 'A',
  size = 'md',
  label = 'ACTIVE BANK',
  glow = true,
}: SevenSegmentDisplayProps) {
  const segments = SEGMENT_MAP[char] || SEGMENT_MAP['A'];
  const [a, b, c, d, e, f, g] = segments;

  const scale = size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-125' : 'scale-100';

  const onClass = glow
    ? 'bg-cyan-400 shadow-[0_0_10px_#00f0ff,0_0_20px_#00f0ff88]'
    : 'bg-cyan-400';
  const offClass = 'bg-slate-800/40 opacity-15';

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-b from-[#0a0e17] to-[#05070c] rounded-xl border border-cyan-500/20 shadow-inner">
      {label && (
        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold mb-2">
          {label}
        </span>
      )}

      {/* 7-Segment SVG Container */}
      <div className={`relative w-20 h-32 flex items-center justify-center ${scale}`}>
        {/* Outer Bezel */}
        <div className="absolute inset-0 bg-[#060a12] rounded-lg border border-slate-800 shadow-2xl" />

        {/* SVG Drawing for accurate beveled segments */}
        <svg
          viewBox="0 0 100 160"
          className="relative w-full h-full p-2 filter drop-shadow-[0_0_8px_rgba(0,212,255,0.3)]"
        >
          {/* Segment A (Top) */}
          <polygon
            points="20,15 80,15 72,25 28,25"
            className={`transition-all duration-200 ${a ? onClass.split(' ')[0] : offClass.split(' ')[0]}`}
            fill={a ? '#00f0ff' : '#1e293b'}
            filter={a && glow ? 'url(#glow)' : undefined}
          />

          {/* Segment B (Top-Right) */}
          <polygon
            points="82,18 88,24 88,72 80,68 76,28"
            className={`transition-all duration-200 ${b ? onClass.split(' ')[0] : offClass.split(' ')[0]}`}
            fill={b ? '#00f0ff' : '#1e293b'}
            filter={b && glow ? 'url(#glow)' : undefined}
          />

          {/* Segment C (Bottom-Right) */}
          <polygon
            points="80,88 88,84 88,136 82,142 76,132"
            className={`transition-all duration-200 ${c ? onClass.split(' ')[0] : offClass.split(' ')[0]}`}
            fill={c ? '#00f0ff' : '#1e293b'}
            filter={c && glow ? 'url(#glow)' : undefined}
          />

          {/* Segment D (Bottom) */}
          <polygon
            points="28,135 72,135 80,145 20,145"
            className={`transition-all duration-200 ${d ? onClass.split(' ')[0] : offClass.split(' ')[0]}`}
            fill={d ? '#00f0ff' : '#1e293b'}
            filter={d && glow ? 'url(#glow)' : undefined}
          />

          {/* Segment E (Bottom-Left) */}
          <polygon
            points="12,84 20,88 24,132 18,142 12,136"
            className={`transition-all duration-200 ${e ? onClass.split(' ')[0] : offClass.split(' ')[0]}`}
            fill={e ? '#00f0ff' : '#1e293b'}
            filter={e && glow ? 'url(#glow)' : undefined}
          />

          {/* Segment F (Top-Left) */}
          <polygon
            points="12,24 18,18 24,28 20,68 12,72"
            className={`transition-all duration-200 ${f ? onClass.split(' ')[0] : offClass.split(' ')[0]}`}
            fill={f ? '#00f0ff' : '#1e293b'}
            filter={f && glow ? 'url(#glow)' : undefined}
          />

          {/* Segment G (Middle) */}
          <polygon
            points="22,78 28,73 72,73 78,78 72,83 28,83"
            className={`transition-all duration-200 ${g ? onClass.split(' ')[0] : offClass.split(' ')[0]}`}
            fill={g ? '#00f0ff' : '#1e293b'}
            filter={g && glow ? 'url(#glow)' : undefined}
          />

          {/* Decimal Point */}
          <circle
            cx="92"
            cy="142"
            r="4"
            fill={char === 'A' || char === 'b' ? '#00f0ff' : '#1e293b'}
            opacity={char === 'A' || char === 'b' ? 0.9 : 0.2}
          />

          {/* SVG Glow Filter Definition */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* State Caption */}
      <div className="mt-2 text-center">
        <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
          {char === 'A' || char === 'a' ? 'BANK A (v1.0)' :
           char === 'b' || char === 'B' ? 'BANK B (v2.0)' :
           char === 'E' ? 'FAULT / ERROR' :
           char === 'd' ? 'OTA STAGING' :
           char === 'r' ? 'ROLLBACK RESTORE' : `MODE ${char}`}
        </span>
      </div>
    </div>
  );
}
