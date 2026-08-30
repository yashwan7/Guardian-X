'use client';

import { Device } from '@/types';
import LCD1602Preview from '@/components/ui/LCD1602Preview';
import HardwareControlPanel from '@/components/ui/HardwareControlPanel';
import {
  Cpu,
  Zap,
  Power,
  Volume2,
  AlertTriangle,
  CreditCard,
  Radio,
} from 'lucide-react';

export default function DeviceTwin({ device }: { device?: Device }) {
  if (!device) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 h-96 flex flex-col items-center justify-center text-slate-400 font-sans text-xs">
        <Cpu className="w-8 h-8 mb-3 text-slate-300 dark:text-slate-700 animate-pulse" />
        <span>Waiting for NXP hardware telemetry...</span>
      </div>
    );
  }

  const isGreenOn =
    device.led === 'GREEN' ||
    (device.activeBank === 'A' && !device.safeMode && device.updateState !== 'DOWNLOADING');
  const isYellowOn =
    device.led === 'YELLOW' ||
    device.updateState === 'DOWNLOADING' ||
    device.updateState === 'VERIFYING';
  const isBlueOn = device.led === 'BLUE' || (device.activeBank === 'B' && !device.safeMode);
  const isRedAlarm = device.led === 'RED' || device.safeMode || device.updateState === 'ROLLBACK';

  const isRelayEnergized = !device.safeMode && device.status !== 'FAILED';

  const currentAmps = isRedAlarm ? '0.72 A' : device.activeBank === 'B' ? '0.41 A' : '0.38 A';
  const powerWatts = isRedAlarm ? '3.60 W' : device.activeBank === 'B' ? '2.05 W' : '1.90 W';
  const voltageVolts = '5.02 V';

  const lcdLine1 =
    device.oledLines?.[0] || (device.activeBank === 'B' ? 'MetroPay v2.0' : 'SmartPass v1.0');
  const lcdLine2 =
    device.oledLines?.[1] || (device.activeBank === 'B' ? 'Bal & Route Mode' : 'Tap Card...');

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/90 dark:border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col gap-5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.04),_inset_0_1px_1px_rgba(255,255,255,1)] transition-all">
      {/* Device Header */}
      <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Cpu className="w-5 h-5 drop-shadow-xs" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold font-sans text-slate-900 dark:text-white tracking-tight">
                {device.deviceId}
              </h2>
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs">
                FRDM-MCXN236
              </span>
            </div>
            <p className="text-xs font-sans font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Dual-Core ARM Cortex-M33 &bull; Dual-Bank Remap
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-sans font-bold shadow-xs ${
              device.status === 'ONLINE'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50'
                : device.status === 'UPDATING'
                ? 'bg-blue-50 text-blue-600 border-blue-200/80 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50'
                : device.status === 'SAFE_MODE'
                ? 'bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50'
                : 'bg-rose-50 text-rose-600 border-rose-200/80 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700/50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                device.status === 'ONLINE'
                  ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]'
                  : device.status === 'UPDATING'
                  ? 'bg-blue-500 animate-pulse'
                  : device.status === 'SAFE_MODE'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span>{device.status}</span>
          </div>
        </div>
      </div>

      {/* Main Hardware Display & Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: 16x2 HD44780 LCD Screen */}
        <div className="md:col-span-7 flex flex-col justify-between gap-3">
          <LCD1602Preview
            line1={lcdLine1}
            line2={lcdLine2}
            backlight={device.activeBank === 'B' ? 'blue' : isRedAlarm ? 'yellow' : 'green'}
          />

          {/* Peripheral Status Bar: 3 LEDs + Buzzer */}
          <div className="grid grid-cols-4 gap-2.5 pt-2">
            {/* Green LED */}
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <span className="text-[9px] font-sans font-bold text-slate-500 dark:text-slate-400">BANK A</span>
              <div
                className={`w-4 h-4 rounded-full my-1.5 transition-all ${
                  isGreenOn
                    ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]'
                    : 'bg-slate-300 dark:bg-slate-700 opacity-40'
                }`}
              />
              <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">P4_21</span>
            </div>

            {/* Yellow LED */}
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <span className="text-[9px] font-sans font-bold text-slate-500 dark:text-slate-400">OTA STG</span>
              <div
                className={`w-4 h-4 rounded-full my-1.5 transition-all ${
                  isYellowOn
                    ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-pulse'
                    : 'bg-slate-300 dark:bg-slate-700 opacity-40'
                }`}
              />
              <span className="text-[9px] font-mono font-semibold text-amber-600 dark:text-amber-400">P3_17</span>
            </div>

            {/* Blue LED */}
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <span className="text-[9px] font-sans font-bold text-slate-500 dark:text-slate-400">BANK B</span>
              <div
                className={`w-4 h-4 rounded-full my-1.5 transition-all ${
                  isBlueOn
                    ? 'bg-blue-500 shadow-[0_0_12px_#3b82f6]'
                    : 'bg-slate-300 dark:bg-slate-700 opacity-40'
                }`}
              />
              <span className="text-[9px] font-mono font-semibold text-blue-600 dark:text-blue-400">P3_16</span>
            </div>

            {/* Buzzer */}
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <span className="text-[9px] font-sans font-bold text-slate-500 dark:text-slate-400">BUZZER</span>
              <div
                className={`my-1 p-0.5 rounded-full ${
                  isRedAlarm ? 'text-rose-500 animate-bounce' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Volume2 className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono font-semibold text-slate-500">P4_13</span>
            </div>
          </div>
        </div>

        {/* Right: Key Telemetry & Slot Cards */}
        <div className="md:col-span-5 flex flex-col justify-between gap-3">
          {/* Active Firmware & Slot */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 p-3 rounded-xl shadow-xs">
              <span className="text-[9px] font-sans font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                Active Firmware
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono block">
                {device.firmwareVersion}
              </span>
              <span className="text-[10px] font-sans font-bold text-blue-600 dark:text-blue-400 block mt-1">
                {device.activeBank === 'B' ? 'MetroPay v2.0' : 'SmartPass v1.0'}
              </span>
            </div>

            <div className="bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 p-3 rounded-xl shadow-xs">
              <span className="text-[9px] font-sans font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                Execution Slot
              </span>
              <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono block">
                FLASH BANK {device.activeBank}
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mt-1">
                {device.activeBank === 'B' ? '0x00100000' : '0x00000000'}
              </span>
            </div>
          </div>

          {/* Power & Current Sensor Readouts */}
          <div className="bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 p-3 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-sans font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                POWER TELEMETRY
              </span>
              <span className="text-[9px] font-mono text-slate-400">INA219/ACS712</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-xs">
                <span className="text-[8px] font-sans font-bold text-slate-400 block uppercase">VOLTS</span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {voltageVolts}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-xs">
                <span className="text-[8px] font-sans font-bold text-blue-600 dark:text-blue-400 block uppercase">AMPS</span>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {currentAmps}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-xs">
                <span className="text-[8px] font-sans font-bold text-emerald-600 dark:text-emerald-400 block uppercase">WATTS</span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {powerWatts}
                </span>
              </div>
            </div>
          </div>

          {/* Relay Turnstile & RC522 Card Reader Status */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Relay Status */}
            <div className="bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 p-2.5 rounded-xl flex items-center gap-2.5 shadow-xs">
              <div
                className={`p-2 rounded-lg ${
                  isRelayEnergized
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300'
                }`}
              >
                <Power className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-sans font-bold text-slate-500 dark:text-slate-400 block">RELAY (P4_3)</span>
                <span className="text-xs font-sans font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {isRelayEnergized ? '⚡ Energized' : '🔒 Isolated'}
                </span>
              </div>
            </div>

            {/* RFID Status */}
            <div className="bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 p-2.5 rounded-xl flex items-center gap-2.5 shadow-xs">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-sans font-bold text-slate-500 dark:text-slate-400 block">RC522 (SPI)</span>
                <span className="text-xs font-sans font-bold text-slate-800 dark:text-slate-200 truncate block">
                  Tap: Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safe Mode Alert Banner (Only when active) */}
      {device.safeMode && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs font-sans font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              SAFE OPERATIONAL MODE: Firmware automatically restored to Bank A Golden Image.
            </span>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-bold">
            LOCKDOWN ACTIVE
          </span>
        </div>
      )}

      {/* Integrated Hardware Action Controls */}
      <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800">
        <HardwareControlPanel />
      </div>
    </div>
  );
}