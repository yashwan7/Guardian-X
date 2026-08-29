'use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import {
  HardDrive,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  ShieldAlert,
  Search,
  Zap,
  Lock,
  Download,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { FirmwareRelease } from '@/types';

export default function FirmwarePage() {
  const { firmware, addFirmware, updateFirmwareStatus, devices, updateDevice, addEvent, addAuditLog } =
    useDeviceStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedFirmware, setSelectedFirmware] = useState<FirmwareRelease | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccessMsg, setDeploySuccessMsg] = useState<string | null>(null);

  // New Firmware Form
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [type, setType] = useState<FirmwareRelease['type']>('STABLE');
  const [description, setDescription] = useState('');
  const [isFaultDemo, setIsFaultDemo] = useState(false);
  const [healthGatePasses, setHealthGatePasses] = useState(true);

  const filteredFirmware = firmware.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.version.toLowerCase().includes(search.toLowerCase()) ||
      f.sha256.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUploadRelease = (e: React.FormEvent) => {
    e.preventDefault();
    const sha =
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newRelease: FirmwareRelease = {
      id: `fw-${Date.now()}`,
      name,
      version,
      type,
      sha256: sha,
      signatureStatus: 'SIGNED',
      targetHardware: 'NXP FRDM-MCXN236',
      minimumBootloader: '1.0.0',
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      deploymentCount: 0,
      description,
      healthGatePasses: !isFaultDemo && healthGatePasses,
      isBreakingDemo: isFaultDemo,
      fileSizeKb: Math.floor(Math.random() * 60) + 340,
      signedBy: 'Release-Officer-SecOps (Ed25519 HSM)',
      changelog: [description, 'Verified with MCUboot Dual-Bank header'],
    };

    addFirmware(newRelease);
    setShowUploadModal(false);
    setName('');
    setVersion('');
    setDescription('');
    setIsFaultDemo(false);
  };

  const handleDeployToTarget = (firmwareId: string, deviceId: string) => {
    const fw = firmware.find((f) => f.id === firmwareId);
    if (!fw) return;

    setIsDeploying(true);
    setDeploySuccessMsg(null);

    addEvent({
      id: `evt-${Date.now()}`,
      deviceId,
      eventType: 'OTA_DEPLOYMENT_INITIATED',
      severity: 'INFO',
      message: `Deploying candidate ${fw.name} (v${fw.version}) to ${deviceId}`,
      timestamp: new Date().toISOString(),
    });

    updateDevice(deviceId, {
      status: 'UPDATING',
      updateState: 'DOWNLOADING',
      led: 'YELLOW',
      oledLines: [`DOWNLOADING v${fw.version}`, 'Writing Bank B...'],
    });

    setTimeout(() => {
      updateDevice(deviceId, {
        updateState: 'VERIFYING',
        oledLines: [`VERIFYING SHA-256`, 'Signature OK'],
      });
    }, 1200);

    setTimeout(() => {
      if (fw.isBreakingDemo) {
        // Fault injection trigger
        updateDevice(deviceId, {
          updateState: 'HEALTH_CHECK',
          health: 15,
          led: 'RED',
          oledLines: ['!HEALTH CHECK FAIL!', 'Watchdog Starvation'],
        });

        setTimeout(() => {
          updateDevice(deviceId, {
            status: 'SAFE_MODE',
            safeMode: true,
            activeBank: 'A',
            firmwareVersion: '1.0.0',
            health: 75,
            updateState: 'SAFE_MODE',
            rollbackCount: 1,
            oledLines: ['!SAFE MODE!', 'Rolled back to v1.0.0 A'],
          });
          setIsDeploying(false);
          setDeploySuccessMsg(`Fault detected in ${fw.version}. Autonomous rollback to Bank A executed!`);
        }, 2000);
      } else {
        // Successful OTA
        updateDevice(deviceId, {
          activeBank: 'B',
          inactiveBank: 'A',
          firmwareVersion: fw.version,
          bankBFirmware: `v${fw.version} (${fw.name})`,
          status: 'ONLINE',
          updateState: 'CONFIRMED',
          health: 100,
          led: 'BLUE',
          oledLines: [`RUNNING v${fw.version}`, 'Health Gate: 100% OK'],
        });
        setIsDeploying(false);
        setDeploySuccessMsg(`Successfully deployed ${fw.version} to ${deviceId} on Bank B!`);
      }
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Firmware Release Management
            </h1>
            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-semibold">
              {firmware.length} SIGNED PACKAGES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cryptographically signed dual-bank binaries, SHA-256 integrity hashes, and MCUboot manifests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-[0_0_16px_rgba(16,185,129,0.3)]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Release</span>
          </button>
        </div>
      </div>

      {deploySuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{deploySuccessMsg}</span>
          </div>
          <button onClick={() => setDeploySuccessMsg(null)} className="text-slate-400 hover:text-slate-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#060b08] border border-[#14221b] rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search release name, version, SHA-256..."
            className="w-full bg-[#0a140f] border border-[#182b21] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'APPROVED', 'DRAFT', 'QUARANTINED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all ${
                statusFilter === status
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1611]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Firmware Releases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFirmware.map((rel) => {
          const isBroken = rel.type === 'BROKEN';
          const isSecurity = rel.type === 'SECURITY_PATCH';

          return (
            <div
              key={rel.id}
              className={`p-4 rounded-xl bg-[#060b08] border transition-all duration-200 hover:border-emerald-500/40 flex flex-col justify-between ${
                isBroken
                  ? 'border-rose-500/30 bg-gradient-to-br from-[#0a0505] to-[#060b08]'
                  : isSecurity
                  ? 'border-amber-500/30'
                  : 'border-[#14221b]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-100">{rel.name}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                        v{rel.version}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      Target: {rel.targetHardware} &bull; Min Bootloader: {rel.minimumBootloader}
                    </span>
                  </div>

                  {isBroken ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> FAULT TEST
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> SIGNED
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 font-sans mb-3 line-clamp-2">{rel.description}</p>

                {/* Crypto & SHA256 Box */}
                <div className="p-2.5 rounded-lg bg-[#08120d] border border-[#122419] font-mono text-[10px] space-y-1 mb-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Lock className="w-2.5 h-2.5 text-emerald-400" />
                      SHA-256 DIGEST:
                    </span>
                    <span className="text-slate-400">{rel.fileSizeKb || 380} KB</span>
                  </div>
                  <div className="text-emerald-400/90 truncate select-all">{rel.sha256}</div>
                  <div className="text-slate-500 text-[9px]">
                    Signer: <span className="text-slate-300">{rel.signedBy || 'Ed25519 Root Key'}</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 border-t border-[#122419] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedFirmware(rel)}
                  className="px-3 py-1.5 rounded-lg bg-[#0a1610] hover:bg-[#12281d] border border-[#183324] text-[11px] font-mono text-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  <FileCode className="w-3 h-3" />
                  <span>Inspect Header</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDeployToTarget(rel.id, 'NXP-001')}
                    disabled={isDeploying}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-mono font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Deploy to NXP-001</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Firmware Header Inspector Modal */}
      {selectedFirmware && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050a07] border border-[#162a1f] rounded-2xl w-full max-w-xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in font-mono flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#122018] pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  MCUboot Binary Header &bull; {selectedFirmware.name} (v{selectedFirmware.version})
                </h3>
              </div>
              <button
                onClick={() => setSelectedFirmware(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#020503] p-3 rounded-lg border border-[#0d1c14] text-[11px] text-emerald-400 space-y-1 overflow-x-auto">
              <div className="text-slate-500 text-[10px] uppercase font-bold mb-2">
                --- MCUBOOT IMAGE HEADER MANIFEST ---
              </div>
              <div>MAGIC: 0x96f3b83d (IMAGE_MAGIC_MCUX)</div>
              <div>LOAD_ADDR: 0x00020000 | HDR_SIZE: 0x0020</div>
              <div>IMAGE_SIZE: {(selectedFirmware.fileSizeKb || 380) * 1024} bytes</div>
              <div>FLAGS: 0x00000001 (RAM_LOAD | DUAL_BANK_SWAP)</div>
              <div>VERSION: {selectedFirmware.version}.0+0</div>
              <div>SHA256: {selectedFirmware.sha256}</div>
              <div>SIGNATURE_TYPE: ED25519_PUBKEY_TAG (0x01)</div>
              <div className="text-slate-500 mt-2">
                HEALTH_GATE_ASSERTION: {selectedFirmware.healthGatePasses ? 'ENABLED (PASS)' : 'FAULT_INJECTION_ACTIVE'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-300">Changelog &amp; Release Notes</span>
              <ul className="text-xs text-slate-400 list-disc list-inside space-y-0.5">
                {selectedFirmware.changelog?.map((c, i) => (
                  <li key={i}>{c}</li>
                )) || <li>{selectedFirmware.description}</li>}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#122018]">
              <button
                onClick={() => setSelectedFirmware(null)}
                className="px-4 py-1.5 rounded-lg bg-[#0c1a13] text-slate-300 hover:text-slate-100 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Firmware Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050a07] border border-[#162a1f] rounded-2xl w-full max-w-lg p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in font-mono">
            <div className="flex items-center justify-between border-b border-[#122018] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Upload Signed Firmware Package</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadRelease} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Release Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SmartPass Fare Optimization"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Semantic Version</label>
                  <input
                    type="text"
                    required
                    placeholder="2.1.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Release Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="STABLE">STABLE (Production)</option>
                    <option value="SECURITY_PATCH">SECURITY_PATCH</option>
                    <option value="BETA">BETA Candidate</option>
                    <option value="BROKEN">BROKEN (Fault Test)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Release Description &amp; Scope</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Details regarding updates to peripherals, security patches, or features..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Fault Simulation Checkbox */}
              <div className="p-3 bg-[#08120d] border border-[#13261b] rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFaultDemo}
                    onChange={(e) => setIsFaultDemo(e.target.checked)}
                    className="rounded border-[#14261c] bg-[#09130e] text-emerald-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-bold">
                    Mark as Fault Injection Test (Attack Lab Demo)
                  </span>
                </label>
                <p className="text-[10px] text-slate-400">
                  When enabled, this release will induce watchdog starvation post-boot to demonstrate Guardian&apos;s automatic health-gated rollback.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0b1610] text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                >
                  Sign &amp; Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}