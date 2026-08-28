import { create } from 'zustand';
import type { Device, TelemetryPayload, DeviceEvent, FleetSummary, FirmwareRelease } from '@/types';

interface DeviceStore {
  devices: Device[];
  fleetSummary: FleetSummary | null;
  firmware: FirmwareRelease[];
  events: DeviceEvent[];
  wsConnected: boolean;
  backendConnected: boolean;
  isLoading: boolean;
  setDevices: (devices: Device[]) => void;
  updateDevice: (deviceId: string, update: Partial<Device>) => void;
  setFleetSummary: (summary: FleetSummary) => void;
  setFirmware: (firmware: FirmwareRelease[]) => void;
  addEvent: (event: DeviceEvent) => void;
  setEvents: (events: DeviceEvent[]) => void;
  setWsConnected: (connected: boolean) => void;
  setBackendConnected: (connected: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  updateFromTelemetry: (telemetry: TelemetryPayload) => void;
}

const INITIAL_DEVICE: Device = {
  deviceId: 'NXP-001',
  name: 'Gate-Terminal-South',
  status: 'ONLINE',
  firmwareVersion: '1.0.0',
  activeBank: 'A',
  inactiveBank: 'B',
  bankAFirmware: 'v1.0.0 (SmartPass)',
  bankBFirmware: 'v2.0.0 (MetroPay)',
  health: 100,
  led: 'GREEN',
  oledLines: ['SmartPass v1.0.0', 'Tap Card...'],
  pirMotion: false,
  radarDistance: 0.9,
  safeMode: false,
  watchdogHealthy: true,
  heartbeat: true,
  uptime: 120,
  lastSeen: new Date().toISOString(),
  updateState: 'IDLE',
  rollbackCount: 0,
  targetHardware: 'NXP FRDM-MCXN236',
  isSimulated: false,
};

const INITIAL_FLEET: FleetSummary = {
  totalDevices: 1,
  healthy: 1,
  updating: 0,
  failed: 0,
  safeMode: 0,
  offline: 0,
  recovering: 0,
  activeFirmware: 'v1.0.0 (SmartPass)',
  rollbackCount: 0,
  securityEvents: 0,
};

const INITIAL_FIRMWARE: FirmwareRelease[] = [
  {
    id: 'fw-1',
    name: 'SmartPass Baseline',
    version: '1.0.0',
    type: 'STABLE',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    signatureStatus: 'SIGNED',
    targetHardware: 'NXP FRDM-MCXN236',
    minimumBootloader: '1.0.0',
    status: 'APPROVED',
    createdAt: '2026-08-20T10:00:00Z',
    deploymentCount: 12,
    description: 'NXP Dual-Bank Baseline Image. Fixed fare card access validation with RFID RC522.',
    healthGatePasses: true,
    isBreakingDemo: false,
  },
  {
    id: 'fw-2',
    name: 'MetroPay Dynamic Route & Balance',
    version: '2.0.0',
    type: 'STABLE',
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    signatureStatus: 'SIGNED',
    targetHardware: 'NXP FRDM-MCXN236',
    minimumBootloader: '1.0.0',
    status: 'APPROVED',
    createdAt: '2026-08-27T14:30:00Z',
    deploymentCount: 4,
    description: 'Dynamic transit fare calculation, automatic card balance deduction, and dual-bank execution.',
    healthGatePasses: true,
    isBreakingDemo: false,
  },
  {
    id: 'fw-3',
    name: 'Sensor Optimization (Corrupted)',
    version: '3.0.0-BROKEN',
    type: 'BROKEN',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    signatureStatus: 'SIGNED',
    targetHardware: 'NXP FRDM-MCXN236',
    minimumBootloader: '1.0.0',
    status: 'APPROVED',
    createdAt: '2026-08-28T08:00:00Z',
    deploymentCount: 1,
    description: 'FAULT LAB: Induces runtime peripheral stall & watchdog timeout to trigger autonomous rollback.',
    healthGatePasses: false,
    isBreakingDemo: true,
  },
];

const INITIAL_EVENTS: DeviceEvent[] = [
  {
    id: 'evt-1',
    deviceId: 'NXP-001',
    eventType: 'BOOT_COMPLETED',
    severity: 'INFO',
    message: 'NXP FRDM-MCXN236 booted successfully into Bank A (v1.0.0 SmartPass)',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'evt-2',
    deviceId: 'NXP-001',
    eventType: 'HEALTH_GATE_PASSED',
    severity: 'LOW',
    message: 'Hardware Health Gate 100% — RC522 RFID, 7-Segment, and LEDs active',
    timestamp: new Date(Date.now() - 30000).toISOString(),
  },
];

export const useDeviceStore = create<DeviceStore>((set) => ({
  devices: [INITIAL_DEVICE],
  fleetSummary: INITIAL_FLEET,
  firmware: INITIAL_FIRMWARE,
  events: INITIAL_EVENTS,
  wsConnected: false,
  backendConnected: false,
  isLoading: false,
  setDevices: (devices) => set({ devices }),
  updateDevice: (deviceId, update) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.deviceId === deviceId ? { ...d, ...update } : d
      ),
    })),
  setFleetSummary: (fleetSummary) => set({ fleetSummary }),
  setFirmware: (firmware) => set({ firmware }),
  addEvent: (event) =>
    set((state) => ({ events: [event, ...state.events].slice(0, 100) })),
  setEvents: (events) => set({ events }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
  setBackendConnected: (backendConnected) => set({ backendConnected }),
  setIsLoading: (isLoading) => set({ isLoading }),
  updateFromTelemetry: (telemetry) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.deviceId === telemetry.deviceId
          ? {
              ...d,
              firmwareVersion: telemetry.firmwareVersion,
              activeBank: telemetry.activeBank,
              health: telemetry.health,
              led: telemetry.led,
              pirMotion: telemetry.pirMotion,
              radarDistance: telemetry.radarDistance,
              safeMode: telemetry.safeMode,
              watchdogHealthy: telemetry.watchdogHealthy,
              heartbeat: telemetry.heartbeat,
              uptime: telemetry.uptime,
              updateState: telemetry.updateState,
              oledLines: telemetry.oledLines,
              status: telemetry.safeMode
                ? 'SAFE_MODE'
                : telemetry.updateState !== 'IDLE' && telemetry.updateState !== 'CONFIRMED'
                ? 'UPDATING'
                : 'ONLINE',
            }
          : d
      ),
    })),
}));