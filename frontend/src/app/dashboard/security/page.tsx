'use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Search,
  RotateCcw,
  Layers,
  FileCheck,
  Flame,
} from 'lucide-react';

const CVE_ADVISORIES = [
  {
    cveId: 'CVE-2026-9812',
    title: 'mbedTLS Constant-Time Verification Timing Leak',
    severity: 'MEDIUM',
    affectedComponents: 'mbedTLS < 3.6.1',
    status: 'PATCHED in v2.0.1-SEC',
    description: 'Timing side-channel during Ed25519 signature computation on Arm Cortex-M33.',
  },
  {
    cveId: 'CVE-2025-4421',
    title: 'FreeRTOS TCP Stack Buffer Underflow',
    severity: 'LOW',
    affectedComponents: 'FreeRTOS-Plus-TCP',
    status: 'MITIGATED by MCUboot Stack Canary',
    description: 'Crafted ICMP packet length mismatch during OTA download stream.',
  },
];

export default function SecurityPage() {
  const {
    securityIncidents,
    mitigateIncident,
    devices,
    clearDeviceSafeMode,
    addAuditLog,
  } = useDeviceStore();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredIncidents = securityIncidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.deviceId.toLowerCase().includes(search.toLowerCase()) ||
      inc.attackVector.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const openIncidents = securityIncidents.filter((i) => i.status === 'OPEN');
  const safeModeDevices = devices.filter((d) => d.safeMode || d.status === 'SAFE_MODE');

  const handleResolveAll = () => {
    openIncidents.forEach((inc) => mitigateIncident(inc.id));
    safeModeDevices.forEach((d) => clearDeviceSafeMode(d.deviceId));
    addAuditLog({
      actor: 'SecOps-Operator (admin@guardian.nxp)',
      action: 'SECURITY_INCIDENTS_BULK_RESOLVED',
      category: 'SECURITY',
      target: 'All Open Incidents',
      status: 'SUCCESS',
      details: 'Operator authorized bulk mitigation and cleared Safe Mode quarantine.',
    });
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Security Operations Center (SOC)
            </h1>
            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-semibold">
              ROOT OF TRUST: HARDENED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time cryptographic integrity auditing, quarantine isolation tracking, and firmware CVE intelligence.
          </p>
        </div>

        {openIncidents.length > 0 && (
          <button
            onClick={handleResolveAll}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Acknowledge &amp; Clear All</span>
          </button>
        )}
      </div>

      {/* Root of Trust & Threat Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hardware Cryptographic Trust Store */}
        <div className="p-4 rounded-xl bg-[#060b08] border border-[#14221b] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-400" />
                Root of Trust Identity
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Immutable public key burned into NXP FRDM-MCXN236 ROM OTP fuses.
            </p>
            <div className="p-2.5 rounded-lg bg-[#08120d] border border-[#122419] font-mono text-[10px] space-y-1">
              <div className="text-slate-400">
                KEY_ID: <span className="text-emerald-400 font-bold">ed25519-nxp-root-key-2026</span>
              </div>
              <div className="text-slate-500 truncate">
                PUBKEY: 0x8a92b3c4...e1f2a3b4c5d6e7f8
              </div>
              <div className="text-slate-400">
                MONOTONIC_COUNTER: <span className="text-cyan-400 font-bold">Rev 0x0004</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-emerald-400/90 mt-3 pt-2 border-t border-[#102016] flex items-center justify-between">
            <span>Secure Boot: ENFORCED</span>
            <span>JTAG Lock: ENABLED</span>
          </div>
        </div>

        {/* Threat Level Matrix */}
        <div className="p-4 rounded-xl bg-[#060b08] border border-[#14221b] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Fleet Threat Level
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  safeModeDevices.length > 0
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {safeModeDevices.length > 0 ? 'DEFCON 3 - ELEVATED' : 'DEFCON 5 - NORMAL'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Real-time anomaly rating calculated from watchdog timeouts &amp; signature rejections.
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Quarantine Nodes:</span>
                <span className="text-rose-400 font-bold">{safeModeDevices.length} Nodes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Open Security Incidents:</span>
                <span className="text-amber-400 font-bold">{openIncidents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mitigated Attacks:</span>
                <span className="text-emerald-400 font-bold">
                  {securityIncidents.filter((i) => i.status === 'MITIGATED' || i.status === 'RESOLVED').length}
                </span>
              </div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-3 pt-2 border-t border-[#102016]">
            Anti-Rollback Counter Gate: <span className="text-emerald-400">Strict</span>
          </div>
        </div>

        {/* Dual-Bank Quarantine Defense */}
        <div className="p-4 rounded-xl bg-[#060b08] border border-[#14221b] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                Dual-Bank Sandbox Isolation
              </span>
              <span className="text-[10px] font-mono text-cyan-400">100% ISOLATED</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Candidate images are restricted to secondary slot until passing health gates.
            </p>
            <div className="p-2.5 rounded-lg bg-[#08120d] border border-[#122419] font-mono text-[10px] space-y-1">
              <div className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Golden Slot A Protected from Erasure</span>
              </div>
              <div className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Zero Brick Assurance Guaranteed</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-[#102016]">
            Fallback Recovery Time: <span className="text-emerald-400">&lt; 5.0 Seconds</span>
          </div>
        </div>
      </div>

      {/* Security Incidents Feed */}
      <div className="bg-[#060b08] border border-[#14221b] rounded-xl overflow-hidden">
        <div className="p-3.5 border-b border-[#14221b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-bold text-slate-200">
              Security Incident Feed &amp; Anomaly Log
            </span>
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all ${
                  severityFilter === sev
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#0f1d16] font-mono text-xs">
          {filteredIncidents.length === 0 ? (
            <div className="p-6 text-center text-slate-500 italic">
              Zero active security threats detected. All monitored nodes cryptographically secure.
            </div>
          ) : (
            filteredIncidents.map((incident) => {
              const isCrit = incident.severity === 'CRITICAL';
              const isHigh = incident.severity === 'HIGH';
              const isOpen = incident.status === 'OPEN';

              return (
                <div key={incident.id} className="p-4 hover:bg-[#09130e] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{incident.title}</span>
                        <span className="text-[10px] bg-[#0c1a13] text-emerald-400 border border-[#183324] px-2 py-0.2 rounded">
                          {incident.deviceId}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Vector: <span className="text-slate-300">{incident.attackVector}</span> &bull; Time:{' '}
                        {new Date(incident.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isCrit
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {incident.severity}
                      </span>

                      {isOpen ? (
                        <button
                          onClick={() => {
                            mitigateIncident(incident.id);
                            clearDeviceSafeMode(incident.deviceId);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        >
                          Mitigate &amp; Clear
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {incident.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-sans mt-2">{incident.details}</p>

                  <div className="mt-2.5 p-2 rounded bg-[#030604] border border-[#0e1c14] text-[10px] text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Guardian Automated Action: {incident.mitigation}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Firmware CVE & Threat Intelligence Feed */}
      <div className="bg-[#060b08] border border-[#14221b] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs font-bold text-slate-200 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            IoT Firmware CVE Threat Intelligence
          </span>
          <span className="text-[10px] font-mono text-slate-500">NVD Database Sync: Live</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CVE_ADVISORIES.map((cve) => (
            <div
              key={cve.cveId}
              className="p-3 rounded-lg bg-[#08120d] border border-[#122419] text-xs font-mono space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{cve.cveId}</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                  {cve.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">{cve.title}</p>
              <div className="text-[10px] text-slate-500">{cve.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}