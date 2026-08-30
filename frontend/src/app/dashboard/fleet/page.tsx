'use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import MetricCard from '@/components/ui/MetricCard';
import FleetHealth from '@/components/dashboard/FleetHealth';
import {
  Server,
  Activity,
  ShieldAlert,
  Search,
  RefreshCw,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function FleetPage() {
  const { devices, fleetSummary, updateDevice, addEvent, addAuditLog } = useDeviceStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isScanning, setIsScanning] = useState(false);

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.deviceId.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.location && d.location.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRunHealthScan = () => {
    setIsScanning(true);
    addEvent({
      id: `evt-${Date.now()}`,
      deviceId: 'FLEET-ALL',
      eventType: 'FLEET_DIAGNOSTIC_SCAN',
      severity: 'INFO',
      message: 'Operator initiated fleet-wide health check scan across all active nodes.',
      timestamp: new Date().toISOString(),
    });

    setTimeout(() => {
      devices.forEach((d) => {
        if (!d.safeMode && d.status !== 'FAILED') {
          updateDevice(d.deviceId, {
            health: Math.min(100, Math.max(88, Math.floor(Math.random() * 12) + 89)),
            lastSeen: new Date().toISOString(),
          });
        }
      });
      setIsScanning(false);
      addAuditLog({
        actor: 'Operator (admin@guardian.nxp)',
        action: 'FLEET_HEALTH_SCAN_COMPLETED',
        category: 'SYSTEM',
        target: 'All Nodes',
        status: 'SUCCESS',
        details: 'Comprehensive diagnostic ping completed with 100% response rate.',
      });
    }, 1500);
  };

  const handleQuarantineDevice = (deviceId: string) => {
    updateDevice(deviceId, {
      status: 'SAFE_MODE',
      safeMode: true,
      led: 'RED',
      updateState: 'SAFE_MODE',
      oledLines: ['!QUARANTINE!', 'Safe Mode Active'],
    });
    addEvent({
      id: `evt-${Date.now()}`,
      deviceId,
      eventType: 'OPERATOR_QUARANTINE_APPLIED',
      severity: 'HIGH',
      message: `Device ${deviceId} placed into Safe Mode quarantine by SecOps operator.`,
      timestamp: new Date().toISOString(),
    });
  };

  const bankACount = devices.filter((d) => d.activeBank === 'A').length;
  const bankBCount = devices.filter((d) => d.activeBank === 'B').length;

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Fleet Overview &amp; Health Matrix
            </h1>
            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-semibold tracking-wider">
              {devices.length} NODES MONITORED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time dual-bank distribution, operational health grading, and fleetwide telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunHealthScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all shadow-[0_0_12px_rgba(0,245,160,0.1)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Nodes...' : 'Run Diagnostics'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <MetricCard
          label="Total Fleet"
          value={fleetSummary?.totalDevices ?? devices.length}
          color="info"
          icon="server"
        />
        <MetricCard
          label="Healthy"
          value={fleetSummary?.healthy ?? 4}
          color="success"
          icon="check-circle"
        />
        <MetricCard
          label="Active Updating"
          value={fleetSummary?.updating ?? 1}
          color="warning"
          icon="refresh"
        />
        <MetricCard
          label="Safe Mode Locked"
          value={fleetSummary?.safeMode ?? 0}
          color="orange"
          icon="shield-alert"
        />
        <MetricCard
          label="Bank A Primary"
          value={bankACount}
          color="accent"
          icon="layers"
        />
        <MetricCard
          label="Bank B Primary"
          value={bankBCount}
          color="info"
          icon="layers"
        />
      </div>

      {/* Distribution & Bank Ratio Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Fleet Health & Integrity Summary */}
        <FleetHealth summary={fleetSummary} isLoading={false} />

        {/* Dual Bank Allocation */}
        <div className="p-4 rounded-xl bg-[#060b08] border border-[#14221b] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Dual-Bank Active Allocation
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                {Math.round((bankACount / (devices.length || 1)) * 100)}% Bank A
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Partition distribution across physical MCUboot flash slots.
            </p>
            <div className="w-full h-3 rounded-full bg-[#101b15] overflow-hidden flex">
              <div
                style={{ width: `${(bankACount / (devices.length || 1)) * 100}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                title={`Bank A: ${bankACount} nodes`}
              />
              <div
                style={{ width: `${(bankBCount / (devices.length || 1)) * 100}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                title={`Bank B: ${bankBCount} nodes`}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-4 pt-3 border-t border-[#121f18]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Bank A: {bankACount} Nodes (v1.0.0 Golden)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Bank B: {bankBCount} Nodes (v2.0.0 Active)</span>
            </div>
          </div>
        </div>

        {/* Fleet Firmware Spread */}
        <div className="p-4 rounded-xl bg-[#060b08] border border-[#14221b] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Active Firmware Spread
              </span>
              <span className="text-[10px] font-mono text-cyan-400">2 Versions Active</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Monitored semantic versions executing across the fleet.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300">v1.0.0 (SmartPass Baseline)</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {devices.filter((d) => d.firmwareVersion === '1.0.0').length} nodes
                </span>
              </div>
              <div className="w-full bg-[#101b15] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{
                    width: `${
                      (devices.filter((d) => d.firmwareVersion === '1.0.0').length /
                        (devices.length || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-mono text-slate-300">v2.0.0 (MetroPay Dynamic)</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {devices.filter((d) => d.firmwareVersion === '2.0.0').length} nodes
                </span>
              </div>
              <div className="w-full bg-[#101b15] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full"
                  style={{
                    width: `${
                      (devices.filter((d) => d.firmwareVersion === '2.0.0').length /
                        (devices.length || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-2">
            Target MCU: NXP FRDM-MCXN236 (Arm Cortex-M33)
          </div>
        </div>

        {/* Quick Fleet Actions */}
        <div className="p-4 rounded-xl bg-[#060b08] border border-[#14221b] flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Fleetwide Governance Actions
            </span>
            <p className="text-[11px] text-slate-400 mb-3">
              Fast batch dispatch triggers for cybersecurity operations.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/rollouts"
                className="p-2.5 rounded-lg bg-[#0a140f] hover:bg-[#102018] border border-[#182b21] flex flex-col items-center text-center transition-all group"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400 mb-1 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[11px] font-mono text-slate-200 font-semibold">New Rollout</span>
                <span className="text-[9px] text-slate-400">Stage Canary</span>
              </Link>

              <Link
                href="/dashboard/attack-lab"
                className="p-2.5 rounded-lg bg-[#0a140f] hover:bg-[#102018] border border-[#182b21] flex flex-col items-center text-center transition-all group"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400 mb-1" />
                <span className="text-[11px] font-mono text-slate-200 font-semibold">Attack Lab</span>
                <span className="text-[9px] text-slate-400">Resilience Test</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400/90 pt-3 border-t border-[#121f18]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Watchdog Loop Active
            </span>
            <span>Health Gate: Strict</span>
          </div>
        </div>
      </div>

      {/* Device Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#060b08] border border-[#14221b] rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search device ID, name, location..."
            className="w-full bg-[#0a140f] border border-[#182b21] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'ONLINE', 'UPDATING', 'SAFE_MODE', 'FAILED'].map((status) => (
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

      {/* Fleet Inventory Table */}
      <div className="bg-[#060b08] border border-[#14221b] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#08100c] text-slate-400 font-mono text-[10px] uppercase border-b border-[#14221b]">
              <tr>
                <th className="py-3 px-4">Device / Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Active Bank</th>
                <th className="py-3 px-4">Firmware Version</th>
                <th className="py-3 px-4">Health Score</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Uptime</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f1d16] font-mono">
              {filteredDevices.map((device) => {
                const isOnline = device.status === 'ONLINE';
                const isUpdating = device.status === 'UPDATING';
                const isSafeMode = device.safeMode || device.status === 'SAFE_MODE';

                return (
                  <tr key={device.deviceId} className="hover:bg-[#09130e] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                        <div>
                          <div className="font-bold text-slate-200 flex items-center gap-1.5">
                            {device.deviceId}
                            {device.deviceId === 'NXP-001' && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                HARDWARE TWIN
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">{device.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {isSafeMode ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/15 border border-rose-500/30 text-rose-300 font-semibold flex items-center gap-1 w-fit">
                          <ShieldAlert className="w-3 h-3" /> SAFE MODE
                        </span>
                      ) : isUpdating ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1 w-fit">
                          <RefreshCw className="w-3 h-3 animate-spin" /> UPDATING
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> ONLINE
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          device.activeBank === 'A'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                        }`}
                      >
                        BANK {device.activeBank}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      v{device.firmwareVersion}
                      <span className="text-[10px] text-slate-500 block">
                        {device.activeBank === 'A' ? device.bankAFirmware : device.bankBFirmware || 'N/A'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#101c15] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              device.health > 80
                                ? 'bg-emerald-400'
                                : device.health > 50
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${device.health}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            device.health > 80
                              ? 'text-emerald-400'
                              : device.health > 50
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {device.health}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px] font-sans">
                      {device.location || 'Terminal Zone'}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {Math.floor(device.uptime / 60)}m {device.uptime % 60}s
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href="/dashboard"
                          className="px-2 py-1 rounded bg-[#0b1610] hover:bg-[#12241b] border border-[#182b21] text-[11px] text-emerald-400 transition-colors"
                        >
                          Twin
                        </Link>
                        {isSafeMode ? (
                          <Link
                            href="/dashboard/recovery"
                            className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-[11px] text-rose-300 transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> Recover
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleQuarantineDevice(device.deviceId)}
                            title="Emergency Quarantine into Safe Mode"
                            className="px-2 py-1 rounded bg-[#130b0b] hover:bg-rose-500/20 border border-[#2b1818] text-[11px] text-rose-400 transition-colors"
                          >
                            Quarantine
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}