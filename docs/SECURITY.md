# SECURE OTA GUARDIAN — Security Architecture & Threat Model

> **Tagline:** "One bad firmware release should never become a fleet-wide disaster."

This document details the security design, threat mitigation model, cryptographic integrity checks, attack simulation scenarios, and health-gated automatic recovery mechanisms of **Secure OTA Guardian**.

---

## 1. Security Architecture Core Principles

1. **Non-Destructive Dual-Bank Partitioning:** Active firmware slot (Bank A) is NEVER erased or overwritten during candidate download or verification.
2. **Cryptographic Authentication:** Every candidate image MUST contain a valid MCUboot header, matching SHA-256 hash, and verified RSA-2048 / Ed25519 digital signature.
3. **Health-Gated Activation:** Cryptographic verification is necessary but NOT sufficient. A candidate must pass an operational health check post-boot before becoming permanent.
4. **Hardware Watchdog Fallback:** If candidate firmware crashes, hangs, or fails post-boot health confirmation, the hardware watchdog forces a reset, and MCUboot automatically swaps back to known-good Bank A.
5. **Safe Operational Mode:** Devices rolling back after a failed update enter Safe Operational Mode, locking out further update attempts until cleared by security operators.

---

## 2. Threat Mitigation Matrix

| Threat Category | Attack Vector | Security Defense Mechanism | Outcome |
|---|---|---|---|
| **Malicious Firmware Upload** | Attacker uploads tampered firmware binary | SHA-256 digest & Ed25519 digital signature check in MCUboot | Image rejected prior to boot execution |
| **Downgrade Attack** | Attacker attempts to flash vulnerable older version | Minimum bootloader & version monotonic counter check | Downgrade blocked by bootloader |
| **Logic/Runtime Fault** | Firmware passes cryptographic check but has severe bug | Post-boot health gate check & watchdog timeout | Auto-rollback to Bank A in < 10 seconds |
| **Brick / Fleet Outage** | Bad update deployed to 10,000 devices simultaneously | Canary rollout + Health-gated rollback | 0 bricked devices across entire fleet |
| **Man-in-the-Middle (MitM)** | Attacker tampers binary during network transit | TLS 1.3 encryption + Payload SHA-256 integrity verification | Corrupted chunks discarded during transit |

---

## 3. Attack Lab Scenarios (Interactive Demonstration)

### Scenario 1: Signature Forgery Attack
- **Attacker Goal:** Flash unsigned or tampered binary into inactive Bank B.
- **Guardian Defense:** Bootloader extracts public key from immutable flash, computes RSA/Ed25519 signature over candidate image. Signature fails.
- **Result:** Candidate rejected (`OTA_STATE_REJECTED`), Bank A continues running without interruption.

### Scenario 2: Health Gate Failure (Fault Injection)
- **Attacker Goal:** Deploy syntactically valid signed firmware containing a fatal memory leak or sensor deadlock.
- **Guardian Defense:** Candidate boots in `UPDATE_PENDING` state. Health score drops to 12%. Watchdog fails to receive heartbeat.
- **Result:** Hardware reset triggers MCUboot swap to Bank A (`OTA_STATE_ROLLBACK`). Device enters Safe Mode. Security log emitted.
