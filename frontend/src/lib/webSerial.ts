'use client';

import { useDeviceStore } from '@/stores/deviceStore';
import { buzzerAudio } from '@/components/ui/BuzzerAudio';

type LineHandler = (line: string) => void;

class WebSerialManager {
  private port: any = null;
  private reader: any = null;
  private writer: any = null;
  private textDecoder: TextDecoderStream | null = null;
  private readableStreamClosed: Promise<void> | null = null;
  private isReading = false;
  private listeners: Set<LineHandler> = new Set();
  private _connected = false;

  get isConnected(): boolean {
    return this._connected;
  }

  addListener(handler: LineHandler) {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  async connect(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    if (!('serial' in navigator)) {
      alert(
        'WebSerial is supported in Chrome, Edge, and Opera. Please use Google Chrome or Microsoft Edge to connect directly to the NXP Board!'
      );
      return false;
    }

    try {
      const nav = navigator as any;
      this.port = await nav.serial.requestPort();
      await this.port.open({ baudRate: 115200 });

      this._connected = true;
      useDeviceStore.getState().setBackendConnected(true);
      useDeviceStore.getState().addEvent({
        id: `evt-${Date.now()}`,
        deviceId: 'NXP-001',
        eventType: 'SERIAL_CONNECTED',
        severity: 'INFO',
        message: 'NXP FRDM-MCXN236 connected via WebSerial (115200 baud). Live 2-Way Sync Active.',
        timestamp: new Date().toISOString(),
      });

      buzzerAudio.playSuccessBeep(2400, 100);

      this.startReading();
      return true;
    } catch (err: any) {
      console.warn('WebSerial Connection error or cancelled:', err);
      this._connected = false;
      return false;
    }
  }

  async disconnect() {
    this.isReading = false;
    try {
      if (this.reader) {
        await this.reader.cancel();
      }
      if (this.readableStreamClosed) {
        await this.readableStreamClosed.catch(() => {});
      }
      if (this.port) {
        await this.port.close();
      }
    } catch (err) {
      console.warn('Error during serial disconnect:', err);
    } finally {
      this.port = null;
      this.reader = null;
      this.writer = null;
      this._connected = false;
      useDeviceStore.getState().setBackendConnected(false);
    }
  }

  private async startReading() {
    if (!this.port || !this.port.readable) return;
    this.isReading = true;

    try {
      this.textDecoder = new TextDecoderStream();
      this.readableStreamClosed = this.port.readable.pipeTo(this.textDecoder.writable);
      const stream = this.textDecoder.readable;
      this.reader = stream.getReader();

      let lineBuffer = '';

      while (this.isReading) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          lineBuffer += value;
          const lines = lineBuffer.split(/\r?\n/);
          lineBuffer = lines.pop() || ''; // Keep remainder

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) {
              this.handleIncomingLine(trimmed);
            }
          }
        }
      }
    } catch (err) {
      console.warn('WebSerial read loop error:', err);
    } finally {
      this._connected = false;
    }
  }

  private handleIncomingLine(line: string) {
    // Notify custom listeners
    this.listeners.forEach((handler) => handler(line));

    const store = useDeviceStore.getState();

    // 1. Try parsing JSON telemetry
    if (line.startsWith('{') && line.endsWith('}')) {
      try {
        const data = JSON.parse(line);
        if (data.telemetry || data.lcd1 || data.bank) {
          const activeBank = data.bank === 'B' ? 'B' : 'A';
          const fwVer = data.fw || (activeBank === 'B' ? '2.0.0' : '1.0.0');
          const isSafe = !!data.safe;
          const led = isSafe ? 'RED' : data.led || (activeBank === 'B' ? 'BLUE' : 'GREEN');
          const lcd1 = data.lcd1 || (activeBank === 'B' ? 'BANK B: v2.0.0' : 'GUARDIAN X OTA');
          const lcd2 = data.lcd2 || (activeBank === 'B' ? 'MetroPay Mode OK' : 'BANK A: v1.0.0');

          store.updateDevice('NXP-001', {
            activeBank,
            firmwareVersion: fwVer,
            led: led as any,
            safeMode: isSafe,
            health: isSafe ? 35 : 100,
            status: isSafe ? 'SAFE_MODE' : 'ONLINE',
            oledLines: [lcd1, lcd2],
            lastSeen: new Date().toISOString(),
          });
        }
        return;
      } catch (e) {
        // Fall through to text matching
      }
    }

    // 2. Formatted String Matching from NXP Firmware

    // RFID Card Tap
    if (line.includes('[RFID] Card Tapped!')) {
      const matchUid = line.match(/UID:\s*([0-9A-Fa-f:]+)/);
      const uid = matchUid ? matchUid[1] : '4A:3F:82:1C';
      const isBankB = store.devices[0]?.activeBank === 'B';

      buzzerAudio.playSuccessBeep(2600, 120);

      store.updateDevice('NXP-001', {
        oledLines: [isBankB ? 'PAID: Rs.25 (METRO)' : 'ACCESS: GRANTED', `UID ${uid}`],
        lastSeen: new Date().toISOString(),
      });

      store.addEvent({
        id: `evt-${Date.now()}`,
        deviceId: 'NXP-001',
        eventType: 'CARD_TAPPED',
        severity: 'INFO',
        message: `RFID Card Tapped on Physical Reader: UID=${uid} (${isBankB ? 'Fare Debited Rs.25' : 'Access Granted'})`,
        timestamp: new Date().toISOString(),
      });

      // Restore idle screen after 1.5s
      setTimeout(() => {
        const currentDev = useDeviceStore.getState().devices[0];
        if (currentDev) {
          const isB = currentDev.activeBank === 'B';
          store.updateDevice('NXP-001', {
            oledLines: ['GUARDIAN X OTA', isB ? 'BANK B: v2.0.0' : 'BANK A: v1.0.0'],
          });
        }
      }, 1500);
    }

    // Button 1 Bank Switch
    else if (line.includes('[BUTTON 1]') || line.includes('Switched Active Slot to FLASH BANK')) {
      const isBankB = line.includes('BANK B');
      buzzerAudio.playSuccessBeep(2400, 80);

      store.updateDevice('NXP-001', {
        activeBank: isBankB ? 'B' : 'A',
        firmwareVersion: isBankB ? '2.0.0' : '1.0.0',
        led: isBankB ? 'BLUE' : 'GREEN',
        safeMode: false,
        health: 100,
        status: 'ONLINE',
        oledLines: ['GUARDIAN X OTA', isBankB ? 'BANK B: v2.0.0' : 'BANK A: v1.0.0'],
        lastSeen: new Date().toISOString(),
      });

      store.addEvent({
        id: `evt-${Date.now()}`,
        deviceId: 'NXP-001',
        eventType: 'BANK_SWITCH',
        severity: 'INFO',
        message: `Physical Button Pressed: Switched Active Execution Slot to FLASH BANK ${isBankB ? 'B (v2.0.0 MetroPay)' : 'A (v1.0.0 Golden)'}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Button 2 Fault Injection & Rollback
    else if (line.includes('[BUTTON 2]') || line.includes('CRITICAL FAULT INJECTED')) {
      buzzerAudio.playAlarmBeep();

      store.updateDevice('NXP-001', {
        led: 'RED',
        safeMode: true,
        health: 35,
        status: 'SAFE_MODE',
        oledLines: ['FAULT INJECTED!', 'AUTONOMOUS ROLLBACK'],
        lastSeen: new Date().toISOString(),
      });

      store.addEvent({
        id: `evt-${Date.now()}`,
        deviceId: 'NXP-001',
        eventType: 'ROLLBACK_TRIGGERED',
        severity: 'HIGH',
        message: 'Physical Fault Injected: Watchdog timeout induced. Autonomous fallback to Bank A initiated.',
        timestamp: new Date().toISOString(),
      });

      // After rollback message from board
      setTimeout(() => {
        store.updateDevice('NXP-001', {
          activeBank: 'A',
          firmwareVersion: '1.0.0',
          led: 'GREEN',
          safeMode: false,
          health: 100,
          status: 'ONLINE',
          oledLines: ['GUARDIAN X OTA', 'BANK A: v1.0.0'],
        });
      }, 1800);
    }

    // Heartbeat Telemetry
    else if (line.includes('[GUARDIAN] Heartbeat')) {
      const isBankB = line.includes('Bank B');
      store.updateDevice('NXP-001', {
        activeBank: isBankB ? 'B' : 'A',
        firmwareVersion: isBankB ? '2.0.0' : '1.0.0',
        led: isBankB ? 'BLUE' : 'GREEN',
        status: 'ONLINE',
        lastSeen: new Date().toISOString(),
      });
    }
  }

  // --- Send Commands to NXP Hardware ---

  async sendRaw(command: string): Promise<boolean> {
    if (!this.port || !this.port.writable) {
      console.warn('Cannot send command: WebSerial port not open');
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const writer = this.port.writable.getWriter();
      await writer.write(encoder.encode(command + '\n'));
      writer.releaseLock();
      return true;
    } catch (err) {
      console.error('Failed to write command to WebSerial:', err);
      return false;
    }
  }

  async switchBank(bank: 'A' | 'B'): Promise<boolean> {
    return this.sendRaw(bank === 'B' ? 'CMD:BANK_B' : 'CMD:BANK_A');
  }

  async injectFault(): Promise<boolean> {
    return this.sendRaw('CMD:FAULT');
  }

  async triggerBeep(): Promise<boolean> {
    return this.sendRaw('CMD:BEEP');
  }

  async setLCD(line1: string, line2: string): Promise<boolean> {
    return this.sendRaw(`CMD:LCD:${line1},${line2}`);
  }

  async toggleRelay(enabled: boolean): Promise<boolean> {
    return this.sendRaw(enabled ? 'CMD:RELAY:1' : 'CMD:RELAY:0');
  }
}

export const webSerial = new WebSerialManager();
