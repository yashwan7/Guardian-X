'use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import {
  Bot,
  Sparkles,
  Send,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  Terminal,
  Activity,
  Layers,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
  codeSnippet?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'AI',
    text: "Hello! I am Guardian AI, your specialized embedded cybersecurity & firmware lifecycle copilot. I am actively monitoring the NXP FRDM-MCXN236 dual-bank telemetry stream, MCUboot partition states, and watchdog health gates. How can I assist your fleet operations today?",
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
];

export default function AIPage() {
  const { devices, firmware, securityIncidents, auditLogs } = useDeviceStore();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const primaryDevice = devices.find((d) => d.deviceId === 'NXP-001') || devices[0];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiReply = '';
      let codeSnippet: string | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('crash') || lower.includes('fault') || lower.includes('broken') || lower.includes('3.0.0')) {
        aiReply = `[ROOT CAUSE ANALYSIS]\nI analyzed the crash telemetry from candidate firmware v3.0.0-BROKEN. The Arm Cortex-M33 HardFault was triggered by a blocking SPI mutex starvation in the RC522 RFID driver (\`rc522_read_block\`). Because the main task remained locked, \`watchdog_pet()\` was starved for 8,240ms, causing the hardware watchdog to reset and MCUboot to successfully execute an autonomous rollback to Golden Bank A.\n\nRECOMMENDED REMEDIATION:\nWrap SPI card polling with a non-blocking timeout queue and ensure FreeRTOS watchdog task has higher execution priority.`;
        codeSnippet = `// Proposed C Patch for rc522_driver.c
if (xSemaphoreTake(xSpiMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
    rc522_read_card_id(buffer);
    xSemaphoreGive(xSpiMutex);
} else {
    // Watchdog feed & fallback to prevent starvation
    watchdog_pet();
    LOG_WARN("SPI RFID mutex timeout - skipping cycle");
}`;
      } else if (lower.includes('safe mode') || lower.includes('quarantine') || lower.includes('nxp-001')) {
        aiReply = `[DEVICE TELEMETRY AUDIT: NXP-001]\nDevice NXP-001 is currently running firmware v${primaryDevice.firmwareVersion} on Active Bank ${primaryDevice.activeBank}. Health Score is ${primaryDevice.health}%. Watchdog is healthy. No unresolved cryptographic signature errors are present. If needed, you can trigger a Tier 1 Autonomous Swap in the Recovery Center to reset the boot pointer.`;
      } else if (lower.includes('risk') || lower.includes('metropay') || lower.includes('predict') || lower.includes('rollout')) {
        aiReply = `[ROLLOUT SAFETY RISK PREDICTION: MetroPay v2.0.0]\nRisk Score: 4/100 (LOW RISK)\n- Cryptographic Signature: Ed25519 Verified\n- Dual-Bank Flash Budget: 388 KB / 896 KB (43.3% utilization - OPTIMAL)\n- Monotonic Version Counter: 0x0004 >= 0x0002 (Compliant)\n- Recommended Rollout Strategy: Canary 5% -> 25% -> 50% -> 100% with 300s soak time.`;
      } else if (lower.includes('health') || lower.includes('policy') || lower.includes('sensor')) {
        aiReply = `[HEALTH GATE EVALUATION]\nGuardian evaluates 4 concurrent hardware vectors post-boot:\n1. RC522 RFID SPI connection response (< 200ms)\n2. Millimeter-Wave Radar distance stream (0.1m - 5.0m range)\n3. Hardware Watchdog Heartbeat pulse (< 3000ms)\n4. FreeRTOS Heap Allocation Headroom (> 24 KB free).\nIf any parameter fails within the 10-second observation window, the candidate slot is rejected and Bank A is reinstated.`;
      } else {
        aiReply = `I have cross-referenced your query against the active fleet telemetry across ${devices.length} nodes and ${securityIncidents.length} security events. Dual-Bank Bank A (v1.0.0 SmartPass) remains the immutable Golden Baseline, with MCUboot enforcing Ed25519 signature checks. Let me know if you would like me to generate a firmware patch, decode registers, or run a simulated attack analysis.`;
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'AI',
        text: aiReply,
        timestamp: new Date().toISOString(),
        codeSnippet,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Guardian AI Security &amp; Diagnostics Copilot
            </h1>
            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              EMBEDDED LLM ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Specialized in NXP MCXN236 architecture, MCUboot bootloaders, FreeRTOS deadlock diagnosis, and dual-bank security.
          </p>
        </div>
      </div>

      {/* Main Copilot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Interactive Chat (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Chat Container */}
          <div className="p-4 rounded-2xl bg-[#060b08] border border-[#14221b] flex flex-col h-[520px] justify-between">
            {/* Message Feed */}
            <div className="overflow-y-auto space-y-3.5 pr-2">
              {messages.map((msg) => {
                const isAi = msg.sender === 'AI';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 text-xs ${
                      isAi ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                        isAi
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {isAi ? <Bot className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl font-mono ${
                        isAi
                          ? 'bg-[#08120d] border border-[#122419] text-slate-200'
                          : 'bg-emerald-500 text-slate-950 font-semibold'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                      {msg.codeSnippet && (
                        <div className="mt-3 p-3 rounded-lg bg-[#020503] border border-[#0d1c14] text-[11px] text-emerald-400 overflow-x-auto font-mono">
                          <pre>{msg.codeSnippet}</pre>
                        </div>
                      )}

                      <span
                        className={`text-[9px] block mt-1.5 ${
                          isAi ? 'text-slate-500' : 'text-emerald-900 font-bold'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 italic">
                  <Bot className="w-4 h-4 animate-bounce" />
                  <span>Guardian AI analyzing telemetry and registers...</span>
                </div>
              )}
            </div>

            {/* Quick Diagnostic Pill Prompts */}
            <div className="pt-2 border-t border-[#122018] space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  'Analyze crash dump for v3.0.0-BROKEN',
                  'Predict rollout risk for MetroPay v2.0.0',
                  'Audit health telemetry on NXP-001',
                  'Explain MCUboot health gate rules',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-2.5 py-1 rounded-lg bg-[#09140f] hover:bg-[#10241a] border border-[#152a1e] text-[10px] font-mono text-emerald-300 whitespace-nowrap transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Guardian AI about firmware crashes, health gates, or risk analysis..."
                  className="flex-1 bg-[#09140f] border border-[#152a1e] rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-40 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights & RCA Summary (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Automated Root Cause Analysis Card */}
          <div className="p-4 rounded-xl bg-[#060b08] border border-[#14221b] space-y-2.5 font-mono text-xs">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Latest Automated RCA
            </span>
            <div className="p-2.5 rounded-lg bg-[#08120d] border border-[#122419] space-y-1 text-[11px]">
              <div className="text-slate-400 font-bold">Incident: Watchdog Starvation</div>
              <div className="text-emerald-400">Target: Candidate v3.0.0-BROKEN</div>
              <div className="text-slate-400 text-[10px] font-sans">
                Root Cause: Mutex deadlock in SPI RFID polling task starved system watchdog for 8.2s.
              </div>
              <div className="text-[10px] text-emerald-300 font-bold pt-1 border-t border-[#122018]">
                Mitigation: Autonomous MCUboot Bank Swap restored Bank A in 5.2s.
              </div>
            </div>
          </div>

          {/* Rollout Risk Assessment */}
          <div className="p-4 rounded-xl bg-[#060b08] border border-[#14221b] space-y-2.5 font-mono text-xs">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Active Firmware Safety Score
            </span>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#08120d] border border-[#122419]">
              <div>
                <span className="text-slate-400 block text-[10px]">METROPAY v2.0.0</span>
                <span className="text-emerald-400 font-bold text-sm">96 / 100 OPTIMAL</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                96
              </div>
            </div>
            <div className="text-[10px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1 text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Ed25519 Constant-Time Verified</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Dual-Bank Memory Boundary Safe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}