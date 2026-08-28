#!/bin/bash
set -e

WORKSPACE_DIR="/Users/yashwanth/Documents/MCUXpressoIDE_25.6.136/workspace"
APP_DIR="$WORKSPACE_DIR/frdmmcxn236_ota_mcuboot_basic"
MCUBOOT_DIR="$WORKSPACE_DIR/frdmmcxn236_mcuboot_opensource"
TOOLCHAIN_BIN="/Applications/MCUXpressoIDE_25.6.136/ide/plugins/com.nxp.mcuxpresso.tools.macosx_25.6.0.202501151204/tools/bin"
IMGTOOL="/Users/yashwanth/Library/Python/3.9/bin/imgtool"
LINKSERVER="/Applications/LinkServer_25.6.131/LinkServer"

export PATH="$TOOLCHAIN_BIN:$PATH"

echo "=== 1. Building MCUXpresso Application ==="
cd "$APP_DIR/Debug"
make clean
make all

echo "=== 2. Creating Raw Binary ==="
arm-none-eabi-objcopy -O binary "$APP_DIR/Debug/frdmmcxn236_ota_mcuboot_basic.axf" "$APP_DIR/Debug/frdmmcxn236_ota_mcuboot_basic.bin"

echo "=== 3. Cryptographically Signing with ECDSA-P256 & Confirming Slot ==="
"$IMGTOOL" sign \
  --key "$MCUBOOT_DIR/bootutil/nxp_port/keys/sign-ecdsa-p256-priv.pem" \
  --align 16 \
  --header-size 0x400 \
  --pad-header \
  --slot-size 0x80000 \
  --pad \
  --confirm \
  --version "1.0.0" \
  "$APP_DIR/Debug/frdmmcxn236_ota_mcuboot_basic.bin" \
  "$APP_DIR/Debug/ota_mcuboot_basic.SIGNED.PADDED.bin"

echo "=== 4. Flashing to NXP FRDM-MCXN236 at 0x00000000 ==="
killall -9 redlinkserv crt_emu_cm_redlink 2>/dev/null || true
sleep 1

"$LINKSERVER" flash MCXN236:FRDM-MCXN236 load "$APP_DIR/Debug/ota_mcuboot_basic.SIGNED.PADDED.bin:0x00000000"

echo "=== 5. SUCCESS! Firmware is Live on NXP Hardware ==="
