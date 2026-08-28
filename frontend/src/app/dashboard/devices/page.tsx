export default function DevicesPage() {
  return (
    <div className="h-full flex items-center justify-center flex-col gap-4">
      <div className="w-16 h-16 rounded bg-[#1a2740] flex items-center justify-center opacity-50">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
      </div>
      <h2 className="text-xl font-mono text-slate-500 uppercase tracking-widest">PHASE 2 - COMING SOON</h2>
      <p className="text-slate-600 text-sm">The Devices module is currently under development.</p>
    </div>
  );
}