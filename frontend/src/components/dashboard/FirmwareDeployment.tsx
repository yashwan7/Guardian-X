'use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import { api } from '@/lib/api/client';
import { HardDrive, CheckCircle2, AlertTriangle, Zap, Package } from 'lucide-react';
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
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 h-64 animate-pulse flex items-center justify-center text-slate-400 font-sans text-xs">
        Loading firmware releases...
      </div>
    );
  }

  const availableFirmware = firmware.filter(
    (f) => f.status === 'APPROVED' || f.status === 'DRAFT'
  );

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/90 dark:border-white/10 rounded-2xl overflow-hidden shadow-[0_12px_32px_-8px_rgba(0,0,0,0.04),_inset_0_1px_1px_rgba(255,255,255,1)] flex flex-col transition-all">
      {/* Header */}
      <div className="p-4 sm:px-6 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
            <Package className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-sans font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Firmware Repository &amp; Staging Slots
          </h3>
        </div>
        <span className="text-[10px] font-sans font-semibold text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200/80">
          Dual-Bank Targets
        </span>
      </div>

      {/* Table List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/60 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-5">Version</th>
              <th className="py-3 px-4">Type / Status</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">SHA-256</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
            {availableFirmware.map((fw) => {
              const isCurrentDeploying = deployingId === fw.id;

              return (
                <tr
                  key={fw.id}
                  className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors duration-150 group"
                >
                  {/* Version */}
                  <td className="py-3 px-5">
                    <span className="font-mono font-bold text-slate-900 dark:text-white block">{fw.version}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">{fw.name}</span>
                  </td>

                  {/* Status / Type */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        fw.type === 'STABLE'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : fw.type === 'BROKEN'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-300'
                          : 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}
                    >
                      {fw.type === 'STABLE' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                      )}
                      <span>{fw.type}</span>
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-3 px-4 max-w-[240px]">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate" title={fw.description}>
                      {fw.description}
                    </p>
                  </td>

                  {/* SHA-256 */}
                  <td className="py-3 px-4">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {fw.sha256.substring(0, 10)}...
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-5 text-right">
                    <button
                      onClick={() => handleDeploy(fw.id, fw.version, fw.isBreakingDemo)}
                      disabled={!!deployingId}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs hover:scale-102 active:scale-98 ${
                        isCurrentDeploying
                          ? 'bg-blue-100 text-blue-700 border border-blue-300 cursor-wait'
                          : deployingId
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : fw.type === 'BROKEN'
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200'
                          : 'bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white shadow-sm'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
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