'use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import { useTheme } from '@/context/ThemeContext';
import {
  Settings,
  Cpu,
  Radio,
  Wifi,
  Shield,
  Bell,
  RotateCcw,
  CheckCircle2,
  Lock,
  Save,
  Server,
  Layers,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const { hardwareAdapterMode, setHardwareAdapterMode, resetDemo, addAuditLog } =
    useDeviceStore();
  const { theme, setTheme, toggleTheme } = useTheme();

  const [mqttHost, setMqttHost] = useState('localhost');
  const [mqttPort, setMqttPort] = useState(1883);
  const [baudRate, setBaudRate] = useState(115200);
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/SEC_ALERT/GUARDIAN_OTA');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    addAuditLog({
      actor: 'SecOps-Lead (admin@guardian.nxp)',
      action: 'SYSTEM_SETTINGS_UPDATED',
      category: 'SYSTEM',
      target: 'Hardware & MQTT Config',
      status: 'SUCCESS',
      details: `Updated MQTT broker ${mqttHost}:${mqttPort} and WebSerial baud ${baudRate}`,
    });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDemo = () => {
    resetDemo();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Platform Configuration &amp; Integrations
            </h1>
            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-semibold">
              TRANSPORT: {hardwareAdapterMode}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Theme visual styling, hardware adapter switches, WebSerial baud rates, Mosquitto MQTT broker credentials, and demo reset controls.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>System configuration parameters saved successfully.</span>
        </div>
      )}

      {resetSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>System demo state has been reset to baseline Golden Image v1.0.0.</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-mono">
        {/* Appearance & Visual Theme Card */}
        <div className="p-5 rounded-2xl bg-[#060b08] border border-[#14221b] space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Appearance &amp; Theme Mode</span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Choose your preferred interface theme for the Guardian X Command Center.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                theme === 'dark'
                  ? 'bg-[#203B5C]/30 border-[#84B6E4]/50 text-[#84B6E4] shadow-[0_0_14px_rgba(132,182,228,0.2)]'
                  : 'bg-[#0c182a] border-[#1a3250] text-slate-400 hover:border-[#284c78]'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#070e18] border border-[#84B6E4]/40 flex items-center justify-center text-amber-300">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-100">Twilight Blue Mode (Default)</div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Deep Twilight Blue (#203B5C) with Frost Cyan highlights (#84B6E4).
                </div>
              </div>
            </div>

            <div
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                theme === 'light'
                  ? 'bg-[#203B5C]/20 border-[#84B6E4]/50 text-[#203B5C] shadow-[0_0_14px_rgba(132,182,228,0.2)]'
                  : 'bg-[#0c182a] border-[#1a3250] text-slate-400 hover:border-[#284c78]'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#f1f5f9] border border-slate-300 flex items-center justify-center text-[#203B5C]">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-100">Clean Titanium Light</div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Clean crisp light background with Twilight Blue accents.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Adapter Mode Card */}
        <div className="p-5 rounded-2xl bg-[#060b08] border border-[#14221b] space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Hardware Adapter Integration Mode</span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Choose whether the control plane communicates with the simulated in-memory twin or the physical NXP FRDM-MCXN236 board.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {[
              {
                mode: 'SIMULATED' as const,
                title: 'Simulated Device Adapter',
                desc: 'Browser in-memory MCUboot state machine & synthetic sensor telemetry stream.',
              },
              {
                mode: 'HARDWARE_WEBSERIAL' as const,
                title: 'WebSerial Direct Sync',
                desc: 'Direct USB UART connection (115200 baud) to physical NXP board.',
              },
              {
                mode: 'HARDWARE_MQTT' as const,
                title: 'Mosquitto MQTT Broker',
                desc: 'Production broker gateway over guardian/device/ topics.',
              },
            ].map((item) => {
              const isSelected = hardwareAdapterMode === item.mode;

              return (
                <div
                  key={item.mode}
                  onClick={() => setHardwareAdapterMode(item.mode)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(0,245,160,0.1)]'
                      : 'bg-[#08120d] border-[#122419] text-slate-400 hover:border-[#1c3625]'
                  }`}
                >
                  <div className="font-bold text-slate-100 mb-1">{item.title}</div>
                  <div className="text-[11px] text-slate-400 font-sans">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transport & Broker Settings */}
        <div className="p-5 rounded-2xl bg-[#060b08] border border-[#14221b] space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>MQTT Broker &amp; Serial UART Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">MQTT Broker Host</label>
              <input
                type="text"
                value={mqttHost}
                onChange={(e) => setMqttHost(e.target.value)}
                className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">MQTT Broker Port</label>
              <input
                type="number"
                value={mqttPort}
                onChange={(e) => setMqttPort(parseInt(e.target.value, 10))}
                className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">WebSerial Baud Rate</label>
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(parseInt(e.target.value, 10))}
                className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
              >
                <option value={115200}>115200 (Default NXP)</option>
                <option value={921600}>921600 (High-Speed OTA)</option>
                <option value={9600}>9600 (Diagnostic)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Alert Notification Webhook (Slack / Discord)</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#060b08] border border-[#14221b]">
          <div>
            <span className="font-bold text-slate-200 block">Demonstration State Reset</span>
            <span className="text-[11px] text-slate-400 font-sans">
              Returns all fleet nodes, incidents, and audit logs to the initial baseline v1.0.0 state.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetDemo}
              className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo State</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-[0_0_16px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}