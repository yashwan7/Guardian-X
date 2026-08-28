# SECURE OTA GUARDIAN — Judge Demonstration Guide

> **Tagline:** "One bad firmware release should never become a fleet-wide disaster."

This presentation guide provides a step-by-step walkthrough for presenting **Secure OTA Guardian** to hackathon judges using both the physical NXP FRDM-MCXN236 board and the cybersecurity command center web UI.

---

## Pre-Demo Checklist

1. **Physical Hardware:** Connect NXP FRDM-MCXN236 board via USB.
2. **Backend API:** Verify Spring Boot backend is running on `http://localhost:8080`.
3. **Frontend UI:** Open Command Center at `http://localhost:3000/dashboard`.
4. **Device Simulator:** Verify `NXP-001` device is online with GREEN LED and v1.0.0.

---

## 3-Step Demonstration Walkthrough

### 📍 DEMO 1: Baseline Known-Good Firmware (Bank A)
- **Goal:** Show normal operation of deployed fleet.
- **Action:** Point judges to the **Device Twin** on the web dashboard and the physical NXP board LED.
- **Key Visuals:**
  - **LED:** Slow Green Blink (`1000ms`)
  - **OLED Display:** `SECURE OTA | FW: 1.0.0 | BANK: A | HEALTHY`
  - **Health Score:** `98%`
- **Script:** *"Judges, here is our IoT device running stable firmware v1.0.0 on Bank A. Notice the slow green LED and healthy telemetry status."*

---

### 📍 DEMO 2: Successful Firmware Update (Bank A → Bank B)
- **Goal:** Demonstrate non-destructive OTA deployment of a valid update.
- **Action:** Click **"Deploy Update 1 (Stable v2.0.0)"** in the Firmware Deployment card.
- **Live Sequence:**
  1. `DOWNLOADING` → Candidate v2.0.0 written to inactive Bank B.
  2. `VERIFYING` → SHA-256 and Ed25519 digital signature verified.
  3. `REBOOTING` → Device reboots into Bank B.
  4. `HEALTH_CHECK` → Post-boot health gate passes.
  5. `CONFIRMED` → Bank B becomes active primary slot.
- **Key Visuals:**
  - **LED:** Changes to Fast Blue Blink (`200ms`)
  - **OLED Display:** `SECURE OTA | FW: 2.0.0 | BANK: B | HEALTHY`
- **Script:** *"Notice how candidate v2.0.0 was written to Bank B without disturbing Bank A. Once it passed health checks, Bank B was confirmed and the LED switched to fast blue blink."*

---

### 📍 DEMO 3: Faulty Update & Automatic Rollback (Bank B → Bank A)
- **Goal:** Show that a bad firmware release NEVER bricks the device or causes fleet disaster.
- **Action:** Click **"Deploy Update 2 (Fault Injection v3.0.0)"**.
- **Live Sequence:**
  1. Candidate passes initial signature check and is written to Bank A (inactive slot).
  2. Candidate boots, but health gate fails (health score drops to 12%).
  3. Watchdog timeout fires, triggering MCUboot automatic rollback.
  4. MCUboot swaps back to Bank B known-good firmware v2.0.0.
  5. Device enters **Safe Mode** with security incident logged.
- **Key Visuals:**
  - **LED:** Rapid Red Strobe → Returns to Fast Blue Blink with Solid Red Alert.
  - **OLED Display:** `SECURE OTA | !SAFE MODE! | FW: 2.0.0 | RECOVERY NEEDED`
- **Script:** *"Even though Update 2 was digitally signed, it contained a critical runtime fault. Guardian caught the health failure in less than 5 seconds, triggered an automatic rollback, and returned to the known-good firmware. The device is safe, operational, and ready for recovery!"*
