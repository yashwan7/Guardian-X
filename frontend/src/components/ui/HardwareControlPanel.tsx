'use client';

import React, { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import { buzzerAudio } from './BuzzerAudio';
import { webSerial } from '@/lib/webSerial';
import {
  Zap,
  CreditCard,
  Volume2,
  RefreshCw,
  AlertTriangle,
  Usb,
  CheckCircle2,
  Send,
  Monitor,
} from 'lucide-react';

export default function HardwareControlPanel() {
  const { devices, updateFromTelemetry, addEvent, updateDevice, backendConnected } = useDeviceStore();
  const primaryDevice = devices.find((d) => d.deviceId === 'NXP-001') ?? devices[0];

  const [isDeploying, setIsDeploying] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [isTapping, setIsTapping] = useState(false);

  // Custom LCD input state
  const [customLine1, setCustomLine1] = useState('');
  const [customLine2, setCustomLine2] = useState('');
  const [isSendingLCD, setIsSendingLCD] = useState(false);

  // WebSerial Direct Browser Connection
  const handleConnectWebSerial = async () => {
    await webSerial.connect();
  };

  // Scenario 1: Deploy Dual-Bank v2.0 MetroPay OTA (Physical Board + Web)
  const handleDeployOTA = async () => {
    if (isDeploying) return;
    setIsDeploying(true);

    // Send command to physical NXP board
    await webSerial.switchBank('B');

    // Update UI state
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
      uptime: (primaryDevice?.uptime || 100) + 1,
      updateState: 'CONFIRMED',
      oledLines: ['MetroPay v2.0.0', 'BANK B ACTIVE OK'],
    });

    buzzerAudio.playMetroPayChime();

    addEvent({
      id: `evt-${Date.now()}`,
      deviceId: 'NXP-001',
      eventType: 'OTA_DEPLOYED',
      severity: 'INFO',
      message: 'Web Control: Switched physical NXP board to Bank B (v2.0.0 MetroPay). Blue LED Active.',
      timestamp: new Date().toISOString(),
    });

    setTimeout(() => {
      setIsDeploying(false);
    }, 1200);
  };

  // Scenario 2: Fault Injection & Autonomous Watchdog Rollback (Physical Board + Web)
  const handleInjectFault = async () => {
    if (isInjecting) return;
    setIsInjecting(true);

    // Send command to physical NXP board
    await webSerial.injectFault();

    // Trigger UI Fault
    buzzerAudio.playAlarmBeep();
    updateFromTelemetry({
      deviceId: 'NXP-001',
      timestamp: new Date().toISOString(),
      firmwareVersion: '3.0.0-BROKEN',
      activeBank: 'B',
      health: 30,
      led: 'RED',
      pirMotion: false,
      radarDistance: 0.5,
      safeMode: true,
      watchdogHealthy: false,
      heartbeat: false,
      uptime: 3,
      updateState: 'ROLLBACK',
      oledLines: ['FAULT INJECTED!', 'AUTONOMOUS ROLLBACK'],
    });

    addEvent({
      id: `evt-${Date.now()}`,
      deviceId: 'NXP-001',
      eventType: 'CRITICAL_FAULT_INJECTED',
      severity: 'CRITICAL',
      message: 'Web Control: Injected Watchdog Timeout into physical board. Self-healing rollback engaged.',
      timestamp: new Date().toISOString(),
    });

    // Auto-Restore after 1.8s
    setTimeout(() => {
      updateFromTelemetry({
        deviceId: 'NXP-001',
        timestamp: new Date().toISOString(),
        firmwareVersion: '1.0.0',
        activeBank: 'A',
        health: 100,
        led: 'GREEN',
        pirMotion: false,
        radarDistance: 1.0,
        safeMode: false,
        watchdogHealthy: true,
        heartbeat: true,
        uptime: 10,
        updateState: 'IDLE',
        oledLines: ['GUARDIAN X OTA', 'BANK A: v1.0.0'],
      });

      addEvent({
        id: `evt-${Date.now()}`,
        deviceId: 'NXP-001',
        eventType: 'AUTONOMOUS_ROLLBACK',
        severity: 'INFO',
        message: 'Guardian Self-Heal: Physical NXP hardware restored to Bank A Golden Image.',
        timestamp: new Date().toISOString(),
      });

      setIsInjecting(false);
    }, 1800);
  };

  // Scenario 3: Tap RFID Transit Card
  const handleTapRFID = () => {
    if (isTapping) return;
    setIsTapping(true);

    const isBankB = primaryDevice?.activeBank === 'B';

    if (isBankB) {
      buzzerAudio.playMetroPayChime();
      updateFromTelemetry({
        deviceId: 'NXP-001',
        timestamp: new Date().toISOString(),
        firmwareVersion: primaryDevice?.firmwareVersion || '2.0.0',
        activeBank: 'B',
        health: 100,
        led: 'BLUE',
        pirMotion: true,
        radarDistance: 0.3,
        safeMode: primaryDevice?.safeMode || false,
        watchdogHealthy: true,
        heartbeat: true,
        uptime: (primaryDevice?.uptime || 100) + 1,
        updateState: 'CONFIRMED',
        oledLines: ['PAID: Rs.25 (METRO)', 'UID 4A:3F:82:1C'],
      });

      addEvent({
        id: `evt-${Date.now()}`,
        deviceId: 'NXP-001',
        eventType: 'RFID_PAYMENT_PROCESSED',
        severity: 'INFO',
        message: 'RFID Card Tapped: Rs. 25 fare debited via MetroPay v2.0 (UID: 4A:3F:82:1C)',
        timestamp: new Date().toISOString(),
      });
    } else {
      buzzerAudio.playSuccessBeep(2400, 120);
      updateFromTelemetry({
        deviceId: 'NXP-001',
        timestamp: new Date().toISOString(),
        firmwareVersion: primaryDevice?.firmwareVersion || '1.0.0',
        activeBank: 'A',
        health: 100,
        led: 'GREEN',
        pirMotion: true,
        radarDistance: 0.3,
        safeMode: primaryDevice?.safeMode || false,
        watchdogHealthy: true,
        heartbeat: true,
        uptime: (primaryDevice?.uptime || 100) + 1,
        updateState: 'IDLE',
        oledLines: ['ACCESS: GRANTED', 'UID 4A:3F:82:1C'],
      });

      addEvent({
        id: `evt-${Date.now()}`,
        deviceId: 'NXP-001',
        eventType: 'RFID_ACCESS_GRANTED',
        severity: 'INFO',
        message: 'RFID Card Tapped: SmartPass v1.0 Access Granted (UID: 4A:3F:82:1C)',
        timestamp: new Date().toISOString(),
      });
    }

    setTimeout(() => {
      const isB = useDeviceStore.getState().devices[0]?.activeBank === 'B';
      updateDevice('NXP-001', {
        oledLines: ['GUARDIAN X OTA', isB ? 'BANK B: v2.0.0' : 'BANK A: v1.0.0'],
      });
      setIsTapping(false);
    }, 1500);
  };

  // Scenario 4: Manual Dual-Bank Toggle
  const handleToggleBank = async () => {
    const nextBank = primaryDevice?.activeBank === 'A' ? 'B' : 'A';
    const nextVersion = nextBank === 'B' ? '2.0.0' : '1.0.0';
    const nextLed = nextBank === 'B' ? 'BLUE' : 'GREEN';

    // Send to physical NXP board
    await webSerial.switchBank(nextBank);

    if (nextBank === 'B') {
      buzzerAudio.playMetroPayChime();
    } else {
      buzzerAudio.playSuccessBeep(2400, 100);
    }

    updateFromTelemetry({
      deviceId: 'NXP-001',
      timestamp: new Date().toISOString(),
      firmwareVersion: nextVersion,
      activeBank: nextBank,
      health: 100,
      led: nextLed,
      pirMotion: false,
      radarDistance: 1.0,
      safeMode: false,
      watchdogHealthy: true,
      heartbeat: true,
      uptime: (primaryDevice?.uptime || 100) + 1,
      updateState: 'CONFIRMED',
      oledLines: ['GUARDIAN X OTA', `BANK ${nextBank}: v${nextVersion}`],
    });

    addEvent({
      id: `evt-${Date.now()}`,
      deviceId: 'NXP-001',
      eventType: 'BANK_SWITCH_MANUAL',
      severity: 'LOW',
      message: `Web Control: Switched physical NXP board to BANK ${nextBank} (${nextVersion})`,
      timestamp: new Date().toISOString(),
    });
  };

  // Scenario 5: Sound Buzzer Test (Physical NXP + Web)
  const handleTestBuzzer = async () => {
    await webSerial.triggerBeep();
    buzzerAudio.playSuccessBeep(2800, 150);

    addEvent({
      id: `evt-${Date.now()}`,
      deviceId: 'NXP-001',
      eventType: 'BUZZER_TEST',
      severity: 'INFO',
      message: 'Web Control: Emitted 2.4kHz test chime to physical NXP Buzzer (P4_13)',
      timestamp: new Date().toISOString(),
    });
  };

  // Scenario 6: Send Custom Message to Physical LCD
  const handleSendCustomLCD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLine1 && !customLine2) return;

    setIsSendingLCD(true);
    const l1 = customLine1 || 'GUARDIAN X OTA';
    const l2 = customLine2 || 'LIVE REMOTE MSG';

    // Send to physical NXP board
    await webSerial.setLCD(l1, l2);

    // Update Virtual LCD
    updateDevice('NXP-001', {
      oledLines: [l1, l2],
    });

    buzzerAudio.playSuccessBeep(2400, 80);

    addEvent({
      id: `evt-${Date.now()}`,
      deviceId: 'NXP-001',
      eventType: 'LCD_REMOTE_UPDATE',
      severity: 'INFO',
      message: `Web Control: Sent custom text to physical 16x2 LCD: "${l1}" / "${l2}"`,
      timestamp: new Date().toISOString(),
    });

    setTimeout(() => {
      setIsSendingLCD(false);
    }, 600);
  };

  // Scenario 7: Clear Safe Mode
  const handleClearSafeMode = async () => {
    await webSerial.switchBank('A');
    updateDevice('NXP-001', { safeMode: false, status: 'ONLINE', led: 'GREEN', oledLines: ['GUARDIAN X OTA', 'BANK A: v1.0.0'] });
    buzzerAudio.playSuccessBeep(2000, 80);
    addEvent({
      id: `evt-${Date.now()}`,
      deviceId: 'NXP-001',
      eventType: 'SAFE_MODE_CLEARED',
      severity: 'INFO',
      message: 'Operator verification completed. Physical board safe mode lifted.',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
          <Monitor className="w-3 h-3 text-emerald-400" />
          <span>Hardware Remote Controls</span>
        </span>
        <span className="text-[9px] font-mono text-emerald-400/80">
          NXP-001 &bull; 2-Way Hardware Sync
        </span>
      </div>

      {/* Control Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* 1. Deploy OTA */}
        <button
          onClick={handleDeployOTA}
          disabled={isDeploying}
          className="flex flex-col items-start p-2.5 rounded-lg bg-[#070e0a] hover:bg-[#0c1812] border border-emerald-500/25 hover:border-emerald-500/50 transition-all text-left group shadow-sm"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-medium">
              OTA v2.0
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-100 font-mono">
            {isDeploying ? 'Deploying...' : 'Deploy OTA'}
          </span>
          <span className="text-[9px] text-slate-400 truncate w-full mt-0.5">
            Stage Bank B &amp; Switch
          </span>
        </button>

        {/* 2. Switch Dual Bank */}
        <button
          onClick={handleToggleBank}
          className="flex flex-col items-start p-2.5 rounded-lg bg-[#070e0a] hover:bg-[#0c1812] border border-teal-500/25 hover:border-teal-500/50 transition-all text-left group shadow-sm"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <RefreshCw className="w-3.5 h-3.5 text-teal-400 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-teal-500/10 text-teal-300 font-medium">
              SLOT
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-100 font-mono">
            Switch Bank
          </span>
          <span className="text-[9px] text-slate-400 truncate w-full mt-0.5">
            Toggle Bank A ⟷ B
          </span>
        </button>

        {/* 3. Tap RFID Card */}
        <button
          onClick={handleTapRFID}
          disabled={isTapping}
          className="flex flex-col items-start p-2.5 rounded-lg bg-[#070e0a] hover:bg-[#0c1812] border border-emerald-500/25 hover:border-emerald-500/50 transition-all text-left group shadow-sm"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-medium">
              RC522
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-100 font-mono">
            {isTapping ? 'Reading...' : 'Tap RFID'}
          </span>
          <span className="text-[9px] text-slate-400 truncate w-full mt-0.5">
            {primaryDevice?.activeBank === 'B' ? 'MetroPay Fare Debit' : 'SmartPass Access'}
          </span>
        </button>

        {/* 4. Inject Watchdog Fault */}
        <button
          onClick={handleInjectFault}
          disabled={isInjecting}
          className="flex flex-col items-start p-2.5 rounded-lg bg-[#12080a] hover:bg-[#1c0c10] border border-rose-500/25 hover:border-rose-500/50 transition-all text-left group shadow-sm"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-rose-500/10 text-rose-300 font-medium">
              FAULT
            </span>
          </div>
          <span className="text-xs font-semibold text-rose-200 font-mono">
            {isInjecting ? 'Stalling...' : 'Inject Fault'}
          </span>
          <span className="text-[9px] text-slate-400 truncate w-full mt-0.5">
            Watchdog Rollback Test
          </span>
        </button>

        {/* 5. Test Buzzer */}
        <button
          onClick={handleTestBuzzer}
          className="flex flex-col items-start p-2.5 rounded-lg bg-[#070e0a] hover:bg-[#0c1812] border border-amber-500/25 hover:border-amber-500/50 transition-all text-left group shadow-sm"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Volume2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 font-medium">
              AUDIO
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-100 font-mono">
            Test Buzzer
          </span>
          <span className="text-[9px] text-slate-400 truncate w-full mt-0.5">
            Trigger P4_13 Tone
          </span>
        </button>

        {/* 6. Safe Mode Clear / WebSerial Connect */}
        {primaryDevice?.safeMode ? (
          <button
            onClick={handleClearSafeMode}
            className="flex flex-col items-start p-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 transition-all text-left group"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-medium">
                CLEAR
              </span>
            </div>
            <span className="text-xs font-semibold text-amber-200 font-mono">
              Lift Safe Mode
            </span>
            <span className="text-[9px] text-amber-300/80 truncate w-full mt-0.5">
              Approve Normal Ops
            </span>
          </button>
        ) : (
          <button
            onClick={handleConnectWebSerial}
            className={`flex flex-col items-start p-2.5 rounded-lg border transition-all text-left group ${
              backendConnected
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-[#070e0a] hover:bg-[#0c1812] border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <Usb className={`w-3.5 h-3.5 ${backendConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                SERIAL
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-100 font-mono">
              {backendConnected ? 'Connected' : 'WebSerial'}
            </span>
            <span className="text-[9px] text-slate-400 truncate w-full mt-0.5">
              {backendConnected ? '115200 2-Way Sync' : 'Click to Link Board'}
            </span>
          </button>
        )}
      </div>

      {/* --- Live Remote LCD Message Sender --- */}
      <form
        onSubmit={handleSendCustomLCD}
        className="p-3 rounded-lg bg-[#070e0a] border border-[#14261c] flex flex-col gap-2 shadow-inner"
      >
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Send Custom Text to Physical 16x2 LCD</span>
          </span>
          <span className="text-[8px] font-mono text-slate-400">Max 16 Chars/Line</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            maxLength={16}
            value={customLine1}
            onChange={(e) => setCustomLine1(e.target.value)}
            placeholder="Line 1 (e.g. HACKATHON 2026)"
            className="w-full bg-[#030604] border border-[#1a3326] rounded px-2.5 py-1 text-xs font-mono text-emerald-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <div className="flex gap-1.5">
            <input
              type="text"
              maxLength={16}
              value={customLine2}
              onChange={(e) => setCustomLine2(e.target.value)}
              placeholder="Line 2 (e.g. JUDGES DEMO OK)"
              className="w-full bg-[#030604] border border-[#1a3326] rounded px-2.5 py-1 text-xs font-mono text-emerald-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isSendingLCD}
              className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-xs font-mono font-semibold flex items-center gap-1 transition-all shrink-0 hover:scale-105 active:scale-95"
            >
              <Send className="w-3 h-3" />
              <span>{isSendingLCD ? 'Sent' : 'Send'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
