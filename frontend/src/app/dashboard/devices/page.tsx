'use client';

import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import {
  Cpu,
  Plus,
  Search,
  Wifi,
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  RotateCcw,
  Zap,
  Activity,
  X,
  Radio,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import type { Device, LEDColor } from '@/types';

export default function DevicesPage() {
  const { devices, addDevice, updateDevice, addEvent, addAuditLog, clearDeviceSafeMode } =
    useDeviceStore();
  const [search, setSearch] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [diagActionMsg, setDiagActionMsg] = useState<string | null>(null);

  // New Device Form State
  const [newDeviceId, setNewDeviceId] = useState(`NXP-00${devices.length + 1}`);
  const [newName, setNewName] = useState('Gate-Terminal-New');
  const [newLocation, setNewLocation] = useState('Platform 2 - Concourse');
  const [newHardware, setNewHardware] = useState('NXP FRDM-MCXN236');

  const filteredDevices = devices.filter(
    (d) =>
      d.deviceId.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.location && d.location.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRegisterDevice = (e: React.FormEvent) => {
    e.preventDefault();
    const newDevice: Device = {
      deviceId: newDeviceId,
      name: newName,
      status: 'ONLINE',
      firmwareVersion: '1.0.0',
      activeBank: 'A',
      inactiveBank: 'B',
      bankAFirmware: 'v1.0.0 (SmartPass Golden)',
      bankBFirmware: null,
      health: 100,
      led: 'GREEN',
      oledLines: ['SmartPass v1.0.0', 'READY FOR TAP'],
      pirMotion: false,
      radarDistance: 1.0,
      safeMode: false,
      watchdogHealthy: true,
      heartbeat: true,
      uptime: 0,
      lastSeen: new Date().toISOString(),
      updateState: 'IDLE',
      rollbackCount: 0,
      targetHardware: newHardware,
      isSimulated: true,
      ipAddress: `192.168.1.${100 + devices.length + 1}`,
      macAddress: `00:04:9F:88:A1:0${devices.length + 1}`,
      rssi: -55,
      location: newLocation,
      bootloaderVersion: '1.0.0-MCUboot',
      flashOffsetBankA: '0x00020000',
      flashOffsetBankB: '0x00100000',
    };

    addDevice(newDevice);
    setShowAddModal(false);
    setNewDeviceId(`NXP-00${devices.length + 2}`);
  };

  const handleTriggerSensor = (deviceId: string) => {
    updateDevice(deviceId, {
      pirMotion: true,
      radarDistance: 0.3,
      oledLines: ['SMARTPASS ACTIVE', 'RFID TAP DETECTED!'],
      led: 'BLUE',
    });
    setDiagActionMsg('Simulated RFID Tap & Radar Proximity Triggered!');
    addEvent({
      id: `evt-${Date.now()}`,
      deviceId,
      eventType: 'SENSOR_INTERACTION_SIMULATED',
      severity: 'INFO',
      message: `Card tap and radar sensor triggered on ${deviceId}`,
      timestamp: new Date().toISOString(),
    });

    setTimeout(() => {
      updateDevice(deviceId, {
        pirMotion: false,
        radarDistance: 1.2,
        oledLines: ['SmartPass v1.0.0', 'Tap Card...'],
        led: 'GREEN',
      });
      setDiagActionMsg(null);
    }, 3000);
  };

  const handleRebootDevice = (deviceId: string) => {
    updateDevice(deviceId, {
      status: 'UPDATING',
      updateState: 'REBOOTING',
      led: 'YELLOW',
      oledLines: ['SYSTEM REBOOTING', 'MCUboot Initializing'],
    });
    setDiagActionMsg(`Device ${deviceId} reboot initiated.`);

    setTimeout(() => {
      updateDevice(deviceId, {
        status: 'ONLINE',
        updateState: 'IDLE',
        led: 'GREEN',
        uptime: 10,
        oledLines: ['SmartPass v1.0.0', 'Boot Completed (Bank A)'],
      });
      setDiagActionMsg(`Device ${deviceId} online.`);
      addAuditLog({
        actor: 'Operator (admin@guardian.nxp)',
        action: 'DEVICE_REBOOT_TRIGGERED',
        category: 'SYSTEM',
        target: deviceId,
        status: 'SUCCESS',
        details: 'Hardware soft reboot executed via MCUboot watchdog reset command.',
      });
    }, 2000);
  };

  const handleBankSwapTest = (deviceId: string) => {
    const current = devices.find((d) => d.deviceId === deviceId);
    if (!current) return;
    const newBank = current.activeBank === 'A' ? 'B' : 'A';
    const newInactive = current.activeBank;
    const newVer = newBank === 'B' ? '2.0.0' : '1.0.0';

    updateDevice(deviceId, {
      activeBank: newBank,
      inactiveBank: newInactive,
      firmwareVersion: newVer,
      led: newBank === 'B' ? 'BLUE' : 'GREEN',
      oledLines: [`Swapped to Bank ${newBank}`, `FW: v${newVer}`],
    });
    setDiagActionMsg(`Hardware bank swapped to Bank ${newBank} (v${newVer}).`);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Device Inventory &amp; Hardware Hub
            </h1>
            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-semibold">
              {devices.length} PROVISIONED NODES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hardware partition maps, cryptographic identities, MCUboot offsets, and direct diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-[0_0_16px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Node</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-[#060b08] border border-[#14221b] rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Device ID, MAC, or Location..."
            className="w-full bg-[#0a140f] border border-[#182b21] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
          />
        </div>
        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Architecture: <span className="text-emerald-400">MCUboot Dual-Bank (Flash 2MB)</span>
        </div>
      </div>

      {/* Devices Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDevices.map((device) => {
          const isSafeMode = device.safeMode || device.status === 'SAFE_MODE';
          const isUpdating = device.status === 'UPDATING';

          return (
            <div
              key={device.deviceId}
              className={`p-4 rounded-xl bg-[#060b08] border transition-all duration-200 hover:border-emerald-500/40 flex flex-col justify-between ${
                isSafeMode
                  ? 'border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.08)]'
                  : 'border-[#14221b]'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-100">
                        {device.deviceId}
                      </span>
                      {device.deviceId === 'NXP-001' && (
                        <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                          PHYSICAL TWIN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{device.name}</p>
                  </div>

                  {isSafeMode ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> SAFE MODE
                    </span>
                  ) : isUpdating ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 animate-spin" /> UPDATING
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> ONLINE
                    </span>
                  )}
                </div>

                {/* Micro Specs List */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#09130e] p-2.5 rounded-lg border border-[#112017] mb-3">
                  <div>
                    <span className="text-slate-500 block text-[9px]">ACTIVE BANK</span>
                    <span
                      className={`font-bold ${
                        device.activeBank === 'A' ? 'text-emerald-400' : 'text-cyan-400'
                      }`}
                    >
                      Slot {device.activeBank} (v{device.firmwareVersion})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">INACTIVE BANK</span>
                    <span className="text-slate-300">
                      Slot {device.inactiveBank} ({device.inactiveBank === 'B' ? device.bankBFirmware || 'Empty' : device.bankAFirmware})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">IP / MAC</span>
                    <span className="text-slate-300 truncate block">
                      {device.ipAddress || '192.168.1.101'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">SIGNAL (RSSI)</span>
                    <span className="text-slate-300 flex items-center gap-1">
                      <Wifi className="w-2.5 h-2.5 text-emerald-400" />
                      {device.rssi || -58} dBm
                    </span>
                  </div>
                </div>

                {/* OLED Display Mini Preview */}
                <div className="bg-[#020503] p-2 rounded-md border border-[#102418] font-mono text-[10px] text-emerald-400 mb-3 space-y-0.5">
                  <div className="text-slate-500 text-[8px] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>OLED SSD1306 Display</span>
                    <span className="text-emerald-500/70">128x64 I2C</span>
                  </div>
                  <div className="text-emerald-300 font-bold">&gt; {device.oledLines?.[0] || 'READY'}</div>
                  <div className="text-emerald-500/80">&gt; {device.oledLines?.[1] || 'Standby'}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#112017] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDevice(device)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#0c1a13] hover:bg-[#12281d] border border-[#183324] text-[11px] font-mono text-emerald-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Terminal className="w-3 h-3" />
                  <span>Diagnostics</span>
                </button>

                <button
                  onClick={() => handleTriggerSensor(device.deviceId)}
                  title="Simulate RFID Card Tap & Proximity Radar"
                  className="p-1.5 rounded-lg bg-[#0c1a13] hover:bg-[#12281d] border border-[#183324] text-emerald-400 transition-colors"
                >
                  <Radio className="w-3.5 h-3.5" />
                </button>

                {isSafeMode && (
                  <button
                    onClick={() => clearDeviceSafeMode(device.deviceId)}
                    title="Clear Safe Mode Quarantine"
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnostics Drawer / Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050a07] border border-[#162a1f] rounded-2xl w-full max-w-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in font-mono flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#122018] pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Hardware Diagnostic Console &bull; {selectedDevice.deviceId}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans">{selectedDevice.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDevice(null);
                  setDiagActionMsg(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#0d1812]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {diagActionMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{diagActionMsg}</span>
              </div>
            )}

            {/* Hardware Partition Map */}
            <div className="p-3 bg-[#08120d] border border-[#13261b] rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                MCUboot Flash Partition Memory Map (2MB Dual-Bank)
              </span>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="p-2 rounded bg-[#030604] border border-[#0f1d15]">
                  <span className="text-slate-500 block">BOOTLOADER (ROM)</span>
                  <span className="text-slate-200 font-bold">0x00000000 - 0x0001FFFF</span>
                  <span className="text-[9px] text-emerald-500 block">128 KB (Immutable)</span>
                </div>
                <div
                  className={`p-2 rounded border ${
                    selectedDevice.activeBank === 'A'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#030604] border-[#0f1d15] text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 block">SLOT 0 (BANK A)</span>
                  <span className="font-bold">0x00020000 - 0x000FFFFF</span>
                  <span className="text-[9px] block font-semibold">
                    {selectedDevice.activeBank === 'A' ? 'ACTIVE PRIMARY' : 'INACTIVE CANDIDATE'}
                  </span>
                </div>
                <div
                  className={`p-2 rounded border ${
                    selectedDevice.activeBank === 'B'
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                      : 'bg-[#030604] border-[#0f1d15] text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 block">SLOT 1 (BANK B)</span>
                  <span className="font-bold">0x00100000 - 0x001DFFFF</span>
                  <span className="text-[9px] block font-semibold">
                    {selectedDevice.activeBank === 'B' ? 'ACTIVE PRIMARY' : 'INACTIVE CANDIDATE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnostic Actions Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Hardware Interactive Controls
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleTriggerSensor(selectedDevice.deviceId)}
                  className="p-2.5 rounded-lg bg-[#0a1610] hover:bg-[#12281d] border border-[#183324] text-emerald-300 text-xs flex flex-col items-center gap-1 text-center transition-all"
                >
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Trigger RFID Tap</span>
                </button>

                <button
                  onClick={() => handleBankSwapTest(selectedDevice.deviceId)}
                  className="p-2.5 rounded-lg bg-[#0a1610] hover:bg-[#12281d] border border-[#183324] text-cyan-300 text-xs flex flex-col items-center gap-1 text-center transition-all"
                >
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>Test Bank Swap</span>
                </button>

                <button
                  onClick={() => handleRebootDevice(selectedDevice.deviceId)}
                  className="p-2.5 rounded-lg bg-[#0a1610] hover:bg-[#12281d] border border-[#183324] text-amber-300 text-xs flex flex-col items-center gap-1 text-center transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>MCU Reboot</span>
                </button>

                <button
                  onClick={() => clearDeviceSafeMode(selectedDevice.deviceId)}
                  className="p-2.5 rounded-lg bg-[#140b0b] hover:bg-rose-500/20 border border-[#2b1616] text-rose-300 text-xs flex flex-col items-center gap-1 text-center transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>Clear Safe Mode</span>
                </button>
              </div>
            </div>

            {/* Live Telemetry Dump */}
            <div className="p-3 rounded-lg bg-[#020503] border border-[#0d1c14] text-[11px] text-slate-400 space-y-1">
              <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">
                Raw UART / MQTT Diagnostic Packet
              </div>
              <div className="text-emerald-400">
                HEALTH_SCORE: {selectedDevice.health}% | WATCHDOG: OK | UPTIME: {selectedDevice.uptime}s
              </div>
              <div>
                RADAR_DIST: {selectedDevice.radarDistance}m | PIR_MOTION: {selectedDevice.pirMotion ? 'TRUE' : 'FALSE'} | LED: {selectedDevice.led}
              </div>
              <div>
                MAC: {selectedDevice.macAddress} | IP: {selectedDevice.ipAddress} | RSSI: {selectedDevice.rssi} dBm
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register New Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050a07] border border-[#162a1f] rounded-2xl w-full max-w-lg p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in font-mono">
            <div className="flex items-center justify-between border-b border-[#122018] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Register New Hardware Node</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterDevice} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Device Identifier</label>
                <input
                  type="text"
                  required
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Device Friendly Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Hardware MCU</label>
                <select
                  value={newHardware}
                  onChange={(e) => setNewHardware(e.target.value)}
                  className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="NXP FRDM-MCXN236">NXP FRDM-MCXN236 (Dual-Bank Cortex-M33)</option>
                  <option value="NXP MCX-N947">NXP MCX-N947 (Secure Enclave)</option>
                  <option value="ESP32-S3 Dual-OTA">ESP32-S3 Dual-OTA Gateway</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Location / Deployment Zone</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-[#09130e] border border-[#14261c] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="p-3 bg-[#08120d] border border-[#13261b] rounded-lg text-[10px] text-slate-400">
                <span className="text-emerald-400 font-bold block mb-0.5">Initial Provisioning:</span>
                Node will be initialized on Golden Firmware v1.0.0 (SmartPass) in Slot 0 (Bank A) with active health-gated watchdog.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0b1610] text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                >
                  Provision Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}