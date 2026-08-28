# SECURE OTA GUARDIAN

> **"One bad firmware release should never become a fleet-wide disaster."**

A production-grade **Secure Firmware Lifecycle & Fleet Resilience Platform** with physical NXP FRDM-MCXN236 hardware demonstrator.

---

## What is this?

Secure OTA Guardian is a cybersecurity command center for managing firmware updates across a fleet of embedded devices. It implements:

- **Dual-bank firmware architecture** — safe, non-destructive updates
- **Health-gated firmware activation** — failed deployments auto-rollback
- **Automatic Safe Mode** — prevents fleet-wide damage from bad releases
- **Real-time device telemetry** — bidirectional NXP device communication
- **Device Twin** — virtual mirror of the physical NXP board
- **Attack Lab** — demonstrates attack scenarios and defenses
- **Guardian AI** — AI-powered incident analysis

---

## Architecture

```
Browser (Next.js 14)
    ↕ HTTPS REST + WebSocket (STOMP over SockJS)
Spring Boot 3.2 Backend
    ↕ DeviceAdapter Interface
SimulatedDeviceAdapter (dev) ←→ NXPDeviceAdapter (hardware)
    ↕ MQTT (Mosquitto broker)
NXP FRDM-MCXN236 Hardware
```

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.

---

## Quick Start

### Prerequisites

- Node.js 20+
- Java 21+
- Docker & Docker Compose
- Maven 3.9+

### 1. Clone & setup environment

```bash
git clone <repo>
cd secure-ota-guardian

# Frontend environment
cp .env.example frontend/.env.local
# Edit frontend/.env.local with your Supabase credentials
```

### 2. Start PostgreSQL

```bash
docker-compose up -d postgres
```

### 3. Start the backend

```bash
cd backend

# Set environment variables (or use .env file)
export DATABASE_URL=jdbc:postgresql://localhost:5432/guardian
export DATABASE_USERNAME=guardian
export DATABASE_PASSWORD=guardian_secret
export SUPABASE_JWT_SECRET=your-supabase-jwt-secret

./mvnw spring-boot:run
# Backend runs on http://localhost:8080
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### 5. (Optional) Start device simulator

```bash
cd device-simulator
npm install
cp .env.example .env
npm run dev
```

---

## Google OAuth Setup (Supabase)

1. In Supabase, open the project that owns the publishable key, then go to **Project Settings → API**. Copy both the **Project URL** and **Publishable key** from that same project. The URL cannot be derived from the key.
2. In **Authentication → URL Configuration**, set:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** `http://localhost:3000/auth/callback`
3. In **Authentication → Providers → Google**, copy the displayed Supabase callback URL. It has this form:
   `https://<matching-project-ref>.supabase.co/auth/v1/callback`
4. In Google Cloud Console → **Google Auth Platform → Clients**, configure the web client with:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `https://<matching-project-ref>.supabase.co/auth/v1/callback`
5. Copy the Google Client ID and Client Secret into the Supabase Google provider settings.
6. Add the matching Supabase values to `frontend/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<matching-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
   Never put an `sb_secret_...` key in a `NEXT_PUBLIC_*` variable or browser code.
7. Add JWT secret to backend:
   ```
   SUPABASE_JWT_SECRET=your-jwt-secret
   ```
   (Find it in Supabase → Settings → API → JWT Secret)

---

## Demo Flow

### Deploy Update 1 (Stable)

1. Log in at http://localhost:3000
2. Navigate to Command Center
3. Click **"Deploy Update 1"** in Firmware Deployment section
4. Watch the state machine progress: DOWNLOADING → VERIFYING → INSTALLING → REBOOTING → HEALTH_CHECK → **CONFIRMED**
5. Device Twin shows GREEN LED, v1.0.0, HEALTHY

### Deploy Update 2 (Fault Injection)

1. Click **"Deploy Update 2"** in Firmware Deployment section
2. Watch: DOWNLOADING → VERIFYING (signature VALID) → INSTALLING → HEALTH_CHECK → **FAILED**
3. Automatic ROLLBACK executes
4. Device enters **SAFE MODE**
5. Security events appear in Security Center
6. Fleet health shows device in SAFE MODE

### Reset Demo

Click **RESET DEMO** to return system to initial state.

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `frontend/.env.local` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `frontend/.env.local` | Supabase anon key |
| `NEXT_PUBLIC_BACKEND_URL` | `frontend/.env.local` | Backend API URL |
| `NEXT_PUBLIC_WS_URL` | `frontend/.env.local` | WebSocket URL |
| `DATABASE_URL` | Backend env | PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | Backend env | DB username |
| `DATABASE_PASSWORD` | Backend env | DB password |
| `SUPABASE_JWT_SECRET` | Backend env | Supabase JWT secret |
| `CORS_ALLOWED_ORIGINS` | Backend env | Frontend origin URL |

---

## Project Structure

```
secure-ota-guardian/
├── frontend/           Next.js 14 + TypeScript + Tailwind CSS
├── backend/            Spring Boot 3.2 + Java 21 + PostgreSQL
├── device-simulator/   Node.js TypeScript — DeviceAdapter abstraction
├── shared/             Shared TypeScript type definitions
├── docs/               Full documentation
└── docker-compose.yml  PostgreSQL + pgAdmin
```

---


## License

MIT License — for hackathon/educational use.
>>>>>>> 8a5879b (feat: Secure OTA Guardian X - Full Stack Cyber Platform & NXP FRDM-MCXN236 2-Way Hardware Sync)
