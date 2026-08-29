export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'UPDATING' | 'FAILED' | 'SAFE_MODE' | 'RECOVERING';
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
  ipAddress?: string;
  macAddress?: string;
  rssi?: number;
  location?: string;
  bootloaderVersion?: string;
  flashOffsetBankA?: string;
  flashOffsetBankB?: string;
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
  fileSizeKb?: number;
  signedBy?: string;
  changelog?: string[];
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

export type RolloutStrategy = 'CANARY' | 'LINEAR' | 'IMMEDIATE' | 'BLUE_GREEN';
export type RolloutStatus = 'PLANNED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'ABORTED';

export interface RolloutCampaign {
  id: string;
  name: string;
  firmwareId: string;
  firmwareVersion: string;
  targetGroup: string;
  strategy: RolloutStrategy;
  status: RolloutStatus;
  currentStage: number;
  totalStages: number;
  targetCount: number;
  completedCount: number;
  failedCount: number;
  safeModeCount: number;
  failureThresholdPercent: number;
  soakTimeSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityIncident {
  id: string;
  deviceId: string;
  title: string;
  attackVector: string;
  severity: EventSeverity;
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
  timestamp: string;
  details: string;
  mitigation: string;
  signatureStatus?: SignatureStatus;
  hashMismatch?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  category: 'AUTH' | 'DEPLOYMENT' | 'SECURITY' | 'RECOVERY' | 'POLICY' | 'SYSTEM';
  target: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details: string;
  hash: string;
}

export interface SafetyPolicy {
  id: string;
  name: string;
  category: 'HEALTH_GATE' | 'ROLLOUT' | 'SECURITY' | 'HARDWARE';
  enabled: boolean;
  threshold: number | string | boolean;
  unit?: string;
  description: string;
}

export interface RecoveryPlan {
  id: string;
  deviceId: string;
  tier: 'TIER_1_AUTO_SWAP' | 'TIER_2_GOLDEN_RESTORE' | 'TIER_3_OPERATOR_OVERRIDE';
  reason: string;
  recommendedAction: string;
  status: 'PENDING' | 'EXECUTING' | 'RESTORED' | 'FAILED';
  initiatedAt: string;
  authorizedBy?: string;
  progress?: number;
}

export interface AttackScenario {
  id: string;
  name: string;
  description: string;
  targetBank: 'A' | 'B';
  vector: 'SIGNATURE_FORGERY' | 'DOWNGRADE_ATTACK' | 'RUNTIME_FAULT' | 'MITM_CORRUPTION' | 'DOS_FLOOD';
  severity: EventSeverity;
  expectedOutcome: string;
  mitigationTime: string;
  payloadPreview: string;
}