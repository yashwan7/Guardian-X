// ==================================================
// SECURE OTA GUARDIAN — SimulatedDeviceAdapter
// ==================================================
// Simulates the NXP FRDM-MCXN236 device for development.
// Follows the EXACT same state machine as the real firmware.
//
// LABEL: SIMULATED — not real NXP hardware.
// Replace with NXPDeviceAdapter for physical device communication.
// ==================================================

import axios from 'axios';
import type {
  DeviceAdapter,
  DeviceTelemetry,
  DeviceStatus,
  UpdateOptions,
  UpdateState,
} from './DeviceAdapter';

interface InternalState {
  deviceId: string;
  firmwareVersion: string;
  activeBank: 'A' | 'B';
  bankAFirmware: string;
  bankBFirmware: string | null;
  health: number;
  led: 'GREEN' | 'YELLOW' | 'BLUE' | 'RED' | 'OFF';
  oledLines: [string, string, string, string];
  pirMotion: boolean;
  radarDistance: number;
  safeMode: boolean;
  watchdogHealthy: boolean;
  heartbeat: boolean;
  uptime: number;
  updateState: UpdateState;
  status: 'ONLINE' | 'OFFLINE' | 'UPDATING' | 'FAILED' | 'SAFE_MODE' | 'RECOVERING';
  rollbackCount: number;
  updateInProgress: boolean;
}

/**
 * SimulatedDeviceAdapter
 *
 * Implements DeviceAdapter for local development.
 * Reports telemetry to the backend REST API so it can broadcast via WebSocket.
 *
 * NXP Integration Note:
 * Replace this class with NXPDeviceAdapter that communicates via:
 * - MQTT broker (mosquitto) for command/telemetry
 * - Configures UART serial if direct connection
 */
export class SimulatedDeviceAdapter implements DeviceAdapter {
  private states: Map<string, InternalState> = new Map();
  private telemetryIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private readonly backendUrl: string;

  constructor(backendUrl: string = 'http://localhost:8080') {
    this.backendUrl = backendUrl;
  }

  async connect(deviceId: string): Promise<void> {
    console.log(`[SIMULATOR] Connecting device ${deviceId}`);
    if (!this.states.has(deviceId)) {
      this.states.set(deviceId, this.createDefaultState(deviceId));
    }
    const state = this.states.get(deviceId)!;
    state.status = 'ONLINE';
    state.heartbeat = true;
    await this.reportTelemetry(state);
    console.log(`[SIMULATOR] Device ${deviceId} connected and online`);
  }

  async disconnect(deviceId: string): Promise<void> {
    const state = this.states.get(deviceId);
    if (state) {
      state.status = 'OFFLINE';
      state.heartbeat = false;
      this.stopTelemetryStream(deviceId);
    }
  }

  async getStatus(deviceId: string): Promise<DeviceStatus> {
    const state = this.getState(deviceId);
    return {
      deviceId,
      connected: state.status !== 'OFFLINE',
      status: state.status,
      firmwareVersion: state.firmwareVersion,
      activeBank: state.activeBank,
      updateState: state.updateState,
    };
  }

  async getTelemetry(deviceId: string): Promise<DeviceTelemetry> {
    const state = this.getState(deviceId);
    return this.buildTelemetry(state);
  }

  async sendFirmware(deviceId: string, options: UpdateOptions): Promise<void> {
    console.log(`[SIMULATOR] Firmware ${options.firmwareId} queued for ${deviceId}`);
    // In real NXP: this would transfer the binary over UART/MQTT
    // Simulation: no-op, firmware is loaded during startUpdate
  }

  async startUpdate(deviceId: string, options: UpdateOptions): Promise<void> {
    const state = this.getState(deviceId);
    if (state.updateInProgress) {
      console.warn(`[SIMULATOR] Update already in progress for ${deviceId}`);
      return;
    }

    state.updateInProgress = true;
    const previousFirmware = state.firmwareVersion;
    const previousBank = state.activeBank;
    const inactiveBank: 'A' | 'B' = state.activeBank === 'A' ? 'B' : 'A';
    const targetVersion = options.targetVersion;

    console.log(`[SIMULATOR] Starting OTA on ${deviceId} — v${targetVersion} → bank ${inactiveBank} — healthGatePasses=${options.healthGatePasses}`);

    // Execute state machine asynchronously
    this.runStateMachine(state, targetVersion, inactiveBank, previousFirmware, previousBank, options.healthGatePasses)
      .finally(() => {
        state.updateInProgress = false;
      });
  }

  async getHealth(deviceId: string): Promise<number> {
    return this.getState(deviceId).health;
  }

  async reboot(deviceId: string): Promise<void> {
    const state = this.getState(deviceId);
    console.log(`[SIMULATOR] Rebooting device ${deviceId}`);
    state.updateState = 'REBOOTING';
    state.led = 'YELLOW';
    state.oledLines = ['SECURE OTA', 'REBOOTING...', state.firmwareVersion, 'PLEASE WAIT'];
    await this.reportTelemetry(state);
    await sleep(3000);
    state.updateState = 'IDLE';
    state.led = 'GREEN';
    state.oledLines = ['SECURE OTA', `FW: ${state.firmwareVersion}`, `BANK: ${state.activeBank}`, 'HEALTHY'];
    await this.reportTelemetry(state);
  }

  async requestRecovery(deviceId: string): Promise<void> {
    const state = this.getState(deviceId);
    state.updateState = 'RECOVERY_PENDING';
    state.oledLines[3] = 'RECOVERY PEND';
    await this.reportTelemetry(state);
    console.log(`[SIMULATOR] Recovery requested for ${deviceId}`);
  }

  isConnected(deviceId: string): boolean {
    const state = this.states.get(deviceId);
    return !!state && state.status !== 'OFFLINE';
  }

  startTelemetryStream(
    deviceId: string,
    handler: (telemetry: DeviceTelemetry) => void,
    intervalMs: number = 2000
  ): void {
    this.stopTelemetryStream(deviceId);
    const interval = setInterval(async () => {
      const state = this.states.get(deviceId);
      if (!state) return;

      // Simulate live sensors
      state.uptime += intervalMs / 1000;
      state.pirMotion = Math.random() < 0.15;
      state.radarDistance = Math.round((0.5 + Math.random() * 3.5) * 100) / 100;
      state.heartbeat = state.status !== 'OFFLINE';

      const telemetry = this.buildTelemetry(state);
      handler(telemetry);
      await this.reportTelemetry(state);
    }, intervalMs);

    this.telemetryIntervals.set(deviceId, interval);
    console.log(`[SIMULATOR] Telemetry stream started for ${deviceId} (${intervalMs}ms)`);
  }

  stopTelemetryStream(deviceId: string): void {
    const interval = this.telemetryIntervals.get(deviceId);
    if (interval) {
      clearInterval(interval);
      this.telemetryIntervals.delete(deviceId);
    }
  }

  // ── State Machine ──────────────────────────────────────────────────────────

  private async runStateMachine(
    state: InternalState,
    targetVersion: string,
    inactiveBank: 'A' | 'B',
    previousFirmware: string,
    previousBank: 'A' | 'B',
    healthGatePasses: boolean
  ): Promise<void> {
    try {
      // UPDATE_PENDING
      await this.transition(state, 'UPDATE_PENDING', 'UPDATING', 'YELLOW',
        ['SECURE OTA', 'UPDATE PENDING', `v${targetVersion}`, 'PENDING...']);

      await sleep(2000);

      // DOWNLOADING
      await this.transition(state, 'DOWNLOADING', 'UPDATING', 'YELLOW',
        ['SECURE OTA', 'DOWNLOADING...', `v${targetVersion}`, '0%']);

      await sleep(3000);

      // VERIFYING
      await this.transition(state, 'VERIFYING', 'UPDATING', 'BLUE',
        ['SECURE OTA', 'VERIFYING...', 'SHA-256 OK', 'SIG: VALID']);

      await sleep(2000);

      // INSTALLING (write to inactive bank)
      if (inactiveBank === 'A') state.bankAFirmware = targetVersion;
      else state.bankBFirmware = targetVersion;

      await this.transition(state, 'INSTALLING', 'UPDATING', 'YELLOW',
        ['SECURE OTA', 'INSTALLING...', `BANK ${inactiveBank}`, 'WRITING...']);

      await sleep(2000);

      // REBOOTING
      await this.transition(state, 'REBOOTING', 'UPDATING', 'YELLOW',
        ['SECURE OTA', 'REBOOTING...', `BANK ${inactiveBank}`, 'PLEASE WAIT']);

      await sleep(3000);

      // Switch to new bank
      state.firmwareVersion = targetVersion;
      state.activeBank = inactiveBank;

      // HEALTH_CHECK
      await this.transition(state, 'HEALTH_CHECK', 'UPDATING', 'BLUE',
        ['SECURE OTA', 'HEALTH CHECK', `FW: ${targetVersion}`, 'CHECKING...']);

      await sleep(4000);

      if (healthGatePasses) {
        // ── HAPPY PATH: CONFIRMED ──
        state.health = 98;
        await this.transition(state, 'CONFIRMED', 'ONLINE', 'GREEN',
          ['SECURE OTA', `FW: ${targetVersion}`, `BANK: ${inactiveBank}`, 'HEALTHY']);
        console.log(`[SIMULATOR] ✓ CONFIRMED — v${targetVersion} on bank ${inactiveBank}`);

      } else {
        // ── FAILURE PATH: HEALTH GATE FAILS ──
        state.health = 12;
        console.error(`[SIMULATOR] ✗ HEALTH GATE FAILED — v${targetVersion} health=${state.health}%`);

        // FAILED
        await this.transition(state, 'FAILED', 'FAILED', 'RED',
          ['SECURE OTA', 'HEALTH FAILED', `FW: ${targetVersion}`, 'CRITICAL']);

        await sleep(2000);

        // ROLLBACK
        state.rollbackCount++;
        state.activeBank = previousBank;
        state.firmwareVersion = previousFirmware;
        state.health = 72;
        if (previousBank === 'A') state.bankAFirmware = previousFirmware;
        else state.bankBFirmware = previousFirmware;

        await this.transition(state, 'ROLLBACK', 'UPDATING', 'RED',
          ['SECURE OTA', 'ROLLBACK!', `FW: ${previousFirmware}`, `BANK: ${previousBank}`]);

        await sleep(2000);

        // SAFE_MODE
        state.safeMode = true;
        state.watchdogHealthy = false;
        state.health = 35;

        await this.transition(state, 'SAFE_MODE', 'SAFE_MODE', 'RED',
          ['SECURE OTA', '!SAFE MODE!', `FW: ${previousFirmware}`, 'RECOVERY NEEDED']);

        console.error(`[SIMULATOR] ⚠ Device ${state.deviceId} entered SAFE MODE`);
      }
    } catch (err) {
      console.error(`[SIMULATOR] State machine error for ${state.deviceId}:`, err);
    }
  }

  private async transition(
    state: InternalState,
    updateState: UpdateState,
    status: InternalState['status'],
    led: InternalState['led'],
    oledLines: [string, string, string, string]
  ): Promise<void> {
    state.updateState = updateState;
    state.status = status;
    state.led = led;
    state.oledLines = oledLines;
    await this.reportTelemetry(state);
    console.log(`[SIMULATOR] [${state.deviceId}] → ${updateState}`);
  }

  // ── Telemetry Reporting ────────────────────────────────────────────────────

  private async reportTelemetry(state: InternalState): Promise<void> {
    const telemetry = this.buildTelemetry(state);
    try {
      await axios.post(`${this.backendUrl}/api/telemetry`, telemetry, {
        timeout: 3000,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // Backend may not be running yet — log silently
    }
  }

  private buildTelemetry(state: InternalState): DeviceTelemetry {
    return {
      deviceId: state.deviceId,
      timestamp: new Date().toISOString(),
      firmwareVersion: state.firmwareVersion,
      activeBank: state.activeBank,
      health: state.health,
      led: state.led,
      pirMotion: state.pirMotion,
      radarDistance: state.radarDistance,
      safeMode: state.safeMode,
      watchdogHealthy: state.watchdogHealthy,
      heartbeat: state.heartbeat,
      uptime: state.uptime,
      updateState: state.updateState,
      oledLines: [...state.oledLines],
    };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private getState(deviceId: string): InternalState {
    const state = this.states.get(deviceId);
    if (!state) throw new Error(`Device ${deviceId} not connected`);
    return state;
  }

  private createDefaultState(deviceId: string): InternalState {
    return {
      deviceId,
      firmwareVersion: '1.0.0',
      activeBank: 'A',
      bankAFirmware: '1.0.0',
      bankBFirmware: null,
      health: 98,
      led: 'GREEN',
      oledLines: ['SECURE OTA', 'FW: 1.0.0', 'BANK: A', 'HEALTHY'],
      pirMotion: false,
      radarDistance: 0.0,
      safeMode: false,
      watchdogHealthy: true,
      heartbeat: true,
      uptime: 0,
      updateState: 'IDLE',
      status: 'ONLINE',
      rollbackCount: 0,
      updateInProgress: false,
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
