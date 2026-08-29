'use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import {
  Shield,
  CheckCircle2,
  Sliders,
  AlertTriangle,
  Lock,
  Zap,
  Activity,
  HeartPulse,
  GitBranch,
  Layers,
  Save,
} from 'lucide-react';
import type { SafetyPolicy } from '@/types';

export default function PoliciesPage() {
  const { policies, updatePolicy, addAuditLog } = useDeviceStore();
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleTogglePolicy = (policy: SafetyPolicy) => {
    updatePolicy(policy.id, !policy.enabled);
    setSaveMsg(`Policy "${policy.name}" updated successfully.`);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleThresholdChange = (policy: SafetyPolicy, val: number | string | boolean) => {
    updatePolicy(policy.id, policy.enabled, val);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Safety Policies &amp; Health Gating
            </h1>
            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-semibold">
              {policies.filter((p) => p.enabled).length} ACTIVE RULES ENFORCED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure autonomous watchdog thresholds, post-boot health gates, canary abort triggers, and anti-rollback counters.
          </p>
        </div>
      </div>

      {saveMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Policy Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((policy) => {
          const isEnabled = policy.enabled;
          const isNum = typeof policy.threshold === 'number';

          return (
            <div
              key={policy.id}
              className={`p-4 rounded-xl bg-[#060b08] border transition-all duration-200 flex flex-col justify-between ${
                isEnabled ? 'border-[#14221b] hover:border-emerald-500/40' : 'border-[#101914] opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-100 block">
                      {policy.name}
                    </span>
                    <span className="text-[9px] font-mono bg-[#0c1a13] text-emerald-400 border border-[#183324] px-1.5 py-0.2 rounded mt-1 inline-block">
                      {policy.category}
                    </span>
                  </div>

                  <button
                    onClick={() => handleTogglePolicy(policy)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-slate-950 absolute top-1 transition-transform ${
                        isEnabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-slate-400 font-sans mb-3">{policy.description}</p>

                {/* Threshold Configuration Slider / Input */}
                {isNum && isEnabled && (
                  <div className="p-3 rounded-lg bg-[#08120d] border border-[#122419] font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Threshold Limit:</span>
                      <span className="text-emerald-400 font-bold">
                        {policy.threshold} {policy.unit}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={policy.unit === '%' ? 1 : policy.unit === 'sec' ? 1 : 1}
                      max={policy.unit === '%' ? 100 : policy.unit === 'sec' ? 600 : 100}
                      value={policy.threshold as number}
                      onChange={(e) =>
                        handleThresholdChange(policy, parseFloat(e.target.value))
                      }
                      className="w-full accent-emerald-400 bg-[#101b15] h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <div className="text-[10px] font-mono text-slate-500 mt-3 pt-2 border-t border-[#121f18] flex items-center justify-between">
                <span>Enforcement: Autonomous Boot ROM</span>
                <span className={isEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {isEnabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}