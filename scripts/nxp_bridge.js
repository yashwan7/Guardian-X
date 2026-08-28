/**
 * SECURE OTA GUARDIAN — NXP FRDM-MCXN236 DIRECT SERIAL BRIDGE
 * Reads real-time UART / VCOM telemetry from /dev/cu.usbmodem* on macOS
 * and bridges data to Web Dashboard.
 */

const fs = require('fs');
const { execSync } = require('child_process');

function findNxpPort() {
  try {
    const ports = execSync('ls /dev/cu.usbmodem*', { encoding: 'utf-8' }).trim().split('\n');
    return ports[0] || null;
  } catch {
    return null;
  }
}

const portPath = findNxpPort();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  SECURE OTA GUARDIAN — NXP FRDM-MCXN236 SERIAL BRIDGE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (!portPath) {
  console.log('⚠️  No NXP USB VCOM port detected.');
  console.log('👉 Make sure the NXP FRDM-MCXN236 board is connected via USB.');
  process.exit(1);
}

console.log(`✅ Detected NXP Serial Port: ${portPath}`);
console.log('⚡ Baud Rate: 115200');
console.log('🔌 Listening for live hardware events & telemetry...\n');

// Configure serial port baud rate using stty on macOS
try {
  execSync(`stty -f ${portPath} 115200 cs8 -cstopb -parenb raw`);
} catch (e) {
  console.warn('Note: stty configuration:', e.message);
}

const readStream = fs.createReadStream(portPath, { encoding: 'utf8' });

readStream.on('data', (chunk) => {
  process.stdout.write(`[NXP LIVE] ${chunk}`);
});

readStream.on('error', (err) => {
  console.error('Serial stream error:', err.message);
});

process.on('SIGINT', () => {
  console.log('\n[BRIDGE] Closed.');
  process.exit(0);
});
