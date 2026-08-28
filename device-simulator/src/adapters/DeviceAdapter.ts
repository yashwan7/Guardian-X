// ==================================================
// SECURE OTA GUARDIAN — DeviceAdapter Interface
// ==================================================
// This interface defines the clean integration boundary between the
// platform backend and the physical NXP FRDM-MCXN236 device.
//
// In development: SimulatedDeviceAdapter implements this interface.
// In production:  NXPDeviceAdapter will implement this interface via MQTT.
//
// HARDWARE NOTE: NXP-specific code must NEVER leak outside this interface.
// ==================================================

export interface DeviceTelemetry {
  deviceId: string;
  timestamp: string;
  firmwareVersion: string;
  activeBank: 'A' | 'B';
  health: number;
  led: 'GREEN' | 'YELLOW' | 'BLUE' | 'RED' | 'OFF';
  pirMotion: boolean;
  radarDistance: number;
  safeMode: boolean;
  watchdogHealthy: boolean;
  heartbeat: boolean;
  uptime: number;
  updateState: UpdateState;
  oledLines: string[];
}

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

export interface DeviceStatus {
  deviceId: string;
  connected: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'UPDATING' | 'FAILED' | 'SAFE_MODE' | 'RECOVERING';
  firmwareVersion: string;
  activeBank: 'A' | 'B';
  updateState: UpdateState;
}

export interface UpdateOptions {
  firmwareId: string;
  targetVersion: string;
  healthGatePasses: boolean; // Expected health gate result
  targetBank: 'A' | 'B';
}

/**
 * DeviceAdapter — Clean integration boundary for NXP device communication.
 *
 * All device interaction must go through this interface.
 * The backend DeviceAdapter follows the same contract.
 */
export interface DeviceAdapter {
  /**
   * Establish connection to the device.
   * For NXP: open MQTT session or serial port.
   * For simulated: initialize in-memory state.
   */
  connect(deviceId: string): Promise<void>;

  /**
   * Gracefully disconnect from the device.
   */
  disconnect(deviceId: string): Promise<void>;

  /**
   * Get current device status snapshot.
   */
  getStatus(deviceId: string): Promise<DeviceStatus>;

  /**
   * Get real-time telemetry reading.
   */
  getTelemetry(deviceId: string): Promise<DeviceTelemetry>;

  /**
   * Transfer firmware binary to the device.
   * For NXP: transfer via UART/MQTT/XMODEM.
   * For simulated: register the firmware for the state machine.
   */
  sendFirmware(deviceId: string, options: UpdateOptions): Promise<void>;

  /**
   * Initiate the OTA update process.
   * Triggers the full state machine:
   * IDLE → UPDATE_PENDING → DOWNLOADING → VERIFYING → INSTALLING →
   * REBOOTING → HEALTH_CHECK → (CONFIRMED | FAILED → ROLLBACK → SAFE_MODE)
   */
  startUpdate(deviceId: string, options: UpdateOptions): Promise<void>;

  /**
   * Get current device health score (0-100).
   */
  getHealth(deviceId: string): Promise<number>;

  /**
   * Reboot the device.
   */
  reboot(deviceId: string): Promise<void>;

  /**
   * Request recovery from SAFE_MODE.
   * Transitions to RECOVERY_PENDING state.
   */
  requestRecovery(deviceId: string): Promise<void>;

  /**
   * Check if device is currently connected.
   */
  isConnected(deviceId: string): boolean;

  /**
   * Start streaming telemetry.
   * Calls the handler on each telemetry interval.
   */
  startTelemetryStream(
    deviceId: string,
    handler: (telemetry: DeviceTelemetry) => void,
    intervalMs?: number
  ): void;

  /**
   * Stop telemetry streaming.
   */
  stopTelemetryStream(deviceId: string): void;
}
