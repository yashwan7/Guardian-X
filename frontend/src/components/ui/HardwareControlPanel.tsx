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
      uptime: (primaryDevice?.uptime || 100) + 1,
      updateState: 'ROLLBACK',
      oledLines: ['!HARDWARE CRASH!', 'Watchdog Barked'],
    });

    addEvent({
      id: `evt-${Date.now()}`,
      deviceId: 'NXP-001',
      eventType: 'FAULT_INJECTED',
      severity: 'CRITICAL',
      message: 'Web Control: Injected infinite task freeze. Watchdog counter starved.',
      timestamp: new Date().toISOString(),
    });

    // Autonomous MCUboot Rollback after 2.5 seconds
    setTimeout(async () => {
      await webSerial.switchBank('A');
      buzzerAudio.playRollbackTone();

      updateFromTelemetry({
        deviceId: 'NXP-001',
        timestamp: new Date().toISOString(),
        firmwareVersion: '1.0.0',
        activeBank: 'A',
        health: 100,
        led: 'GREEN',
        pirMotion: false,
        radarDistance: 1.5,
        safeMode: false,
        watchdogHealthy: true,
        heartbeat: true,
        uptime: (primaryDevice?.uptime || 100) + 3,
        updateState: 'IDLE',
        oledLines: ['AUTO-ROLLBACK OK', 'Bank A: v1.0.0'],
      });

      addEvent({
        id: `evt-${Date.now()}`,
        deviceId: 'NXP-001',
        eventType: 'AUTONOMOUS_ROLLBACK_SUCCESS',
        severity: 'LOW',
        message: 'MCUboot Autonomous Rollback: Reinstated Golden Bank A (v1.0.0 SmartPass). System restored to 100% health.',
        timestamp: new Date().toISOString(),
      });

      setIsInjecting(false);
    }, 2800);
  };

  // Scenario 3: Simulate RFID Card Tap (Physical NXP + Web)
  const handleTapRFID = async () => {
    if (isTapping) return;
    setIsTapping(true);

    const isMetroPay = primaryDevice?.activeBank === 'B';

    // Send to physical NXP board
    await webSerial.triggerRFID();

    if (isMetroPay) {
      buzzerAudio.playMetroPayChime();
      updateFromTelemetry({
        deviceId: 'NXP-001',
        timestamp: new Date().toISOString(),
        firmwareVersion: '2.0.0',
        activeBank: 'B',
        health: 100,
        led: 'BLUE',
        pirMotion: true,
        radarDistance: 0.8,
        safeMode: false,
        watchdogHealthy: true,
        heartbeat: true,
        uptime: (primaryDevice?.uptime || 100) + 1,
        updateState: 'CONFIRMED',
        oledLines: ['FARE DEDUCTED $2', 'Bal: $48.50 OK'],
      });

      addEvent({
        id: `evt-${Date.now()}`,
        deviceId: 'NXP-001',
        eventType: 'RFID_FARE_DEBITED',
        severity: 'INFO',
        message: 'RFID Card Tapped: MetroPay v2.0 Fare Processed ($2.50 deducted)',
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
      setCustomLine1('');
      setCustomLine2('');
    }, 1000);
  };

  // Scenario 7: Clear Safe Mode Quarantine
  const handleClearSafeMode = async () => {
    await webSerial.switchBank('A');
    buzzerAudio.playSuccessBeep(2600, 100);

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
      uptime: (primaryDevice?.uptime || 100) + 1,
      updateState: 'IDLE',
      oledLines: ['SAFE MODE LIFTED', 'System Normal'],
    });

    addEvent({
      id: `evt-${Date.now()}`,
      deviceId: 'NXP-001',
      eventType: 'SAFE_MODE_CLEARED',
      severity: 'INFO',
      message: 'Operator cleared Safe Mode quarantine on physical NXP board.',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-sans uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1.5">
          <Monitor className="w-3.5 h-3.5 text-blue-500" />
          <span>Hardware Remote Controls</span>
        </span>
        <span className="text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400">
          NXP-001 &bull; 2-Way Hardware Sync
        </span>
      </div>

      {/* Control Buttons Grid (Apple Vision Frosted Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* 1. Deploy OTA */}
        <button
          onClick={handleDeployOTA}
          disabled={isDeploying}
          className="flex flex-col items-start p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-400 hover:shadow-md transition-all text-left group shadow-xs hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200/80">
              OTA v2.0
            </span>
          </div>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white font-sans">
            {isDeploying ? 'Deploying...' : 'Deploy OTA'}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full mt-0.5 font-medium">
            Stage Bank B &amp; Switch
          </span>
        </button>

        {/* 2. Switch Dual Bank */}
        <button
          onClick={handleToggleBank}
          className="flex flex-col items-start p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-400 hover:shadow-md transition-all text-left group shadow-xs hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80">
              SLOT
            </span>
          </div>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white font-sans">
            Switch Bank
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full mt-0.5 font-medium">
            Toggle Bank A ⟷ B
          </span>
        </button>

        {/* 3. Tap RFID Card */}
        <button
          onClick={handleTapRFID}
          disabled={isTapping}
          className="flex flex-col items-start p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-400 hover:shadow-md transition-all text-left group shadow-xs hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border border-emerald-200/80">
              RC522
            </span>
          </div>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white font-sans">
            {isTapping ? 'Reading...' : 'Tap RFID'}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full mt-0.5 font-medium">
            {primaryDevice?.activeBank === 'B' ? 'MetroPay Fare Debit' : 'SmartPass Access'}
          </span>
        </button>

        {/* 4. Inject Watchdog Fault */}
        <button
          onClick={handleInjectFault}
          disabled={isInjecting}
          className="flex flex-col items-start p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 hover:border-rose-400 hover:shadow-md transition-all text-left group shadow-xs hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 border border-rose-200/80">
              FAULT
            </span>
          </div>
          <span className="text-xs font-extrabold text-rose-600 dark:text-rose-300 font-sans">
            {isInjecting ? 'Stalling...' : 'Inject Fault'}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full mt-0.5 font-medium">
            Watchdog Rollback Test
          </span>
        </button>

        {/* 5. Test Buzzer */}
        <button
          onClick={handleTestBuzzer}
          className="flex flex-col items-start p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-amber-400 hover:shadow-md transition-all text-left group shadow-xs hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border border-amber-200/80">
              AUDIO
            </span>
          </div>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white font-sans">
            Test Buzzer
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full mt-0.5 font-medium">
            Trigger P4_13 Tone
          </span>
        </button>

        {/* 6. Safe Mode Clear / WebSerial Connect */}
        {primaryDevice?.safeMode ? (
          <button
            onClick={handleClearSafeMode}
            className="flex flex-col items-start p-3 rounded-xl bg-amber-50/80 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 hover:border-amber-500 hover:shadow-md transition-all text-left group shadow-xs hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800">
                CLEAR
              </span>
            </div>
            <span className="text-xs font-extrabold text-amber-800 dark:text-amber-200 font-sans">
              Lift Safe Mode
            </span>
            <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80 truncate w-full mt-0.5 font-medium">
              Approve Normal Ops
            </span>
          </button>
        ) : (
          <button
            onClick={handleConnectWebSerial}
            className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left group shadow-xs hover:-translate-y-0.5 ${
              backendConnected
                ? 'bg-blue-50/80 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                : 'bg-slate-50/90 dark:bg-slate-800/80 hover:bg-slate-100 border-slate-200/80 dark:border-slate-700/60 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Usb className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                SERIAL
              </span>
            </div>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white font-sans">
              {backendConnected ? 'Connected' : 'WebSerial'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full mt-0.5 font-medium">
              {backendConnected ? '115200 2-Way Sync' : 'Click to Link Board'}
            </span>
          </button>
        )}
      </div>

      {/* --- Live Remote LCD Message Sender --- */}
      <form
        onSubmit={handleSendCustomLCD}
        className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-2.5 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-sans uppercase tracking-wider text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
            <span>Send Custom Text to Physical 16x2 LCD</span>
          </span>
          <span className="text-[9px] font-mono text-slate-400">Max 16 Chars/Line</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            maxLength={16}
            value={customLine1}
            onChange={(e) => setCustomLine1(e.target.value)}
            placeholder="Line 1 (e.g. HACKATHON 2026)"
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
          />
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={16}
              value={customLine2}
              onChange={(e) => setCustomLine2(e.target.value)}
              placeholder="Line 2 (e.g. JUDGES DEMO OK)"
              className="w-full bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
            />
            <button
              type="submit"
              disabled={isSendingLCD}
              className="px-4 py-1.5 bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm hover:scale-102 active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingLCD ? 'Sent' : 'Send'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
