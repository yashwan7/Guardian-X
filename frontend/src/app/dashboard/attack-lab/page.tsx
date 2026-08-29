'use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import {
  FlaskConical,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  Lock,
  RotateCcw,
  Zap,
  Activity,
  Terminal,
  FileCode,
  Layers,
  Cpu,
} from 'lucide-react';
import type { AttackScenario } from '@/types';

export default function AttackLabPage() {
  const {
    attackScenarios,
    devices,
    triggerAttack,
    clearDeviceSafeMode,
    securityIncidents,
  } = useDeviceStore();

  const [selectedScenario, setSelectedScenario] = useState<AttackScenario>(attackScenarios[0]);
  const [targetDeviceId, setTargetDeviceId] = useState<string>('NXP-001');
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackStep, setAttackStep] = useState<number>(0);
  const [attackOutput, setAttackOutput] = useState<string[]>([]);

  const targetDevice = devices.find((d) => d.deviceId === targetDeviceId) || devices[0];

  const handleLaunchAttack = async () => {
    setIsAttacking(true);
    setAttackStep(1);
    setAttackOutput([
      `[T+0.0s] INITIATING CYBER VECTOR: ${selectedScenario.name}`,
      `[T+0.2s] Target: ${targetDeviceId} (Bank ${selectedScenario.targetBank})`,
      `[T+0.5s] Transmitting payload stream to candidate flash partition...`,
    ]);

    await new Promise((r) => setTimeout(r, 1000));
    setAttackStep(2);
    setAttackOutput((prev) => [
      ...prev,
      `[T+1.2s] INGESTION COMPLETE. MCUboot Pre-Boot Verifier invoked.`,
      `[T+1.5s] Root Public Key: ed25519-nxp-root-key-2026`,
    ]);

    if (selectedScenario.vector === 'SIGNATURE_FORGERY') {
      await new Promise((r) => setTimeout(r, 1200));
      setAttackStep(3);
      setAttackOutput((prev) => [
        ...prev,
        `[T+2.2s] [GUARDIAN DEFENSE] Ed25519 Cryptographic Signature Check FAILED!`,
        `[T+2.5s] Signature mismatch with immutable ROM public key.`,
        `[T+2.8s] Candidate partition marked CORRUPTED. Flash write aborted.`,
        `[T+3.0s] Active Bank A remains 100% OPERATIONAL. Zero downtime!`,
      ]);
      await triggerAttack(selectedScenario.id, targetDeviceId);
      setIsAttacking(false);
      setAttackStep(4);
    } else if (selectedScenario.vector === 'DOWNGRADE_ATTACK') {
      await new Promise((r) => setTimeout(r, 1000));
      setAttackStep(3);
      setAttackOutput((prev) => [
        ...prev,
        `[T+2.0s] [GUARDIAN DEFENSE] Anti-Rollback Monotonic Counter Check FAILED!`,
        `[T+2.3s] Device Hardware OTP Counter: 0x0004 | Injected Binary: 0x0001`,
        `[T+2.6s] Security Downgrade Blocked by MCUboot ROM. Candidate rejected.`,
        `[T+2.8s] Active Bank A remains online with zero risk!`,
      ]);
      await triggerAttack(selectedScenario.id, targetDeviceId);
      setIsAttacking(false);
      setAttackStep(4);
    } else if (selectedScenario.vector === 'RUNTIME_FAULT') {
      await new Promise((r) => setTimeout(r, 1200));
      setAttackStep(2);
      setAttackOutput((prev) => [
        ...prev,
        `[T+2.0s] Signature VALID. Candidate booted in temporary Bank B.`,
        `[T+2.5s] Fault injected: Mutex deadlock in RFID peripheral driver!`,
      ]);
      await new Promise((r) => setTimeout(r, 1200));
      setAttackStep(3);
      setAttackOutput((prev) => [
        ...prev,
        `[T+3.7s] Health Score collapsed to 12%! Watchdog heartbeat missed.`,
        `[T+4.5s] [AUTONOMOUS ROLLBACK] Hardware watchdog reset fired!`,
        `[T+5.0s] MCUboot automatically swapped active slot back to Golden Bank A!`,
        `[T+5.5s] Device entered SAFE MODE lockdown. Attack mitigated in < 6s!`,
      ]);
      await triggerAttack(selectedScenario.id, targetDeviceId);
      setIsAttacking(false);
      setAttackStep(4);
    } else {
      await new Promise((r) => setTimeout(r, 1000));
      setAttackStep(3);
      setAttackOutput((prev) => [
        ...prev,
        `[T+2.0s] [GUARDIAN DEFENSE] Packet CRC & SHA-256 chunk verification failed.`,
        `[T+2.5s] Malformed frames throttled by rate limiter. Attack mitigated.`,
      ]);
      await triggerAttack(selectedScenario.id, targetDeviceId);
      setIsAttacking(false);
      setAttackStep(4);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Attack Lab &amp; Cyber Resilience Studio
            </h1>
            <span className="text-[10px] font-mono bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded font-semibold">
              INTERACTIVE FAULT INJECTION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate realistic IoT firmware attacks and witness real-time cryptographic defenses and autonomous dual-bank rollbacks.
          </p>
        </div>

        {targetDevice.safeMode && (
          <button
            onClick={() => clearDeviceSafeMode(targetDeviceId)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition-all shadow-[0_0_12px_rgba(244,63,94,0.2)]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Safe Mode Quarantine</span>
          </button>
        )}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Attack Vector Catalog (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
            Select Attack Vector Scenario
          </span>

          {attackScenarios.map((scenario) => {
            const isSelected = selectedScenario.id === scenario.id;
            const isCrit = scenario.severity === 'CRITICAL';

            return (
              <div
                key={scenario.id}
                onClick={() => {
                  setSelectedScenario(scenario);
                  setAttackStep(0);
                  setAttackOutput([]);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(0,245,160,0.1)]'
                    : 'bg-[#060b08] border-[#14221b] hover:border-[#1e3328]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <FlaskConical
                      className={`w-4 h-4 ${
                        isSelected ? 'text-emerald-400' : isCrit ? 'text-rose-400' : 'text-slate-400'
                      }`}
                    />
                    <span
                      className={`font-mono text-xs font-bold ${
                        isSelected ? 'text-emerald-300' : 'text-slate-200'
                      }`}
                    >
                      {scenario.name}
                    </span>
                  </div>

                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                      isCrit
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {scenario.severity}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-sans mb-2.5 line-clamp-2">
                  {scenario.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-[#101b15]">
                  <span>Target: Bank {scenario.targetBank}</span>
                  <span className="text-emerald-400">Response: {scenario.mitigationTime}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Interactive Attack Execution Console (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-[#060b08] border border-[#14221b] flex flex-col gap-4">
            {/* Scenario Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#121e17] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                  ACTIVE SIMULATION VECTOR
                </span>
                <h2 className="text-base font-bold text-slate-100 font-mono mt-0.5">
                  {selectedScenario.name}
                </h2>
              </div>

              {/* Target Device Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Target:</span>
                <select
                  value={targetDeviceId}
                  onChange={(e) => setTargetDeviceId(e.target.value)}
                  className="bg-[#0a140f] border border-[#182b21] rounded-lg px-2.5 py-1 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500/50"
                >
                  {devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.deviceId} ({d.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payload Preview */}
            <div className="p-3 rounded-xl bg-[#030604] border border-[#0f1d15] font-mono text-[11px]">
              <div className="text-slate-500 text-[9px] uppercase font-bold mb-1 flex items-center justify-between">
                <span>Malicious Firmware Payload Snippet</span>
                <span className="text-rose-400">SIMULATED EXPLOIT</span>
              </div>
              <div className="text-rose-300/90 select-all overflow-x-auto">{selectedScenario.payloadPreview}</div>
            </div>

            {/* Defense State Machine Stepper */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-300 font-bold uppercase tracking-wider block">
                Guardian 5-Stage Defense Engine
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { step: 1, label: '1. Ingestion', desc: 'OTA Chunk Reception' },
                  { step: 2, label: '2. Verification', desc: 'Ed25519 & Monotonic' },
                  { step: 3, label: '3. Health Gating', desc: 'Watchdog & Sensors' },
                  { step: 4, label: '4. Mitigation', desc: 'Safe Mode / Rollback' },
                ].map((s) => {
                  const isCurrent = attackStep === s.step;
                  const isDone = attackStep > s.step;

                  return (
                    <div
                      key={s.step}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isCurrent
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 animate-pulse'
                          : isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-[#030604] border-[#0e1913] text-slate-600'
                      }`}
                    >
                      <div className="text-[10px] font-mono font-bold">{s.label}</div>
                      <div className="text-[8px] text-slate-400 mt-0.5">{s.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Attack Terminal Stream */}
            <div className="bg-[#020403] p-3.5 rounded-xl border border-[#0d1c14] font-mono text-[11px] min-h-[140px] max-h-[220px] overflow-y-auto space-y-1">
              <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  Live Defense Trace Log
                </span>
                <span className="text-emerald-400">MCUboot v1.0.0</span>
              </div>

              {attackOutput.length === 0 ? (
                <div className="text-slate-600 italic">
                  Ready. Click &quot;Launch Attack Scenario&quot; to execute real-time simulation.
                </div>
              ) : (
                attackOutput.map((line, idx) => (
                  <div
                    key={idx}
                    className={`${
                      line.includes('FAILED') || line.includes('CORRUPTED') || line.includes('SAFE MODE')
                        ? 'text-rose-400 font-bold'
                        : line.includes('GUARDIAN DEFENSE') || line.includes('OPERATIONAL')
                        ? 'text-emerald-400 font-bold'
                        : 'text-slate-300'
                    }`}
                  >
                    {line}
                  </div>
                ))
              )}
            </div>

            {/* Launch Attack Button */}
            <div className="flex items-center justify-between pt-2 border-t border-[#121e17]">
              <div className="text-[11px] font-mono text-slate-400">
                Active Node State:{' '}
                <span className="text-emerald-400 font-bold">
                  {targetDevice.safeMode ? 'SAFE MODE LOCKDOWN' : targetDevice.status}
                </span>
              </div>

              <button
                onClick={handleLaunchAttack}
                disabled={isAttacking}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-50 flex items-center gap-2"
              >
                <Zap className={`w-4 h-4 ${isAttacking ? 'animate-spin' : ''}`} />
                <span>{isAttacking ? 'Executing Simulation...' : 'Launch Attack Scenario'}</span>
              </button>
            </div>
          </div>

          {/* Security Incident Summary Feed */}
          <div className="bg-[#060b08] border border-[#14221b] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Recent Attack Lab Defense Records
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {securityIncidents.length} Logged Incidents
              </span>
            </div>

            <div className="space-y-2">
              {securityIncidents.slice(0, 3).map((inc) => (
                <div
                  key={inc.id}
                  className="p-2.5 rounded-lg bg-[#08120d] border border-[#122419] text-xs font-mono flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      {inc.title}
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        {inc.deviceId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">{inc.mitigation}</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                    {inc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}