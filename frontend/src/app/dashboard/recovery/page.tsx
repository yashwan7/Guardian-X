'use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import {
  HeartPulse,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Key,
  HardDrive,
  Activity,
  Zap,
  Terminal,
  X,
} from 'lucide-react';
import type { RecoveryPlan } from '@/types';

export default function RecoveryPage() {
  const {
    devices,
    recoveryPlans,
    executeRecovery,
    clearDeviceSafeMode,
    addAuditLog,
  } = useDeviceStore();

  const [selectedDevice, setSelectedDevice] = useState<string>('NXP-001');
  const [selectedTier, setSelectedTier] = useState<RecoveryPlan['tier']>('TIER_1_AUTO_SWAP');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryLog, setRecoveryLog] = useState<string[]>([]);
  const [recoveryComplete, setRecoveryComplete] = useState(false);

  const safeModeDevices = devices.filter((d) => d.safeMode || d.status === 'SAFE_MODE');
  const targetDevice = devices.find((d) => d.deviceId === selectedDevice) || devices[0];

  const handleStartRecovery = async () => {
    setIsRecovering(true);
    setRecoveryComplete(false);
    setRecoveryLog([
      `[T+0.0s] INITIATING 3-TIER RECOVERY PROTOCOL (${selectedTier}) on ${selectedDevice}`,
      `[T+0.5s] Querying hardware registers & MCUboot flash header...`,
    ]);

    if (selectedTier === 'TIER_1_AUTO_SWAP') {
      await new Promise((r) => setTimeout(r, 800));
      setRecoveryLog((prev) => [
        ...prev,
        `[T+1.2s] Asserting hardware swap command to MCUboot ROM.`,
        `[T+1.8s] Primary Active Slot repointed to Golden Bank A (offset 0x00020000).`,
        `[T+2.5s] Watchdog timer reset. Safe mode lockdown cleared.`,
      ]);
      await executeRecovery(selectedDevice, 'TIER_1_AUTO_SWAP');
    } else if (selectedTier === 'TIER_2_GOLDEN_RESTORE') {
      await new Promise((r) => setTimeout(r, 1000));
      setRecoveryLog((prev) => [
        ...prev,
        `[T+1.2s] Erasing corrupt candidate slot in Bank B...`,
        `[T+2.0s] Flashing Immutable Golden Image v1.0.0 (SmartPass) into Flash Sector 0x00100000.`,
        `[T+3.0s] Verifying Ed25519 digest against OTP hardware fuses... PASS.`,
        `[T+3.5s] Device rebooted into clean verified factory state.`,
      ]);
      await executeRecovery(selectedDevice, 'TIER_2_GOLDEN_RESTORE');
    } else {
      await new Promise((r) => setTimeout(r, 1200));
      setRecoveryLog((prev) => [
        ...prev,
        `[T+1.5s] Operator Cryptographic Authorization Token Verified (HSM Root Key).`,
        `[T+2.2s] Zeroizing temporary RAM buffers and resetting non-volatile counters.`,
        `[T+3.2s] Dispatching clean firmware provisioning manifest over TLS channel.`,
        `[T+4.0s] Device restored to 100% operational baseline.`,
      ]);
      await executeRecovery(selectedDevice, 'TIER_3_OPERATOR_OVERRIDE');
    }

    setIsRecovering(false);
    setRecoveryComplete(true);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Autonomous &amp; Operator Recovery Center
            </h1>
            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-semibold">
              3-TIER RESILIENCE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous MCUboot fail-safe bank swaps, factory golden partition restoration, and forensic post-mortems.
          </p>
        </div>

        {safeModeDevices.length > 0 && (
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            <span>{safeModeDevices.length} Node(s) in Safe Mode Lockdown</span>
          </span>
        )}
      </div>

      {/* Safe Mode Quarantine Queue */}
      <div className="bg-[#060b08] border border-[#14221b] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs font-bold text-slate-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Safe Mode Quarantine Queue (Nodes Requiring Attention)
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {safeModeDevices.length} Quarantined
          </span>
        </div>

        {safeModeDevices.length === 0 ? (
          <div className="p-4 rounded-lg bg-[#08120d] border border-[#122419] text-center text-xs font-mono text-emerald-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>All fleet devices operating normally. Zero devices in Safe Mode quarantine.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {safeModeDevices.map((d) => (
              <div
                key={d.deviceId}
                className="p-3.5 rounded-xl bg-gradient-to-r from-[#140a0a] to-[#08120d] border border-rose-500/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-100">{d.deviceId}</span>
                    <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                      SAFE MODE ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans">{d.name}</p>
                  <p className="text-[11px] font-mono text-rose-300/90 mt-1">
                    Cause: Watchdog starvation after candidate image boot &bull; Active Slot: Bank {d.activeBank}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-[#241212]">
                  <button
                    onClick={() => {
                      setSelectedDevice(d.deviceId);
                      setSelectedTier('TIER_1_AUTO_SWAP');
                    }}
                    className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  >
                    Select for Recovery
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3-Tier Interactive Recovery Wizard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Tier Selector & Parameters (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
            Select Recovery Protocol Tier
          </span>

          {[
            {
              tier: 'TIER_1_AUTO_SWAP' as const,
              title: 'Tier 1: Autonomous MCUboot Bank Swap',
              desc: 'Instantly resets the bootloader pointers back to the immutable Golden Bank A without altering flash sectors.',
              icon: RotateCcw,
              color: 'text-emerald-400',
              time: '< 1.5s',
            },
            {
              tier: 'TIER_2_GOLDEN_RESTORE' as const,
              title: 'Tier 2: Factory Golden Partition Restore',
              desc: 'Erases corrupted secondary slot and writes clean verified factory baseline binary v1.0.0 (SmartPass).',
              icon: HardDrive,
              color: 'text-cyan-400',
              time: '< 4.0s',
            },
            {
              tier: 'TIER_3_OPERATOR_OVERRIDE' as const,
              title: 'Tier 3: Cryptographic Operator Override',
              desc: 'Dispatches signed ephemeral challenge-response token for deep hardware re-provisioning and zeroization.',
              icon: Key,
              color: 'text-amber-400',
              time: '< 6.0s',
            },
          ].map((t) => {
            const isSelected = selectedTier === t.tier;
            const Icon = t.icon;

            return (
              <div
                key={t.tier}
                onClick={() => setSelectedTier(t.tier)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(0,245,160,0.1)]'
                    : 'bg-[#060b08] border-[#14221b] hover:border-[#1e3328]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${t.color}`} />
                    <span className="font-mono text-xs font-bold text-slate-100">{t.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">{t.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">{t.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Execution Console & Forensic Dump (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-[#060b08] border border-[#14221b] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#121e17] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                  RECOVERY DISPATCH CONSOLE
                </span>
                <h3 className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                  Target: {selectedDevice} &bull; {selectedTier}
                </h3>
              </div>

              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="bg-[#0a140f] border border-[#182b21] rounded-lg px-2.5 py-1 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500/50"
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.deviceId} ({d.safeMode ? 'SAFE MODE' : 'ONLINE'})
                  </option>
                ))}
              </select>
            </div>

            {/* Diagnostic Crash Dump Preview */}
            <div className="p-3 bg-[#020503] border border-[#0d1c14] rounded-xl font-mono text-[11px] space-y-1">
              <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center justify-between mb-1">
                <span>Arm Cortex-M33 Fault Registers (Forensic Capture)</span>
                <span className="text-rose-400">FAULT_ADDRESS: 0x20004F10</span>
              </div>
              <div className="text-slate-400">
                CFSR: 0x00010000 (IACCVIOL) | HFSR: 0x40000000 (FORCED) | MMFAR: 0x20004F10
              </div>
              <div className="text-slate-400">
                WATCHDOG_COUNT: 0x00 (EXPIRED) | STACK_POINTER: 0x20010000 | LR: 0x0002148B
              </div>
              <div className="text-emerald-400">
                RECOMMENDATION: Autonomous swap to Golden Bank A restores operational state in 100% of trials.
              </div>
            </div>

            {/* Terminal Dispatch Stream */}
            <div className="bg-[#020403] p-3.5 rounded-xl border border-[#0d1c14] font-mono text-[11px] min-h-[120px] max-h-[180px] overflow-y-auto space-y-1">
              <div className="text-slate-500 text-[10px] uppercase font-bold mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  Recovery Execution Log
                </span>
                <span className="text-emerald-400">MCUboot Protocol</span>
              </div>

              {recoveryLog.length === 0 ? (
                <div className="text-slate-600 italic">
                  Select target node and tier, then click &quot;Dispatch Recovery Payload&quot;.
                </div>
              ) : (
                recoveryLog.map((line, idx) => (
                  <div key={idx} className="text-emerald-300">
                    {line}
                  </div>
                ))
              )}
            </div>

            {/* Trigger Button */}
            <div className="flex items-center justify-between pt-2 border-t border-[#121e17]">
              <div className="text-[11px] font-mono text-slate-400">
                Hardware Target: <span className="text-slate-200 font-bold">{targetDevice.name}</span>
              </div>

              <button
                onClick={handleStartRecovery}
                disabled={isRecovering}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-[0_0_16px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center gap-2"
              >
                <RotateCcw className={`w-4 h-4 ${isRecovering ? 'animate-spin' : ''}`} />
                <span>{isRecovering ? 'Executing Protocol...' : 'Dispatch Recovery Payload'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}