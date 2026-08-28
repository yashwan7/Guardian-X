'use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import { api } from '@/lib/api/client';
import { HardDrive, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { buzzerAudio } from '../ui/BuzzerAudio';

export default function FirmwareDeployment() {
  const { firmware, isLoading, updateFromTelemetry } = useDeviceStore();
  const [deployingId, setDeployingId] = useState<string | null>(null);

  const handleDeploy = async (id: string, version: string, isBreaking: boolean) => {
    setDeployingId(id);
    try {
      if (version === '2.0.0') {
        // Staged Bank B Deploy
        updateFromTelemetry({
          deviceId: 'NXP-001',
          timestamp: new Date().toISOString(),
          firmwareVersion: '1.0.0',
          activeBank: 'A',
          health: 85,
          led: 'YELLOW',
          pirMotion: false,
          radarDistance: 0.8,
          safeMode: false,
          watchdogHealthy: true,
          heartbeat: true,
          uptime: 142,
          updateState: 'DOWNLOADING',
          oledLines: ['OTA DOWNLOADING', 'BANK B STAGING...'],
        });

        setTimeout(() => {
          updateFromTelemetry({
            deviceId: 'NXP-001',
            timestamp: new Date().toISOString(),
            firmwareVersion: '2.0.0',
            activeBank: 'B',
            health: 100,
            led: 'BLUE',
            pirMotion: false,
            radarDistance: 1.2,
            safeMode: false,
            watchdogHealthy: true,
            heartbeat: true,
            uptime: 1,
            updateState: 'CONFIRMED',
            oledLines: ['MetroPay v2.0.0', 'BANK B ACTIVE OK'],
          });
          buzzerAudio.playMetroPayChime();
          setDeployingId(null);
        }, 1500);
      } else if (isBreaking || version.includes('BROKEN')) {
        // Broken Fault Deploy
        updateFromTelemetry({
          deviceId: 'NXP-001',
          timestamp: new Date().toISOString(),
          firmwareVersion: '3.0.0-BROKEN',
          activeBank: 'B',
          health: 30,
          led: 'YELLOW',
          pirMotion: false,
          radarDistance: 0.5,
          safeMode: false,
          watchdogHealthy: false,
          heartbeat: false,
          uptime: 3,
          updateState: 'HEALTH_CHECK',
          oledLines: ['BOOT VALIDATION', 'WATCHDOG STALL...'],
        });

        setTimeout(() => {
          buzzerAudio.playAlarmBeep();
          updateFromTelemetry({
            deviceId: 'NXP-001',
            timestamp: new Date().toISOString(),
            firmwareVersion: '1.0.0',
            activeBank: 'A',
            health: 95,
            led: 'RED',
            pirMotion: false,
            radarDistance: 1.0,
            safeMode: true,
            watchdogHealthy: true,
            heartbeat: true,
            uptime: 10,
            updateState: 'ROLLBACK',
            oledLines: ['ROLLBACK ACTIVE', 'RESTORED BANK A'],
          });
          setDeployingId(null);
        }, 1500);
      } else {
        await api.deployments.create({ firmwareReleaseId: id, deviceId: 'NXP-001' });
        setDeployingId(null);
      }
    } catch (e) {
      console.error(e);
      setDeployingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#060b08] border border-[#14221b] rounded-xl p-6 h-64 animate-pulse flex items-center justify-center text-slate-500 font-mono text-xs">
        Loading firmware releases...
      </div>
    );
  }

  const availableFirmware = firmware.filter(
    (f) => f.status === 'APPROVED' || f.status === 'DRAFT'
  );

  return (
    <div className="bg-[#060b08] border border-[#14221b] rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#14221b] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Firmware Repository &amp; Staging Slots
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-500/80">
          Dual-Bank Execution Targets
        </span>
      </div>

      {/* Table List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#040806] border-b border-[#14221b] text-[9px] text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4">Version</th>
              <th className="py-2.5 px-3">Type / Status</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3">SHA-256</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#14221b]">
            {availableFirmware.map((fw) => {
              const isCurrentDeploying = deployingId === fw.id;

              return (
                <tr
                  key={fw.id}
                  className="hover:bg-[#0a120e] transition-colors duration-150 group"
                >
                  {/* Version */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-200 block">{fw.version}</span>
                    <span className="text-[9px] text-slate-400 block">{fw.name}</span>
                  </td>

                  {/* Status / Type */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold ${
                        fw.type === 'STABLE'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25'
                          : fw.type === 'BROKEN'
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/25'
                          : 'bg-teal-500/10 text-teal-300 border border-teal-500/25'
                      }`}
                    >
                      {fw.type === 'STABLE' ? (
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                      )}
                      <span>{fw.type}</span>
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-3 px-3 max-w-[220px]">
                    <p className="text-[11px] text-slate-300 font-sans truncate" title={fw.description}>
                      {fw.description}
                    </p>
                  </td>

                  {/* SHA-256 */}
                  <td className="py-3 px-3">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {fw.sha256.substring(0, 10)}...
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeploy(fw.id, fw.version, fw.isBreakingDemo)}
                      disabled={!!deployingId}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition-all ${
                        isCurrentDeploying
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-wait'
                          : deployingId
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : fw.type === 'BROKEN'
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_8px_rgba(0,245,160,0.12)]'
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      <span>{isCurrentDeploying ? 'Deploying...' : 'Deploy OTA'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}