'use client';

export default function OLEDPreview({ lines = [] }: { lines?: string[] }) {
  const displayLines = [...lines, '', '', '', ''].slice(0, 4);
  return (
    <div className="bg-black border-2 border-slate-700 rounded p-3 w-40 h-24 flex flex-col justify-center gap-1 overflow-hidden relative shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.05)_0%,transparent_100%)] pointer-events-none" />
      {displayLines.map((line, i) => (
        <div key={i} className="font-mono text-[10px] text-cyan-400 whitespace-pre leading-none truncate" style={{ textShadow: '0 0 2px rgba(34,211,238,0.5)' }}>
          {line || ' '}
        </div>
      ))}
    </div>
  );
}