import { create } from 'zustand';
import type {
  Device,
  TelemetryPayload,
  DeviceEvent,
  FleetSummary,
  FirmwareRelease,
  RolloutCampaign,
  SecurityIncident,
  AuditLog,
  SafetyPolicy,
  RecoveryPlan,
  AttackScenario,
} from '@/types';

interface DeviceStore {
  devices: Device[];
  fleetSummary: FleetSummary | null;
  firmware: FirmwareRelease[];
  events: DeviceEvent[];
  campaigns: RolloutCampaign[];
  securityIncidents: SecurityIncident[];
  auditLogs: AuditLog[];
  policies: SafetyPolicy[];
  recoveryPlans: RecoveryPlan[];
  attackScenarios: AttackScenario[];
  hardwareAdapterMode: 'SIMULATED' | 'HARDWARE_WEBSERIAL' | 'HARDWARE_MQTT';
  wsConnected: boolean;
  backendConnected: boolean;
  isLoading: boolean;

  // Setters & Updaters
  setDevices: (devices: Device[]) => void;
  updateDevice: (deviceId: string, update: Partial<Device>) => void;
  addDevice: (device: Device) => void;
  setFleetSummary: (summary: FleetSummary) => void;
  setFirmware: (firmware: FirmwareRelease[]) => void;
  addFirmware: (release: FirmwareRelease) => void;
  updateFirmwareStatus: (id: string, status: FirmwareRelease['status']) => void;
  addEvent: (event: DeviceEvent) => void;
  setEvents: (events: DeviceEvent[]) => void;
  setWsConnected: (connected: boolean) => void;
  setBackendConnected: (connected: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  updateFromTelemetry: (telemetry: TelemetryPayload) => void;

  // Campaigns
  createCampaign: (campaign: RolloutCampaign) => void;
  updateCampaignStatus: (id: string, status: RolloutCampaign['status']) => void;
  advanceCampaignStage: (id: string) => void;

  // Security & Attacks
  triggerAttack: (scenarioId: string, targetDeviceId: string) => Promise<void>;
  mitigateIncident: (id: string) => void;
  clearDeviceSafeMode: (deviceId: string) => void;

  // Recovery
  executeRecovery: (deviceId: string, tier: RecoveryPlan['tier']) => Promise<void>;

  // Policies & Audit
  updatePolicy: (id: string, enabled: boolean, threshold?: number | string | boolean) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp' | 'hash'>) => void;
  setHardwareAdapterMode: (mode: 'SIMULATED' | 'HARDWARE_WEBSERIAL' | 'HARDWARE_MQTT') => void;
  resetDemo: () => void;
}

const INITIAL_DEVICES: Device[] = [
  {
    deviceId: 'NXP-001',
    name: 'Gate-Terminal-South (Primary)',
    status: 'ONLINE',
    firmwareVersion: '1.0.0',
    activeBank: 'A',
    inactiveBank: 'B',
    bankAFirmware: 'v1.0.0 (SmartPass)',
    bankBFirmware: 'v2.0.0 (MetroPay)',
    health: 98,
    led: 'GREEN',
    oledLines: ['SmartPass v1.0.0', 'Tap Card...'],
    pirMotion: false,
    radarDistance: 0.9,
    safeMode: false,
    watchdogHealthy: true,
    heartbeat: true,
    uptime: 3640,
    lastSeen: new Date().toISOString(),
    updateState: 'IDLE',
    rollbackCount: 0,
    targetHardware: 'NXP FRDM-MCXN236',
    isSimulated: false,
    ipAddress: '192.168.1.101',
    macAddress: '00:04:9F:88:A1:01',
    rssi: -58,
    location: 'Turnstile Zone 1 - Gate South',
    bootloaderVersion: '1.0.0-MCUboot',
    flashOffsetBankA: '0x00020000',
    flashOffsetBankB: '0x00100000',
  },
  {
    deviceId: 'NXP-002',
    name: 'Gate-Terminal-North',
    status: 'ONLINE',
    firmwareVersion: '2.0.0',
    activeBank: 'B',
    inactiveBank: 'A',
    bankAFirmware: 'v1.0.0 (SmartPass)',
    bankBFirmware: 'v2.0.0 (MetroPay)',
    health: 100,
    led: 'BLUE',
    oledLines: ['MetroPay v2.0.0', 'Zone A: Rs 20'],
    pirMotion: true,
    radarDistance: 1.4,
    safeMode: false,
    watchdogHealthy: true,
    heartbeat: true,
    uptime: 14200,
    lastSeen: new Date().toISOString(),
    updateState: 'CONFIRMED',
    rollbackCount: 0,
    targetHardware: 'NXP FRDM-MCXN236',
    isSimulated: true,
    ipAddress: '192.168.1.102',
    macAddress: '00:04:9F:88:A1:02',
    rssi: -62,
    location: 'Turnstile Zone 2 - Gate North',
    bootloaderVersion: '1.0.0-MCUboot',
    flashOffsetBankA: '0x00020000',
    flashOffsetBankB: '0x00100000',
  },
  {
    deviceId: 'NXP-003',
    name: 'Concourse-Validator-01',
    status: 'ONLINE',
    firmwareVersion: '1.0.0',
    activeBank: 'A',
    inactiveBank: 'B',
    bankAFirmware: 'v1.0.0 (SmartPass)',
    bankBFirmware: null,
    health: 96,
    led: 'GREEN',
    oledLines: ['SmartPass v1.0.0', 'Standby'],
    pirMotion: false,
    radarDistance: 2.1,
    safeMode: false,
    watchdogHealthy: true,
    heartbeat: true,
    uptime: 8400,
    lastSeen: new Date().toISOString(),
    updateState: 'IDLE',
    rollbackCount: 0,
    targetHardware: 'NXP FRDM-MCXN236',
    isSimulated: true,
    ipAddress: '192.168.1.103',
    macAddress: '00:04:9F:88:A1:03',
    rssi: -65,
    location: 'Main Concourse Escalator',
    bootloaderVersion: '1.0.0-MCUboot',
    flashOffsetBankA: '0x00020000',
    flashOffsetBankB: '0x00100000',
  },
  {
    deviceId: 'NXP-004',
    name: 'Kiosk-Dispenser-East',
    status: 'UPDATING',
    firmwareVersion: '1.0.0',
    activeBank: 'A',
    inactiveBank: 'B',
    bankAFirmware: 'v1.0.0 (SmartPass)',
    bankBFirmware: 'v2.0.0 (MetroPay)',
    health: 92,
    led: 'YELLOW',
    oledLines: ['INSTALLING v2.0.0', 'Writing Bank B...'],
    pirMotion: false,
    radarDistance: 0.5,
    safeMode: false,
    watchdogHealthy: true,
    heartbeat: true,
    uptime: 5120,
    lastSeen: new Date().toISOString(),
    updateState: 'INSTALLING',
    rollbackCount: 0,
    targetHardware: 'NXP FRDM-MCXN236',
    isSimulated: true,
    ipAddress: '192.168.1.104',
    macAddress: '00:04:9F:88:A1:04',
    rssi: -71,
    location: 'Ticketing Hall East',
    bootloaderVersion: '1.0.0-MCUboot',
    flashOffsetBankA: '0x00020000',
    flashOffsetBankB: '0x00100000',
  },
  {
    deviceId: 'NXP-005',
    name: 'Emergency-Gate-West',
    status: 'ONLINE',
    firmwareVersion: '1.0.0',
    activeBank: 'A',
    inactiveBank: 'B',
    bankAFirmware: 'v1.0.0 (SmartPass)',
    bankBFirmware: null,
    health: 99,
    led: 'GREEN',
    oledLines: ['SmartPass v1.0.0', 'EMERGENCY READY'],
    pirMotion: false,
    radarDistance: 3.0,
    safeMode: false,
    watchdogHealthy: true,
    heartbeat: true,
    uptime: 21600,
    lastSeen: new Date().toISOString(),
    updateState: 'IDLE',
    rollbackCount: 0,
    targetHardware: 'NXP FRDM-MCXN236',
    isSimulated: true,
    ipAddress: '192.168.1.105',
    macAddress: '00:04:9F:88:A1:05',
    rssi: -54,
    location: 'Platform 1 - West Egress',
    bootloaderVersion: '1.0.0-MCUboot',
    flashOffsetBankA: '0x00020000',
    flashOffsetBankB: '0x00100000',
  },
];

const INITIAL_FLEET: FleetSummary = {
  totalDevices: 5,
  healthy: 4,
  updating: 1,
  failed: 0,
  safeMode: 0,
  offline: 0,
  recovering: 0,
  activeFirmware: 'v1.0.0 (SmartPass) / v2.0.0 (MetroPay)',
  rollbackCount: 0,
  securityEvents: 2,
};

const INITIAL_FIRMWARE: FirmwareRelease[] = [
  {
    id: 'fw-1',
    name: 'SmartPass Baseline Image',
    version: '1.0.0',
    type: 'STABLE',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    signatureStatus: 'SIGNED',
    targetHardware: 'NXP FRDM-MCXN236',
    minimumBootloader: '1.0.0',
    status: 'APPROVED',
    createdAt: '2026-08-20T10:00:00Z',
    deploymentCount: 18,
    description: 'NXP Dual-Bank Baseline Image. Fixed fare card access validation with RFID RC522 and 7-segment display.',
    healthGatePasses: true,
    isBreakingDemo: false,
    fileSizeKb: 342,
    signedBy: 'Release-Officer-SecOps (Ed25519)',
    changelog: ['Initial verified Golden Image', 'RC522 SPI integration', 'MCUboot header v1'],
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
    deploymentCount: 6,
    description: 'Dynamic transit fare calculation, automatic card balance deduction, and dual-bank execution.',
    healthGatePasses: true,
    isBreakingDemo: false,
    fileSizeKb: 388,
    signedBy: 'Release-Officer-SecOps (Ed25519)',
    changelog: ['Dynamic balance deduction', 'Radar proximity gating', 'Dual-bank swap confirmation'],
  },
  {
    id: 'fw-3',
    name: 'Sensor Optimization (Fault Injection)',
    version: '3.0.0-BROKEN',
    type: 'BROKEN',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    signatureStatus: 'SIGNED',
    targetHardware: 'NXP FRDM-MCXN236',
    minimumBootloader: '1.0.0',
    status: 'APPROVED',
    createdAt: '2026-08-28T08:00:00Z',
    deploymentCount: 2,
    description: 'FAULT LAB: Induces runtime peripheral deadlock & watchdog starvation to trigger autonomous rollback.',
    healthGatePasses: false,
    isBreakingDemo: true,
    fileSizeKb: 395,
    signedBy: 'Fault-Lab-Sim (Valid Signature / Buggy Logic)',
    changelog: ['Intentional memory leak', 'Watchdog starvation loop', 'Health gate test payload'],
  },
  {
    id: 'fw-4',
    name: 'Zero-Day Crypto Patch CVE-2026-9812',
    version: '2.0.1-SEC',
    type: 'SECURITY_PATCH',
    sha256: '7c9935a0b07694aa1ee4d10b4c5f3e657508ce67b2f34b0dac9efAC34105B853',
    signatureStatus: 'SIGNED',
    targetHardware: 'NXP FRDM-MCXN236',
    minimumBootloader: '1.0.0',
    status: 'DRAFT',
    createdAt: '2026-08-29T18:15:00Z',
    deploymentCount: 0,
    description: 'Hardened mbedTLS entropy pool and Ed25519 signature constant-time verification.',
    healthGatePasses: true,
    isBreakingDemo: false,
    fileSizeKb: 391,
    signedBy: 'Security-Response-Team (Ed25519)',
    changelog: ['Patched mbedTLS entropy', 'Constant-time crypto verification', 'Hardened CAN-FD driver'],
  },
];

const INITIAL_EVENTS: DeviceEvent[] = [
  {
    id: 'evt-1',
    deviceId: 'NXP-001',
    eventType: 'BOOT_COMPLETED',
    severity: 'INFO',
    message: 'NXP FRDM-MCXN236 booted successfully into Bank A (v1.0.0 SmartPass)',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'evt-2',
    deviceId: 'NXP-001',
    eventType: 'HEALTH_GATE_PASSED',
    severity: 'LOW',
    message: 'Hardware Health Gate 100% — RC522 RFID, 7-Segment, and LEDs active',
    timestamp: new Date(Date.now() - 90000).toISOString(),
  },
  {
    id: 'evt-3',
    deviceId: 'NXP-002',
    eventType: 'BANK_SWAP_CONFIRMED',
    severity: 'INFO',
    message: 'Device NXP-002 successfully confirmed active Bank B on v2.0.0 (MetroPay)',
    timestamp: new Date(Date.now() - 45000).toISOString(),
  },
  {
    id: 'evt-4',
    deviceId: 'NXP-004',
    eventType: 'FLASH_WRITE_PROGRESS',
    severity: 'INFO',
    message: 'Device NXP-004 writing candidate firmware chunks to Bank B (offset 0x00100000)',
    timestamp: new Date(Date.now() - 15000).toISOString(),
  },
];

const INITIAL_CAMPAIGNS: RolloutCampaign[] = [
  {
    id: 'camp-1',
    name: 'MetroPay v2.0.0 Concourse Rollout',
    firmwareId: 'fw-2',
    firmwareVersion: '2.0.0',
    targetGroup: 'Turnstile Terminals (Zone 1 & 2)',
    strategy: 'CANARY',
    status: 'IN_PROGRESS',
    currentStage: 2,
    totalStages: 4,
    targetCount: 5,
    completedCount: 2,
    failedCount: 0,
    safeModeCount: 0,
    failureThresholdPercent: 2.0,
    soakTimeSeconds: 300,
    createdAt: '2026-08-29T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'camp-2',
    name: 'SmartPass Baseline Fleetwide Provision',
    firmwareId: 'fw-1',
    firmwareVersion: '1.0.0',
    targetGroup: 'All Hardware Nodes',
    strategy: 'IMMEDIATE',
    status: 'COMPLETED',
    currentStage: 1,
    totalStages: 1,
    targetCount: 5,
    completedCount: 5,
    failedCount: 0,
    safeModeCount: 0,
    failureThresholdPercent: 5.0,
    soakTimeSeconds: 60,
    createdAt: '2026-08-20T08:00:00Z',
    updatedAt: '2026-08-20T09:15:00Z',
  },
];

const INITIAL_SECURITY_INCIDENTS: SecurityIncident[] = [
  {
    id: 'sec-1',
    deviceId: 'NXP-001',
    title: 'Signature Verification Rejection (Attack Lab)',
    attackVector: 'Cryptographic Signature Forgery (Invalid Ed25519)',
    severity: 'HIGH',
    status: 'MITIGATED',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: 'Candidate image rejected in pre-boot verification. Bank B checksum failed Ed25519 verification with Root Public Key.',
    mitigation: 'Image discarded before flash execution. Active Bank A preserved without downtime.',
    signatureStatus: 'INVALID',
    hashMismatch: true,
  },
  {
    id: 'sec-2',
    deviceId: 'NXP-004',
    title: 'Monotonic Anti-Rollback Gate Triggered',
    attackVector: 'Firmware Downgrade / Replay Attack (v0.8.0-VULN)',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    details: 'Attempt to flash candidate v0.8.0 blocked by hardware monotonic security counter (Rev 0x0004 required, candidate 0x0001).',
    mitigation: 'Bootloader rejected image update. Device remained in current version.',
    signatureStatus: 'SIGNED',
    hashMismatch: false,
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: new Date(Date.now() - 10000).toISOString(),
    actor: 'SecOps-Operator (secops@guardian.nxp)',
    action: 'OTA_DEPLOYMENT_DISPATCHED',
    category: 'DEPLOYMENT',
    target: 'NXP-004 (Kiosk-Dispenser-East)',
    status: 'SUCCESS',
    details: 'Dispatched MetroPay v2.0.0 signed binary to inactive Bank B.',
    hash: 'a9f4c3b2817d890e21a8f9c1b3d5e7a90184b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
  },
  {
    id: 'aud-2',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    actor: 'System Autonomous Guardian',
    action: 'HEALTH_GATE_EVALUATION',
    category: 'SYSTEM',
    target: 'NXP-001',
    status: 'SUCCESS',
    details: 'Hardware health check completed 98% score. Heartbeat stable.',
    hash: '3e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
  },
  {
    id: 'aud-3',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    actor: 'Release-Officer (firmware@guardian.nxp)',
    action: 'FIRMWARE_RELEASE_SIGNED',
    category: 'DEPLOYMENT',
    target: 'MetroPay Dynamic Route (v2.0.0)',
    status: 'SUCCESS',
    details: 'Signed binary with Ed25519 production private key in HSM.',
    hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  },
  {
    id: 'aud-4',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    actor: 'SecOps-Admin (admin@guardian.nxp)',
    action: 'SAFETY_POLICY_UPDATED',
    category: 'POLICY',
    target: 'Health Gate Minimum Health Score',
    status: 'SUCCESS',
    details: 'Set minimum health score threshold to 85%.',
    hash: '7c9935a0b07694aa1ee4d10b4c5f3e657508ce67b2f34b0dac9efac34105b853',
  },
];

const INITIAL_POLICIES: SafetyPolicy[] = [
  {
    id: 'pol-1',
    name: 'Dual-Bank Non-Destructive Update Enforcement',
    category: 'HEALTH_GATE',
    enabled: true,
    threshold: true,
    description: 'Active primary bank must never be erased or written during candidate download.',
  },
  {
    id: 'pol-2',
    name: 'Minimum Health Gate Score Post-Boot',
    category: 'HEALTH_GATE',
    enabled: true,
    threshold: 85,
    unit: '%',
    description: 'Candidate firmware must pass 85%+ sensor and heartbeat checks before confirmation.',
  },
  {
    id: 'pol-3',
    name: 'Autonomous Hardware Watchdog Timeout',
    category: 'HARDWARE',
    enabled: true,
    threshold: 8,
    unit: 'sec',
    description: 'If candidate fails to feed watchdog in 8 seconds, MCUboot triggers instant rollback.',
  },
  {
    id: 'pol-4',
    name: 'Mandatory Ed25519 Cryptographic Signature',
    category: 'SECURITY',
    enabled: true,
    threshold: 'Ed25519 / RSA-2048',
    description: 'Unsigned or invalid cryptographic signature binaries rejected before flash write.',
  },
  {
    id: 'pol-5',
    name: 'Monotonic Anti-Rollback Counter Enforcement',
    category: 'SECURITY',
    enabled: true,
    threshold: true,
    description: 'Prevents flashing older firmware versions containing known historical CVEs.',
  },
  {
    id: 'pol-6',
    name: 'Canary Rollout Failure Rate Abort Threshold',
    category: 'ROLLOUT',
    enabled: true,
    threshold: 2.0,
    unit: '%',
    description: 'Auto-abort rollout campaign and freeze updates if > 2% of fleet experiences rollback.',
  },
  {
    id: 'pol-7',
    name: 'Canary Stage Soak Time Window',
    category: 'ROLLOUT',
    enabled: true,
    threshold: 300,
    unit: 'sec',
    description: 'Minimum observation soak period in canary batch before expanding rollout.',
  },
];

const INITIAL_RECOVERY_PLANS: RecoveryPlan[] = [
  {
    id: 'rec-1',
    deviceId: 'NXP-001',
    tier: 'TIER_1_AUTO_SWAP',
    reason: 'Watchdog Timeout on Fault Injection Image v3.0.0-BROKEN',
    recommendedAction: 'Autonomous MCUboot swap to Golden Bank A (v1.0.0 SmartPass)',
    status: 'RESTORED',
    initiatedAt: new Date(Date.now() - 3600000).toISOString(),
    authorizedBy: 'Autonomous System Watchdog',
    progress: 100,
  },
];

const INITIAL_ATTACK_SCENARIOS: AttackScenario[] = [
  {
    id: 'atk-1',
    name: 'Cryptographic Signature Forgery Attack',
    description: 'Attacker uploads a tampered or counterfeit binary into Bank B without valid private key signature.',
    targetBank: 'B',
    vector: 'SIGNATURE_FORGERY',
    severity: 'HIGH',
    expectedOutcome: 'Bootloader validates signature against immutable Root Key in ROM. Check fails; candidate discarded before boot.',
    mitigationTime: '< 1.2 seconds',
    payloadPreview: 'PAYLOAD_SIGNATURE_HEADER: [INVALID_ED25519_KEY_0xDEADBEEF]',
  },
  {
    id: 'atk-2',
    name: 'Anti-Rollback / Downgrade Attack',
    description: 'Attacker attempts to flash an obsolete firmware v0.8.0 containing known vulnerable OpenSSL stack.',
    targetBank: 'B',
    vector: 'DOWNGRADE_ATTACK',
    severity: 'MEDIUM',
    expectedOutcome: 'Hardware Monotonic Counter detects version downgrade (Current: 0x0004 vs Injected: 0x0001). Image rejected.',
    mitigationTime: '< 0.8 seconds',
    payloadPreview: 'MONOTONIC_SECURITY_REV: 0x0001 (REQUIRED >= 0x0004) -> REJECTED',
  },
  {
    id: 'atk-3',
    name: 'Runtime Fault & Watchdog Starvation (Fault Injection)',
    description: 'Attacker deploys syntactically valid signed firmware that deadlocks the RFID reader and starves the hardware watchdog.',
    targetBank: 'B',
    vector: 'RUNTIME_FAULT',
    severity: 'CRITICAL',
    expectedOutcome: 'Health score collapses to 12%. Watchdog timer expires. MCUboot automatically rolls back to Golden Bank A and enters Safe Mode.',
    mitigationTime: '< 6.5 seconds',
    payloadPreview: 'FAULT_INJECTION: while(1) { disable_watchdog_pet(); deadlock_spi_mutex(); }',
  },
  {
    id: 'atk-4',
    name: 'Man-in-the-Middle (MitM) Packet Corruption',
    description: 'Attacker flips bits in OTA chunks transmitted over the network/UART serial stream.',
    targetBank: 'B',
    vector: 'MITM_CORRUPTION',
    severity: 'HIGH',
    expectedOutcome: 'SHA-256 chunk hash checksum mismatch. Corrupted block discarded; transfer aborted.',
    mitigationTime: '< 0.5 seconds',
    payloadPreview: 'CHUNK_048_CRC_ERROR: 0x7E4A != 0x9B12 (BITFLIP_DETECTED)',
  },
  {
    id: 'atk-5',
    name: 'Denial-of-Service / Telemetry Flood',
    description: 'Attacker floods device UART & MQTT command interface with malformed burst frames.',
    targetBank: 'A',
    vector: 'DOS_FLOOD',
    severity: 'MEDIUM',
    expectedOutcome: 'Rate-limiting filter throttles offending frames. Critical health telemetry preserved.',
    mitigationTime: '< 2.0 seconds',
    payloadPreview: 'BURST_RATE: 2,500 packets/sec -> HARDWARE_RATE_LIMITER_ENGAGED',
  },
];

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: INITIAL_DEVICES,
  fleetSummary: INITIAL_FLEET,
  firmware: INITIAL_FIRMWARE,
  events: INITIAL_EVENTS,
  campaigns: INITIAL_CAMPAIGNS,
  securityIncidents: INITIAL_SECURITY_INCIDENTS,
  auditLogs: INITIAL_AUDIT_LOGS,
  policies: INITIAL_POLICIES,
  recoveryPlans: INITIAL_RECOVERY_PLANS,
  attackScenarios: INITIAL_ATTACK_SCENARIOS,
  hardwareAdapterMode: 'SIMULATED',
  wsConnected: false,
  backendConnected: false,
  isLoading: false,

  setDevices: (devices) => {
    set({ devices });
    // Recalculate fleet summary
    const total = devices.length;
    const healthy = devices.filter((d) => d.health >= 80 && !d.safeMode && d.status === 'ONLINE').length;
    const updating = devices.filter((d) => d.status === 'UPDATING').length;
    const safeMode = devices.filter((d) => d.safeMode || d.status === 'SAFE_MODE').length;
    const failed = devices.filter((d) => d.status === 'FAILED').length;
    const offline = devices.filter((d) => d.status === 'OFFLINE').length;
    set((state) => ({
      fleetSummary: state.fleetSummary
        ? { ...state.fleetSummary, totalDevices: total, healthy, updating, safeMode, failed, offline }
        : state.fleetSummary,
    }));
  },

  updateDevice: (deviceId, update) =>
    set((state) => {
      const updatedDevices = state.devices.map((d) =>
        d.deviceId === deviceId ? { ...d, ...update } : d
      );
      const total = updatedDevices.length;
      const healthy = updatedDevices.filter((d) => d.health >= 80 && !d.safeMode && d.status === 'ONLINE').length;
      const updating = updatedDevices.filter((d) => d.status === 'UPDATING').length;
      const safeMode = updatedDevices.filter((d) => d.safeMode || d.status === 'SAFE_MODE').length;
      const failed = updatedDevices.filter((d) => d.status === 'FAILED').length;
      const offline = updatedDevices.filter((d) => d.status === 'OFFLINE').length;

      return {
        devices: updatedDevices,
        fleetSummary: state.fleetSummary
          ? { ...state.fleetSummary, totalDevices: total, healthy, updating, safeMode, failed, offline }
          : state.fleetSummary,
      };
    }),

  addDevice: (device) =>
    set((state) => ({
      devices: [...state.devices, device],
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Operator (admin@guardian.nxp)',
          action: 'DEVICE_REGISTERED',
          category: 'SYSTEM',
          target: `${device.deviceId} (${device.name})`,
          status: 'SUCCESS',
          details: `Registered new node targeting ${device.targetHardware}`,
          hash: Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
        },
        ...state.auditLogs,
      ],
    })),

  setFleetSummary: (fleetSummary) => set({ fleetSummary }),
  setFirmware: (firmware) => set({ firmware }),

  addFirmware: (release) =>
    set((state) => ({
      firmware: [release, ...state.firmware],
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Release-Officer (firmware@guardian.nxp)',
          action: 'FIRMWARE_UPLOADED',
          category: 'DEPLOYMENT',
          target: `${release.name} (v${release.version})`,
          status: 'SUCCESS',
          details: `Uploaded SHA-256 binary. Signature status: ${release.signatureStatus}`,
          hash: release.sha256,
        },
        ...state.auditLogs,
      ],
    })),

  updateFirmwareStatus: (id, status) =>
    set((state) => ({
      firmware: state.firmware.map((f) => (f.id === id ? { ...f, status } : f)),
    })),

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

  // Campaigns
  createCampaign: (campaign) =>
    set((state) => ({
      campaigns: [campaign, ...state.campaigns],
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'SecOps-Lead (admin@guardian.nxp)',
          action: 'ROLLOUT_CAMPAIGN_CREATED',
          category: 'DEPLOYMENT',
          target: campaign.name,
          status: 'SUCCESS',
          details: `Strategy: ${campaign.strategy}, Target: ${campaign.targetGroup}, Version: ${campaign.firmwareVersion}`,
          hash: Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
        },
        ...state.auditLogs,
      ],
    })),

  updateCampaignStatus: (id, status) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c)),
    })),

  advanceCampaignStage: (id) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) => {
        if (c.id !== id) return c;
        const nextStage = Math.min(c.totalStages, c.currentStage + 1);
        const completed = Math.min(c.targetCount, Math.round((nextStage / c.totalStages) * c.targetCount));
        const status = nextStage === c.totalStages ? 'COMPLETED' : 'IN_PROGRESS';
        return {
          ...c,
          currentStage: nextStage,
          completedCount: completed,
          status,
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  // Attack Lab Trigger Simulation
  triggerAttack: async (scenarioId, targetDeviceId) => {
    const { devices, attackScenarios } = get();
    const scenario = attackScenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;

    // Step 1: Ingestion
    get().addEvent({
      id: `evt-${Date.now()}`,
      deviceId: targetDeviceId,
      eventType: 'ATTACK_SIMULATION_STARTED',
      severity: scenario.severity,
      message: `[ATTACK LAB] Executing vector: ${scenario.name} on ${targetDeviceId}`,
      timestamp: new Date().toISOString(),
    });

    if (scenario.vector === 'SIGNATURE_FORGERY' || scenario.vector === 'DOWNGRADE_ATTACK') {
      // Signature / Downgrade check fails immediately
      setTimeout(() => {
        get().addEvent({
          id: `evt-${Date.now()}`,
          deviceId: targetDeviceId,
          eventType: 'CRYPTOGRAPHIC_VERIFICATION_FAILED',
          severity: 'HIGH',
          message: `Bootloader ROM rejected candidate image in Bank B: ${scenario.expectedOutcome}`,
          timestamp: new Date().toISOString(),
        });

        const incident: SecurityIncident = {
          id: `sec-${Date.now()}`,
          deviceId: targetDeviceId,
          title: `Blocked: ${scenario.name}`,
          attackVector: scenario.vector,
          severity: scenario.severity,
          status: 'MITIGATED',
          timestamp: new Date().toISOString(),
          details: `Simulated attack launched. Hardware crypto root-of-trust successfully rejected payload. Active bank unaffected.`,
          mitigation: 'Rejected prior to execution. Monotonic & signature check verified.',
          signatureStatus: 'INVALID',
          hashMismatch: true,
        };

        set((state) => ({
          securityIncidents: [incident, ...state.securityIncidents],
          auditLogs: [
            {
              id: `aud-${Date.now()}`,
              timestamp: new Date().toISOString(),
              actor: 'AttackLab-Simulator',
              action: 'ATTACK_BLOCKED_BY_GUARDIAN',
              category: 'SECURITY',
              target: targetDeviceId,
              status: 'SUCCESS',
              details: `Vector ${scenario.name} blocked in ${scenario.mitigationTime}`,
              hash: Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
            },
            ...state.auditLogs,
          ],
        }));
      }, 1200);
    } else if (scenario.vector === 'RUNTIME_FAULT') {
      // Fault injection: device boots, collapses health score, watchdog fires, rolls back to Safe Mode
      get().updateDevice(targetDeviceId, {
        status: 'UPDATING',
        updateState: 'HEALTH_CHECK',
        led: 'YELLOW',
        oledLines: ['RUNNING v3.0.0-BROKEN', 'Health Checking...'],
      });

      setTimeout(() => {
        get().updateDevice(targetDeviceId, {
          health: 12,
          led: 'RED',
          oledLines: ['!WATCHDOG TIMEOUT!', 'Health: 12% - Panic'],
          watchdogHealthy: false,
        });

        get().addEvent({
          id: `evt-${Date.now()}`,
          deviceId: targetDeviceId,
          eventType: 'HEALTH_GATE_FAILED',
          severity: 'CRITICAL',
          message: `Hardware watchdog starvation detected on ${targetDeviceId}! Autonomous rollback to Bank A triggered.`,
          timestamp: new Date().toISOString(),
        });
      }, 2000);

      setTimeout(() => {
        get().updateDevice(targetDeviceId, {
          status: 'SAFE_MODE',
          safeMode: true,
          activeBank: 'A',
          firmwareVersion: '1.0.0',
          led: 'RED',
          health: 75,
          updateState: 'SAFE_MODE',
          rollbackCount: 1,
          oledLines: ['!SAFE MODE LOCKDOWN!', 'Rollback to v1.0.0 A'],
        });

        const incident: SecurityIncident = {
          id: `sec-${Date.now()}`,
          deviceId: targetDeviceId,
          title: 'Autonomous Safe Mode Quarantine Entry',
          attackVector: 'Runtime Deadlock & Watchdog Starvation',
          severity: 'CRITICAL',
          status: 'OPEN',
          timestamp: new Date().toISOString(),
          details: 'Device rolled back to Golden Bank A after candidate firmware v3.0.0-BROKEN starved watchdog timer.',
          mitigation: 'Autonomous MCUboot bank swap executed. Device quarantined in Safe Mode pending operator review.',
          signatureStatus: 'SIGNED',
          hashMismatch: false,
        };

        const recPlan: RecoveryPlan = {
          id: `rec-${Date.now()}`,
          deviceId: targetDeviceId,
          tier: 'TIER_1_AUTO_SWAP',
          reason: 'Runtime Fault / Watchdog Timeout on candidate image',
          recommendedAction: 'Authorize Golden Image verification and Clear Safe Mode Quarantine',
          status: 'PENDING',
          initiatedAt: new Date().toISOString(),
          authorizedBy: 'SecOps Triage Required',
          progress: 50,
        };

        set((state) => ({
          securityIncidents: [incident, ...state.securityIncidents],
          recoveryPlans: [recPlan, ...state.recoveryPlans],
          auditLogs: [
            {
              id: `aud-${Date.now()}`,
              timestamp: new Date().toISOString(),
              actor: 'Autonomous-Watchdog',
              action: 'AUTONOMOUS_ROLLBACK_SAFE_MODE',
              category: 'SECURITY',
              target: targetDeviceId,
              status: 'WARNING',
              details: 'Device automatically swapped back to Bank A and entered Safe Mode lockdown.',
              hash: Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
            },
            ...state.auditLogs,
          ],
        }));
      }, 4000);
    } else {
      // MitM / DoS
      setTimeout(() => {
        get().addEvent({
          id: `evt-${Date.now()}`,
          deviceId: targetDeviceId,
          eventType: 'TRAFFIC_ANOMALY_MITIGATED',
          severity: 'HIGH',
          message: `Guardian rate limiter and CRC checksum engine throttled and mitigated ${scenario.name}.`,
          timestamp: new Date().toISOString(),
        });
      }, 1000);
    }
  },

  mitigateIncident: (id) =>
    set((state) => ({
      securityIncidents: state.securityIncidents.map((inc) =>
        inc.id === id ? { ...inc, status: 'RESOLVED' } : inc
      ),
    })),

  clearDeviceSafeMode: (deviceId) => {
    get().updateDevice(deviceId, {
      safeMode: false,
      status: 'ONLINE',
      health: 98,
      led: 'GREEN',
      updateState: 'IDLE',
      watchdogHealthy: true,
      oledLines: ['SmartPass v1.0.0', 'Tap Card (Healthy)'],
    });

    set((state) => ({
      securityIncidents: state.securityIncidents.map((inc) =>
        inc.deviceId === deviceId && inc.status === 'OPEN' ? { ...inc, status: 'RESOLVED' } : inc
      ),
      recoveryPlans: state.recoveryPlans.map((r) =>
        r.deviceId === deviceId && r.status === 'PENDING' ? { ...r, status: 'RESTORED', progress: 100 } : r
      ),
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'SecOps-Operator (secops@guardian.nxp)',
          action: 'SAFE_MODE_QUARANTINE_CLEARED',
          category: 'RECOVERY',
          target: deviceId,
          status: 'SUCCESS',
          details: 'Operator authorized clearance of Safe Mode. Restored device to active fleet operation.',
          hash: Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
        },
        ...state.auditLogs,
      ],
    }));
  },

  executeRecovery: async (deviceId, tier) => {
    get().addEvent({
      id: `evt-${Date.now()}`,
      deviceId,
      eventType: 'RECOVERY_PROCEDURE_INITIATED',
      severity: 'INFO',
      message: `Executing ${tier} recovery protocol on device ${deviceId}...`,
      timestamp: new Date().toISOString(),
    });

    get().updateDevice(deviceId, {
      status: 'RECOVERING',
      updateState: 'RECOVERING',
      led: 'YELLOW',
      oledLines: ['RECOVERY DISPATCH', `Executing ${tier}...`],
    });

    await new Promise((r) => setTimeout(r, 2000));

    get().clearDeviceSafeMode(deviceId);

    get().addEvent({
      id: `evt-${Date.now()}`,
      deviceId,
      eventType: 'RECOVERY_COMPLETED',
      severity: 'INFO',
      message: `Recovery successful on ${deviceId}. Baseline firmware verified and online.`,
      timestamp: new Date().toISOString(),
    });
  },

  updatePolicy: (id, enabled, threshold) =>
    set((state) => ({
      policies: state.policies.map((p) =>
        p.id === id
          ? {
              ...p,
              enabled,
              threshold: threshold !== undefined ? threshold : p.threshold,
            }
          : p
      ),
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'SecOps-Admin (admin@guardian.nxp)',
          action: 'POLICY_MODIFIED',
          category: 'POLICY',
          target: state.policies.find((p) => p.id === id)?.name || id,
          status: 'SUCCESS',
          details: `Policy state updated: enabled=${enabled}, threshold=${threshold}`,
          hash: Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
        },
        ...state.auditLogs,
      ],
    })),

  addAuditLog: (log) =>
    set((state) => ({
      auditLogs: [
        {
          ...log,
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          hash: Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
        },
        ...state.auditLogs,
      ],
    })),

  setHardwareAdapterMode: (mode) =>
    set((state) => ({
      hardwareAdapterMode: mode,
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Hardware-Engineer',
          action: 'ADAPTER_MODE_SWITCHED',
          category: 'SYSTEM',
          target: mode,
          status: 'SUCCESS',
          details: `Switched active hardware integration adapter to ${mode}`,
          hash: Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
        },
        ...state.auditLogs,
      ],
    })),

  resetDemo: () =>
    set({
      devices: INITIAL_DEVICES,
      fleetSummary: INITIAL_FLEET,
      firmware: INITIAL_FIRMWARE,
      events: INITIAL_EVENTS,
      campaigns: INITIAL_CAMPAIGNS,
      securityIncidents: INITIAL_SECURITY_INCIDENTS,
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Operator (demo-reset)',
          action: 'SYSTEM_DEMO_RESET',
          category: 'SYSTEM',
          target: 'All Nodes',
          status: 'SUCCESS',
          details: 'Reset system state to clean baseline demo parameters.',
          hash: Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
        },
        ...INITIAL_AUDIT_LOGS,
      ],
      recoveryPlans: INITIAL_RECOVERY_PLANS,
    }),
}));