# SECURE OTA GUARDIAN — System Architecture Specification

> **Tagline:** "One bad firmware release should never become a fleet-wide disaster."

This document provides a comprehensive technical overview of the architecture, monorepo design, clean hardware integration boundary, dual-bank firmware state machine, backend APIs, and real-time WebSocket messaging layer for **Secure OTA Guardian**.

---

## 1. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COMMAND CENTER WEB UI                                 │
│                      Next.js 14 + Tailwind CSS + Zustand                        │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │ REST API (HTTPS) + WebSocket (STOMP/SockJS)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CONTROL PLANE BACKEND                                │
│                   Spring Boot 3.2 + Java 21 + PostgreSQL 16                     │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                            DeviceAdapter Boundary                         │  │
│  └─────────────────────────────────────┬─────────────────────────────────────┘  │
└────────────────────────────────────────┼────────────────────────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│       SimulatedDeviceAdapter         │  │           NXPDeviceAdapter           │
│   Node.js / Java Simulator (Dev)     │  │       Hardware Transport (Prod)      │
└──────────────────┬───────────────────┘  └──────────────────┬───────────────────┘
                   │                                         │ MQTT / Serial
                   ▼                                         ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│      Simulated State Machine         │  │       NXP FRDM-MCXN236 Board         │
│     In-Memory Twin Telemetry         │  │     Dual-Bank MCUboot C Firmware    │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

---

## 2. Monorepo Component Structure

```
secure-ota-guardian/
├── frontend/                     Next.js 14 App Router dashboard & Google OAuth
├── backend/                      Spring Boot 3.2 REST API & STOMP WebSocket server
├── device-simulator/             Node.js / TypeScript device adapter simulator
├── nxp-firmware/                 Physical NXP FRDM-MCXN236 C/C++ MCUXpresso source
├── shared/                       Shared TypeScript type definitions
├── docs/                         System architecture & hardware guides
├── docker-compose.yml            PostgreSQL 16 & pgAdmin services
└── package.json                  npm workspace configuration
```

---

## 3. Clean Hardware Integration Boundary (`DeviceAdapter`)

To ensure clean decoupling between the cloud platform and physical hardware, all device interaction MUST implement the `DeviceAdapter` interface.

```typescript
export interface DeviceAdapter {
  connect(deviceId: string): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
  getStatus(deviceId: string): Promise<DeviceStatus>;
  getTelemetry(deviceId: string): Promise<DeviceTelemetry>;
  sendFirmware(deviceId: string, options: UpdateOptions): Promise<void>;
  startUpdate(deviceId: string, options: UpdateOptions): Promise<void>;
  requestRecovery(deviceId: string): Promise<void>;
}
```

### Implementations

1. **`SimulatedDeviceAdapter` (Development Mode):**
   - Runs in-memory state machine reproducing MCUboot logic.
   - Generates simulated live sensor telemetry (PIR motion, radar distance, health score).
   - Emits real-time STOMP WebSocket telemetry messages to `/topic/telemetry`.

2. **`NXPDeviceAdapter` (Production Mode):**
   - Connects to Mosquitto MQTT broker.
   - Sends firmwares over MQTT topics: `guardian/device/{deviceId}/firmware/download`.
   - Subscribes to hardware telemetry: `guardian/device/{deviceId}/telemetry`.

---

## 4. Database Schema (PostgreSQL + Flyway)

- **`devices`**: Device twin, active bank, firmware version, health score, OLED state.
- **`firmware_releases`**: Uploaded binaries, SHA-256 hashes, cryptographic signatures, health gate parameters.
- **`deployments`**: Deployment tracking, current state, rollback flags, failure reasons.
- **`device_events`**: Live event stream (INFO, LOW, MEDIUM, HIGH, CRITICAL).
- **`security_events`**: Security alerts, hash mismatches, health gate failures, safe mode entries.
