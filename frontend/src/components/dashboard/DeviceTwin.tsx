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
} from 'lucide-react';

export default function DeviceTwin({ device }: { device?: Device }) {
  if (!device) {
    return (
      <div className="bg-[#060b08] border border-[#14221b] rounded-xl p-8 h-96 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
        <Cpu className="w-8 h-8 mb-3 text-slate-700 animate-pulse" />
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
    <div className="bg-[#060b08] border border-[#14221b] rounded-xl p-5 flex flex-col gap-5 shadow-sm">
      {/* Device Header */}
      <div className="flex items-center justify-between border-b border-[#14221b] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-mono text-slate-100 tracking-wide">
                {device.deviceId}
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0b1410] text-emerald-300 border border-emerald-500/30">
                FRDM-MCXN236
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Dual-Core ARM Cortex-M33 &bull; Dual-Bank Remap
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-semibold ${
              device.status === 'ONLINE'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : device.status === 'UPDATING'
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                : device.status === 'SAFE_MODE'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                device.status === 'ONLINE'
                  ? 'bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]'
                  : device.status === 'UPDATING'
                  ? 'bg-teal-400 animate-pulse'
                  : device.status === 'SAFE_MODE'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
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

          {/* Peripheral Status Bar: 3 LEDs + Buzzer + Relay + RFID */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#14221b]">
            {/* Green LED */}
            <div className="flex flex-col items-center p-2 rounded-lg bg-[#09110d] border border-white/5">
              <span className="text-[8px] font-mono text-slate-400">BANK A</span>
              <div
                className={`w-3.5 h-3.5 rounded-full my-1 transition-all ${
                  isGreenOn
                    ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                    : 'bg-slate-800 opacity-30'
                }`}
              />
              <span className="text-[8px] font-mono text-emerald-400/80">P4_21</span>
            </div>

            {/* Yellow LED */}
            <div className="flex flex-col items-center p-2 rounded-lg bg-[#09110d] border border-white/5">
              <span className="text-[8px] font-mono text-slate-400">OTA STG</span>
              <div
                className={`w-3.5 h-3.5 rounded-full my-1 transition-all ${
                  isYellowOn
                    ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse'
                    : 'bg-slate-800 opacity-30'
                }`}
              />
              <span className="text-[8px] font-mono text-amber-400/80">P3_17</span>
            </div>

            {/* Blue LED */}
            <div className="flex flex-col items-center p-2 rounded-lg bg-[#09110d] border border-white/5">
              <span className="text-[8px] font-mono text-slate-400">BANK B</span>
              <div
                className={`w-3.5 h-3.5 rounded-full my-1 transition-all ${
                  isBlueOn
                    ? 'bg-teal-400 shadow-[0_0_10px_#2dd4bf]'
                    : 'bg-slate-800 opacity-30'
                }`}
              />
              <span className="text-[8px] font-mono text-teal-400/80">P3_16</span>
            </div>

            {/* Buzzer */}
            <div className="flex flex-col items-center p-2 rounded-lg bg-[#09110d] border border-white/5">
              <span className="text-[8px] font-mono text-slate-400">BUZZER</span>
              <div
                className={`my-1 p-0.5 rounded-full ${
                  isRedAlarm ? 'text-rose-400 animate-bounce' : 'text-slate-400'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] font-mono text-slate-400">P4_13</span>
            </div>
          </div>
        </div>

        {/* Right: Key Telemetry & Slot Cards */}
        <div className="md:col-span-5 flex flex-col justify-between gap-2.5">
          {/* Active Firmware & Slot */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#09110d] border border-[#14221b] p-2.5 rounded-lg">
              <span className="text-[9px] font-mono text-slate-400 block mb-0.5">
                ACTIVE FIRMWARE
              </span>
              <span className="text-xs font-bold text-slate-100 font-mono">
                {device.firmwareVersion}
              </span>
              <span className="text-[8px] font-mono text-emerald-400 block mt-0.5">
                {device.activeBank === 'B' ? 'MetroPay v2.0' : 'SmartPass v1.0'}
              </span>
            </div>

            <div className="bg-[#09110d] border border-[#14221b] p-2.5 rounded-lg">
              <span className="text-[9px] font-mono text-slate-400 block mb-0.5">
                EXECUTION SLOT
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                FLASH BANK {device.activeBank}
              </span>
              <span className="text-[8px] font-mono text-slate-400 block mt-0.5">
                {device.activeBank === 'B' ? '0x00100000' : '0x00000000'}
              </span>
            </div>
          </div>

          {/* Power & Current Sensor Readouts */}
          <div className="bg-[#09110d] border border-[#14221b] p-2.5 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                POWER TELEMETRY
              </span>
              <span className="text-[8px] font-mono text-slate-400">INA219/ACS712</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#050a08] p-1.5 rounded border border-white/5">
                <span className="text-[7px] font-mono text-slate-400 block">VOLTS</span>
                <span className="text-[11px] font-mono font-bold text-slate-200">
                  {voltageVolts}
                </span>
              </div>
              <div className="bg-[#050a08] p-1.5 rounded border border-white/5">
                <span className="text-[7px] font-mono text-emerald-400 block">AMPS</span>
                <span className="text-[11px] font-mono font-bold text-emerald-300">
                  {currentAmps}
                </span>
              </div>
              <div className="bg-[#050a08] p-1.5 rounded border border-white/5">
                <span className="text-[7px] font-mono text-teal-400 block">WATTS</span>
                <span className="text-[11px] font-mono font-bold text-teal-300">
                  {powerWatts}
                </span>
              </div>
            </div>
          </div>

          {/* Relay Turnstile & RC522 Card Reader Status */}
          <div className="grid grid-cols-2 gap-2">
            {/* Relay Status */}
            <div className="bg-[#09110d] border border-[#14221b] p-2 rounded-lg flex items-center gap-2">
              <div
                className={`p-1.5 rounded-md ${
                  isRelayEnergized
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-mono text-slate-400 block">RELAY (P4_3)</span>
                <span className="text-[10px] font-mono font-semibold text-slate-200 truncate block">
                  {isRelayEnergized ? '⚡ Energized' : '🔒 Isolated'}
                </span>
              </div>
            </div>

            {/* RFID Status */}
            <div className="bg-[#09110d] border border-[#14221b] p-2 rounded-lg flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-mono text-slate-400 block">RC522 (SPI)</span>
                <span className="text-[10px] font-mono font-semibold text-slate-200 truncate block">
                  Tap: Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safe Mode Alert Banner (Only when active) */}
      {device.safeMode && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              SAFE OPERATIONAL MODE: Firmware automatically restored to Bank A Golden Image.
            </span>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-200 font-semibold">
            LOCKDOWN ACTIVE
          </span>
        </div>
      )}

      {/* Integrated Hardware Action Controls */}
      <div className="pt-2 border-t border-[#14221b]">
        <HardwareControlPanel />
      </div>
    </div>
  );
}