# 🔐 Secure OTA Guardian

### Safe Firmware Updates Without Risking the Working System

**Secure OTA Guardian** is an embedded firmware-update system designed for devices where a failed firmware update can cause downtime or make the device unusable.

The system uses a **dual-bank firmware architecture** on an **NXP 236** platform.

Instead of overwriting the currently working firmware, the new firmware is installed into a separate bank, tested, and activated only if it passes validation.

---

## 🎯 Problem

Firmware updates are necessary for modern embedded devices, but updating firmware directly can be risky.

A failed update can lead to:

* ❌ Device malfunction
* ❌ Unexpected downtime
* ❌ Difficult recovery
* ❌ Maintenance cost

This is especially important for devices such as:

**EV Chargers • Medical Equipment • Industrial Controllers • Smart Appliances**

### Problem Analysis

```mermaid
flowchart LR
    A[Firmware Update] --> B{Update Failure?}
    B -->|YES| C[Device Malfunction]
    C --> D[Downtime]
    D --> E[Manual Recovery]
    E --> F[Maintenance Cost]

    B -->|NO| G[Device Continues Working]
```

---

# 💡 Our Solution

## Secure OTA Guardian

The core idea is simple:

> **Never risk the working firmware while installing a new firmware version.**

The system maintains two firmware banks:

* **Bank A** → Current stable firmware
* **Bank B** → New firmware

The new firmware is tested before becoming active.

---

# ⚙️ How It Works

```mermaid
flowchart TD
    A[Current Firmware<br/>V1.0.0<br/>BANK A] --> B[New Firmware<br/>V2.0.0]
    B --> C[Write to BANK B]
    C --> D[Test / Validate Firmware]

    D -->|PASS| E[Activate BANK B]
    D -->|FAIL| F[Rollback to BANK A]

    E --> G[System Runs V2.0.0]
    F --> H[System Runs V1.0.0]
```

### Simple Flow

**New Firmware → Bank B → Test → Pass / Fail**

✅ Pass → **Activate Bank B**

❌ Fail → **Rollback to Bank A**

---

# 🔄 Dual-Bank Architecture

```mermaid
flowchart LR
    A["BANK A<br/>V1.0.0<br/>STABLE"] <--> B["BANK B<br/>V2.0.0<br/>NEW"]

    B --> C{Validation}
    C -->|PASS| D["Use V2.0.0"]
    C -->|FAIL| A

    A --> E["Switch / Recover"]
    B --> E
```

The dual-bank design also allows switching between available firmware versions when required.

---

# 🧩 MVP Hardware

| Component               | Purpose                        |
| ----------------------- | ------------------------------ |
| **NXP 236**             | Main embedded controller       |
| **Dual Firmware Banks** | Store current and new firmware |
| **LCD Display**         | Display system/update status   |
| **Relay Module**        | Control connected load         |
| **Current Sensor**      | Monitor current                |
| **Other peripherals**   | Support system operation       |

---

# 🖥️ Software

The project also includes a web/software interface for interacting with and monitoring the system.

🌐 **Live Website:**
https://guardian-x.vercel.app

---

# 🚀 Key Features

* 🔄 Dual-bank firmware storage
* 🛡️ Safe firmware validation
* ↩️ Automatic rollback on failure
* 🔀 Firmware version switching
* 📟 LCD-based status display
* ⚡ Current/load monitoring
* 🌐 Web-based interface

> Features shown here should match the currently implemented prototype.

---

# 🏗️ System Architecture

```mermaid
flowchart LR
    U[User / Operator] --> W[Web Interface]

    W --> S[Embedded System]

    S --> N[NXP 236]

    N --> A[Bank A<br/>Stable Firmware]
    N --> B[Bank B<br/>New Firmware]

    N --> L[LCD]
    N --> R[Relay]
    N --> C[Current Sensor]

    B --> T[Validation]
    T -->|Pass| B
    T -->|Fail| A
```

---

# 🔁 Firmware Update Logic

```mermaid
stateDiagram-v2
    [*] --> BankA

    BankA --> BankB: Install New Firmware
    BankB --> Testing: Start Validation

    Testing --> BankB: Validation Passed
    Testing --> BankA: Validation Failed / Rollback

    BankA --> BankB: Manual Version Switch
    BankB --> BankA: Manual Version Switch
```

---

# 🌍 Potential Applications

Secure OTA Guardian can be adapted for embedded devices where firmware failure may cause operational problems.

### Possible applications

* ⚡ EV Charging Systems
* 🏥 Medical / Surgical Equipment
* 🏭 Industrial Controllers
* 🏠 Smart Appliances
* 🔌 Connected Embedded Devices

---

# 🔮 Future Scope

The current MVP can be extended with:

* Secure remote OTA updates
* Digital signature verification
* Anti-downgrade protection
* Cloud-based device monitoring
* Fleet management
* Staged / canary deployment
* Automated alerts
* Advanced device health monitoring

---

## 🌐 Project

**Live Website:**
https://guardian-x.vercel.app

---

### 💬 Core Idea

> **Update the firmware. Test it safely. Roll back when necessary. Keep the device running.**

**Secure OTA Guardian — Update without risking the working firmware.**
