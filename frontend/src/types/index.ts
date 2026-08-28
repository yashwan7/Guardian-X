export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'UPDATING' | 'FAILED' | 'SAFE_MODE' | 'RECOVERING';
export type UpdateState = 'IDLE' | 'UPDATE_PENDING' | 'DOWNLOADING' | 'VERIFYING' | 'INSTALLING' | 'REBOOTING' | 'HEALTH_CHECK' | 'CONFIRMED' | 'FAILED' | 'ROLLBACK' | 'SAFE_MODE' | 'RECOVERY_PENDING' | 'RECOVERY_APPROVED' | 'RECOVERING';
export type ActiveBank = 'A' | 'B';
export type LEDColor = 'GREEN' | 'YELLOW' | 'BLUE' | 'RED' | 'OFF';
export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FirmwareType = 'STABLE' | 'BROKEN' | 'SECURITY_PATCH' | 'BETA';
export type FirmwareStatus = 'DRAFT' | 'APPROVED' | 'QUARANTINED' | 'DEPRECATED';
export type SignatureStatus = 'SIGNED' | 'UNSIGNED' | 'INVALID';

export interface Device {
  id?: string;
  deviceId: string;
  name: string;
  status: DeviceStatus;
  firmwareVersion: string;
  activeBank: ActiveBank;
  inactiveBank: ActiveBank;
  bankAFirmware: string;
  bankBFirmware: string | null;
  health: number;
  led: LEDColor;
  oledLines: string[];
  pirMotion: boolean;
  radarDistance: number;
  safeMode: boolean;
  watchdogHealthy: boolean;
  heartbeat: boolean;
  uptime: number;
  lastSeen: string;
  updateState: UpdateState;
  rollbackCount: number;
  targetHardware: string;
  isSimulated: boolean;
}

export interface FirmwareRelease {
  id: string;
  name: string;
  version: string;
  type: FirmwareType;
  sha256: string;
  signatureStatus: SignatureStatus;
  targetHardware: string;
  minimumBootloader: string;
  status: FirmwareStatus;
  createdAt: string;
  deploymentCount: number;
  description: string;
  healthGatePasses: boolean;
  isBreakingDemo: boolean;
}

export interface FleetSummary {
  totalDevices: number;
  healthy: number;
  updating: number;
  failed: number;
  safeMode: number;
  offline: number;
  recovering: number;
  activeFirmware: string;
  rollbackCount: number;
  securityEvents: number;
}

export interface DeviceEvent {
  id: string;
  deviceId: string;
  eventType: string;
  severity: EventSeverity;
  message: string;
  timestamp: string;
}

export interface TelemetryPayload {
  deviceId: string;
  timestamp: string;
  firmwareVersion: string;
  activeBank: ActiveBank;
  health: number;
  led: LEDColor;
  pirMotion: boolean;
  radarDistance: number;
  safeMode: boolean;
  watchdogHealthy: boolean;
  heartbeat: boolean;
  uptime: number;
  updateState: UpdateState;
  oledLines: string[];
}