# SECURE OTA GUARDIAN — Physical NXP FRDM-MCXN236 Hardware Integration Guide

> **Tagline:** "One bad firmware release should never become a fleet-wide disaster."

This document details the physical hardware integration boundary, MCUboot dual-bank flash memory map, LED demonstration patterns, and judge demonstration script for the **NXP FRDM-MCXN236** development board.

---

## 1. Physical Hardware Overview

- **Board:** NXP FRDM-MCXN236 Development Board
- **Microcontroller:** NXP MCX N236 (Dual-Bank Flash Memory Architecture)
- **On-Board Peripherals Used:**
  - **RGB LED:** Visual indicator for active firmware behavior & health status
  - **UART / USB-CDC:** Serial interface for CLI, telemetry, and debugging
  - **WWDT (Windowed Watchdog Timer):** Hardware watchdog for detecting post-boot crashes & hangs

---

## 2. Flash Memory Map & MCUboot A/B Dual-Bank Layout

The NXP MCX N236 microcontroller features dual-bank flash memory capability, allowing non-destructive firmware updates.

```
Address Range         Size     Partition Name              Purpose
─────────────────────────────────────────────────────────────────────────────────────────────
0x00000000 - 0x0001FFFF  128 KB   MCUboot Bootloader          Immutable bootloader & public key
0x00020000 - 0x0008FFFF  448 KB   Slot 0 (Bank A)             Primary / Active Known-Good Slot
0x00090000 - 0x000FFFFF  448 KB   Slot 1 (Bank B)             Secondary / Candidate Update Slot
0x00100000 - 0x0010FFFF   64 KB   Scratch / Swap Status       MCUboot trailer & rollback flag
```

### Dual-Bank Operating Rules

1. **Active Execution:** The microcontroller executes firmware out of **Slot 0 (Bank A)** or **Slot 1 (Bank B)**.
2. **Non-Destructive Transfer:** When a candidate firmware is downloaded, it is written exclusively to the **inactive slot**. The active known-good slot is NEVER overwritten during download.
3. **Self-Confirming Image Protocol:**
   - Candidate is marked `MCUBOOT_SWAP_TYPE_TEST` (temporary swap).
   - Bootloader swaps Bank A and Bank B on reboot.
   - Candidate boots and MUST invoke `boot_set_confirmed()` within the health gate window (e.g. 10 seconds).
   - If candidate crashes, hangs, or fails the health check, the hardware watchdog resets the board.
   - On reset, MCUboot detects unconfirmed candidate and automatically **swaps back to Bank A**.

---

## 3. Physical LED Demonstration Mapping

LED behavior provides an instant visual proof of which firmware version is active and whether the health gate succeeded or triggered a rollback.

| Version | Status | LED Color & Pattern | Period / Frequency | Visual Meaning |
|---|---|---|---|---|
| **Version A** | Known-Good Firmware | **Green LED** Slow Blink | `1000 ms` (0.5 Hz) | Currently deployed stable baseline firmware |
| **Version B** | Good Firmware Update | **Blue LED** Fast Blink | `200 ms` (2.5 Hz) | Successful OTA update (v2.0.0) confirmed healthy |
| **Version C** | Bad / Faulty Candidate | **Red LED** Rapid Strobe | `50 ms` (10 Hz) | Fault injection update (v3.0.0) triggering health failure |
| **Safe Mode** | Automatic Fallback | **Solid Red** Alert | Constant ON | Device safely rolled back to Bank A after failure |

---

## 4. Dual-Bank Firmware State Machine

```
                            ┌────────────────────────┐
                            │        IDLE            │
                            └───────────┬────────────┘
                                        │ New Image Received
                                        ▼
                            ┌────────────────────────┐
                            │ WRITTEN TO INACTIVE    │
                            │        BANK B          │
                            └───────────┬────────────┘
                                        │ Cryptographic Check
                                        ▼
                            ┌────────────────────────┐
                            │      VERIFYING         │
                            └─────┬────────────┬─────┘
                                  │            │
                           PASS   │            │ FAIL
                                  ▼            ▼
                     ┌──────────────────┐  ┌──────────────────┐
                     │ PENDING CANDIDATE│  │ REJECT CANDIDATE │
                     └────────┬─────────┘  └────────┬─────────┘
                              │ Boot              │
                              ▼                   ▼
                     ┌──────────────────┐  ┌──────────────────┐
                     │ BOOT CANDIDATE   │  │ CONTINUE BANK A  │
                     └────────┬─────────┘  └──────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │   HEALTH GATE    │
                     └────┬─────────┬───┘
                          │         │
                   PASS   │         │ FAIL (Crash / Health Failure)
                          ▼         ▼
             ┌──────────────────┐  ┌──────────────────┐
             │ CONFIRM BANK B   │  │ HARDWARE WATCHDOG│
             └──────────────────┘  └────────┬─────────┘
                                            │ Rollback
                                            ▼
                                   ┌──────────────────┐
                                   │ ROLLBACK BANK A  │
                                   │    (SAFE MODE)   │
                                   └──────────────────┘
```

---

## 5. Judge Demonstration Guide

### Demo 1: Baseline Device Operation (Bank A)
- **Action:** Turn on NXP FRDM-MCXN236 board.
- **Visual:** Green LED blinks slowly (`1000ms`).
- **OLED Display:** `SECURE OTA | FW: 1.0.0 | BANK: A | HEALTHY`
- **Explanation to Judges:** *"The board is running our known-good firmware v1.0.0 on Bank A."*

### Demo 2: Successful Firmware Update (Bank A → Bank B)
- **Action:** Click **"Deploy Update 1 (Stable v2.0.0)"** on the Command Center web dashboard.
- **Process:** Candidate binary is downloaded to inactive Bank B, verified via SHA-256 and RSA signature, and rebooted into Bank B.
- **Visual:** LED changes from **Slow Green Blink** → **Fast Blue Blink (`200ms`)**.
- **OLED Display:** `SECURE OTA | FW: 2.0.0 | BANK: B | HEALTHY`
- **Explanation to Judges:** *"The update passed health verification, so Bank B is confirmed as the new active firmware."*

### Demo 3: Fault Injection Update & Automatic Rollback (Bank B → Bank A)
- **Action:** Click **"Deploy Update 2 (Fault Injection v3.0.0)"** on the web dashboard.
- **Process:** Candidate binary passes signature check but contains a runtime failure. Health gate fails, dropping health score to 12%.
- **Visual:** LED rapidly strobes **Red (`50ms`)** during failure, then returns to **Bank A Green Blink** with **Solid Red Alert**.
- **OLED Display:** `SECURE OTA | !SAFE MODE! | FW: 1.0.0 | RECOVERY NEEDED`
- **Explanation to Judges:** *"The bad firmware crashed post-boot. MCUboot automatically caught the failure and rolled back to known-good Bank A. The device never bricked!"*
