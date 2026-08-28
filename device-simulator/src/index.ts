// ==================================================
// SECURE OTA GUARDIAN — Device Simulator Entry Point
// ==================================================
// This standalone simulator can run alongside the backend to provide
// realistic device behavior for development and demos.
//
// LABEL: SIMULATED — not real NXP hardware.
// ==================================================

import 'dotenv/config';
import { SimulatedDeviceAdapter } from './adapters/SimulatedDeviceAdapter';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const DEVICE_ID = process.env.DEVICE_ID || 'NXP-001';
const INTERVAL_MS = parseInt(process.env.SIMULATOR_INTERVAL_MS || '2000', 10);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  SECURE OTA GUARDIAN — Device Simulator');
console.log('  [SIMULATED] NXP FRDM-MCXN236');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  Backend URL : ${BACKEND_URL}`);
console.log(`  Device ID   : ${DEVICE_ID}`);
console.log(`  Interval    : ${INTERVAL_MS}ms`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const adapter = new SimulatedDeviceAdapter(BACKEND_URL);

async function main() {
  try {
    // Connect simulated device
    await adapter.connect(DEVICE_ID);
    console.log(`[SIMULATOR] Device ${DEVICE_ID} is now ONLINE`);

    // Start telemetry streaming
    adapter.startTelemetryStream(
      DEVICE_ID,
      (telemetry) => {
        console.log(
          `[TELEMETRY] ${telemetry.deviceId} | ` +
          `FW:${telemetry.firmwareVersion} | ` +
          `BANK:${telemetry.activeBank} | ` +
          `HEALTH:${telemetry.health}% | ` +
          `LED:${telemetry.led} | ` +
          `STATE:${telemetry.updateState} | ` +
          `PIR:${telemetry.pirMotion} | ` +
          `RADAR:${telemetry.radarDistance}m`
        );
      },
      INTERVAL_MS
    );

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n[SIMULATOR] Shutting down...');
      adapter.stopTelemetryStream(DEVICE_ID);
      await adapter.disconnect(DEVICE_ID);
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      adapter.stopTelemetryStream(DEVICE_ID);
      await adapter.disconnect(DEVICE_ID);
      process.exit(0);
    });

    console.log('\n[SIMULATOR] Running. Press Ctrl+C to stop.\n');

  } catch (err) {
    console.error('[SIMULATOR] Fatal error:', err);
    process.exit(1);
  }
}

main();
