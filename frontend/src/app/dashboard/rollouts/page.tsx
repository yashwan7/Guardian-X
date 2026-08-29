'use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import {
  GitBranch,
  Plus,
  Play,
  Pause,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  X,
  Layers,
  Activity,
} from 'lucide-react';
import type { RolloutCampaign, RolloutStrategy } from '@/types';

export default function RolloutsPage() {
  const {
    campaigns,
    firmware,
    devices,
    createCampaign,
    updateCampaignStatus,
    advanceCampaignStage,
    addEvent,
    addAuditLog,
  } = useDeviceStore();

  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Campaign Form State
  const [name, setName] = useState('MetroPay Concourse Expansion');
  const [selectedFirmwareId, setSelectedFirmwareId] = useState(firmware[0]?.id || 'fw-2');
  const [targetGroup, setTargetGroup] = useState('All Turnstile Terminals');
  const [strategy, setStrategy] = useState<RolloutStrategy>('CANARY');
  const [failureThreshold, setFailureThreshold] = useState(2.0);
  const [soakTime, setSoakTime] = useState(300);

  const activeCampaign = campaigns.find((c) => c.status === 'IN_PROGRESS') || campaigns[0];

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const fw = firmware.find((f) => f.id === selectedFirmwareId) || firmware[0];

    const newCamp: RolloutCampaign = {
      id: `camp-${Date.now()}`,
      name,
      firmwareId: fw.id,
      firmwareVersion: fw.version,
      targetGroup,
      strategy,
      status: 'IN_PROGRESS',
      currentStage: 1,
      totalStages: strategy === 'CANARY' ? 4 : strategy === 'LINEAR' ? 4 : 1,
      targetCount: devices.length,
      completedCount: 1,
      failedCount: 0,
      safeModeCount: 0,
      failureThresholdPercent: failureThreshold,
      soakTimeSeconds: soakTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createCampaign(newCamp);
    setShowCreateModal(false);
  };

  const handleEmergencyAbort = (campaignId: string) => {
    updateCampaignStatus(campaignId, 'ABORTED');
    addEvent({
      id: `evt-${Date.now()}`,
      deviceId: 'FLEET-ALL',
      eventType: 'ROLLOUT_CAMPAIGN_ABORTED',
      severity: 'HIGH',
      message: `Operator triggered Emergency Abort on campaign ${campaignId}. Updates locked.`,
      timestamp: new Date().toISOString(),
    });
    addAuditLog({
      actor: 'SecOps-Lead (admin@guardian.nxp)',
      action: 'EMERGENCY_ROLLOUT_ABORT',
      category: 'DEPLOYMENT',
      target: campaignId,
      status: 'WARNING',
      details: 'Rollout halted immediately. Fleet updates frozen.',
    });
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              OTA Rollout Campaigns &amp; Canary Engine
            </h1>
            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-semibold">
              CANARY GATING ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Phased batch deployments, autonomous health-gated abort thresholds, and soak timers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-[0_0_16px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Active Campaign Spotlight */}
      {activeCampaign && (
        <div className="p-5 rounded-2xl bg-[#060b08] border border-[#14221b] flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#121e17] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-widest">
                  ACTIVE DEPLOYMENT CAMPAIGN
                </span>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {activeCampaign.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 font-mono mt-1">
                {activeCampaign.name} &bull; v{activeCampaign.firmwareVersion}
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Target Group: <span className="text-slate-200">{activeCampaign.targetGroup}</span> &bull; Strategy: <span className="text-emerald-400 font-mono">{activeCampaign.strategy}</span>
              </p>
            </div>

            {/* Campaign Actions */}
            <div className="flex items-center gap-2">
              {activeCampaign.status === 'IN_PROGRESS' ? (
                <>
                  <button
                    onClick={() => advanceCampaignStage(activeCampaign.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#0c1a13] hover:bg-[#12281d] border border-[#183324] text-xs font-mono text-emerald-300 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Advance Canary Stage</span>
                  </button>

                  <button
                    onClick={() => updateCampaignStatus(activeCampaign.id, 'PAUSED')}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-mono text-amber-300 transition-colors flex items-center gap-1.5"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>

                  <button
                    onClick={() => handleEmergencyAbort(activeCampaign.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-mono text-rose-300 transition-colors flex items-center gap-1.5"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Emergency Abort</span>
                  </button>
                </>
              ) : activeCampaign.status === 'PAUSED' ? (
                <button
                  onClick={() => updateCampaignStatus(activeCampaign.id, 'IN_PROGRESS')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Rollout</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Canary Progress Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span>
                  Rollout Progression: Stage {activeCampaign.currentStage} of {activeCampaign.totalStages}
                </span>
                <span className="text-emerald-400 font-bold">
                  {Math.round((activeCampaign.completedCount / (activeCampaign.targetCount || 1)) * 100)}% Complete
                </span>
              </div>

              {/* Multi-Segment Progress Bar */}
              <div className="w-full bg-[#101b15] h-3 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(activeCampaign.completedCount / (activeCampaign.targetCount || 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Stage Stepper */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[
                  { stage: 1, label: 'Canary 5%', desc: '1 Test Node' },
                  { stage: 2, label: 'Canary 25%', desc: 'Zone 1 Gate' },
                  { stage: 3, label: 'Canary 50%', desc: 'Concourse' },
                  { stage: 4, label: 'Fleet 100%', desc: 'All Terminals' },
                ].map((s) => {
                  const isCompleted = activeCampaign.currentStage >= s.stage;
                  const isCurrent = activeCampaign.currentStage === s.stage;

                  return (
                    <div
                      key={s.stage}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : isCompleted
                          ? 'bg-[#08120d] border-[#13261b] text-slate-300'
                          : 'bg-[#040705] border-[#0c140f] text-slate-600'
                      }`}
                    >
                      <div className="text-[10px] font-mono font-bold">{s.label}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{s.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Safety Metrics Box */}
            <div className="p-3 bg-[#08120d] border border-[#13261b] rounded-xl flex flex-col justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">
                  Autonomous Safety Gates
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rollback Limit:</span>
                    <span className="text-slate-200">&lt; {activeCampaign.failureThresholdPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Soak Period:</span>
                    <span className="text-slate-200">{activeCampaign.soakTimeSeconds}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fleet Failures:</span>
                    <span className="text-emerald-400 font-bold">{activeCampaign.failedCount} (0.0%)</span>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-3 pt-2 border-t border-[#102016]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Anomaly Abort Status</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns History Table */}
      <div className="bg-[#060b08] border border-[#14221b] rounded-xl overflow-hidden">
        <div className="p-3.5 border-b border-[#14221b] flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-slate-200">
            Campaigns Execution History &amp; Deployments
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {campaigns.length} Total Campaigns
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#08100c] text-slate-400 text-[10px] uppercase border-b border-[#14221b]">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Strategy</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Target Fleet</th>
                <th className="py-3 px-4">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f1d16]">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-[#09130e] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-200">{camp.name}</td>
                  <td className="py-3 px-4 text-emerald-400">v{camp.firmwareVersion}</td>
                  <td className="py-3 px-4 text-slate-300">{camp.strategy}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        camp.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : camp.status === 'IN_PROGRESS'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {camp.currentStage} / {camp.totalStages}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{camp.targetGroup}</td>
                  <td className="py-3 px-4 text-slate-300 font-bold">
                    {camp.completedCount} / {camp.targetCount} Nodes
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050a07] border border-[#162a1f] rounded-2xl w-full max-w-lg p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in font-mono">
            <div className="flex items-center justify-between border-b border-[#122018] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Create New OTA Rollout Campaign</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Firmware Release</label>
                  <select
                    value={selectedFirmwareId}
                    onChange={(e) => setSelectedFirmwareId(e.target.value)}
                    className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    {firmware.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} (v{f.version})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Rollout Strategy</label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value as any)}
                    className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="CANARY">Canary (5% &rarr; 25% &rarr; 50% &rarr; 100%)</option>
                    <option value="LINEAR">Linear (25% per interval)</option>
                    <option value="IMMEDIATE">Immediate (All Fleet)</option>
                    <option value="BLUE_GREEN">Blue / Green Switchover</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Device Group</label>
                <input
                  type="text"
                  required
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Abort Fail Threshold (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={failureThreshold}
                    onChange={(e) => setFailureThreshold(parseFloat(e.target.value))}
                    className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Soak Time (sec)</label>
                  <input
                    type="number"
                    value={soakTime}
                    onChange={(e) => setSoakTime(parseInt(e.target.value, 10))}
                    className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0b1610] text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}