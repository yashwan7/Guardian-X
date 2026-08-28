// ==================================================
// SECURE OTA GUARDIAN — Shared TypeScript Types
// ==================================================
// These types are shared between frontend and device-simulator.
// Backend uses equivalent Java DTOs.

// ── Device States ──────────────────────────────────

export type DeviceStatus =
  | 'ONLINE'
  | 'OFFLINE'
  | 'UPDATING'
  | 'FAILED'
  | 'SAFE_MODE'
  | 'RECOVERING';

export type UpdateState =
  | 'IDLE'
  | 'UPDATE_PENDING'
  | 'DOWNLOADING'
  | 'VERIFYING'
  | 'INSTALLING'
  | 'REBOOTING'
  | 'HEALTH_CHECK'
  | 'CONFIRMED'
  | 'FAILED'
  | 'ROLLBACK'
  | 'SAFE_MODE'
  | 'RECOVERY_PENDING'
  | 'RECOVERY_APPROVED'
  | 'RECOVERING';

export type ActiveBank = 'A' | 'B';

export type LEDColor = 'GREEN' | 'YELLOW' | 'BLUE' | 'RED' | 'OFF';

// ── Device ─────────────────────────────────────────

export interface Device {
  id: string;
  deviceId: string;         // e.g. "NXP-001"
  name: string;
  status: DeviceStatus;
  firmwareVersion: string;
  activeBank: ActiveBank;
  inactiveBank: ActiveBank;
  bankAFirmware: string;
  bankBFirmware: string;
  health: number;           // 0-100
  led: LEDColor;
  oledLines: string[];      // 4 lines mirroring physical OLED
  pirMotion: boolean;
  radarDistance: number;    // metres
  safeMode: boolean;
  watchdogHealthy: boolean;
  heartbeat: boolean;
  uptime: number;           // seconds
  lastSeen: string;         // ISO 8601
  updateState: UpdateState;
  rollbackCount: number;
  targetHardware: string;   // "NXP-FRDM-MCXN236"
  isSimulated: boolean;
}

// ── Firmware ───────────────────────────────────────

export type FirmwareType = 'STABLE' | 'BROKEN' | 'SECURITY_PATCH' | 'BETA';

export type FirmwareStatus =
  | 'DRAFT'
  | 'APPROVED'
  | 'QUARANTINED'
  | 'DEPRECATED';

export type SignatureStatus = 'SIGNED' | 'UNSIGNED' | 'INVALID';

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
  healthGatePasses: boolean;  // expected outcome
  isBreakingDemo: boolean;    // Update 2 flag
}

// ── Telemetry ──────────────────────────────────────

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

// ── Events ─────────────────────────────────────────

export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EventType =
  | 'DEVICE_ONLINE'
  | 'DEVICE_OFFLINE'
  | 'UPDATE_STARTED'
  | 'UPDATE_DOWNLOADING'
  | 'UPDATE_VERIFYING'
  | 'UPDATE_INSTALLING'
  | 'UPDATE_REBOOTING'
  | 'HEALTH_CHECK_STARTED'
  | 'HEALTH_CHECK_PASSED'
  | 'HEALTH_CHECK_FAILED'
  | 'FIRMWARE_CONFIRMED'
  | 'ROLLBACK_TRIGGERED'
  | 'SAFE_MODE_ENTERED'
  | 'RECOVERY_INITIATED'
  | 'RECOVERY_COMPLETED'
  | 'SIGNATURE_FAILURE'
  | 'HASH_MISMATCH'
  | 'DOWNGRADE_ATTEMPT'
  | 'WRONG_HARDWARE_TARGET'
  | 'WATCHDOG_TRIGGERED'
  | 'FLASH_SWAP';

export interface DeviceEvent {
  id: string;
  deviceId: string;
  eventType: EventType;
  severity: EventSeverity;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// ── Deployment ─────────────────────────────────────

export type DeploymentStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'ROLLED_BACK'
  | 'HALTED';

export interface Deployment {
  id: string;
  firmwareReleaseId: string;
  firmwareVersion: string;
  firmwareName: string;
  deviceId: string;
  status: DeploymentStatus;
  startedAt: string;
  completedAt?: string;
  currentState: UpdateState;
  rollbackTriggered: boolean;
  failureReason?: string;
}

// ── Fleet ──────────────────────────────────────────

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

// ── Security ───────────────────────────────────────

export type SecurityEventType =
  | 'SIGNATURE_FAILURE'
  | 'HASH_MISMATCH'
  | 'DOWNGRADE_ATTEMPT'
  | 'WRONG_HARDWARE'
  | 'UNAUTHORIZED_OP'
  | 'HEALTH_FAILURE'
  | 'ROLLBACK_EVENT'
  | 'SAFE_MODE_ENTRY';

export interface SecurityEvent {
  id: string;
  deviceId: string;
  eventType: SecurityEventType;
  severity: EventSeverity;
  description: string;
  firmwareVersion?: string;
  timestamp: string;
  resolved: boolean;
}
