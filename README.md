<p align="center">
  <img src="branding.svg" alt="TrustRide Audit Ledger Console Branding" width="480">
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs" alt="Next.js"></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express" alt="Express"></a>
  <a href="https://typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge" alt="License"></a>
</p>

---

## 📖 Executive Summary & Problem Statement

**TrustRide** is a cybersecurity remote vehicle immobilization platform built to secure electric vehicle fleets. In recent years, unauthenticated Bluetooth Low Energy (BLE) sweeps on cheap battery management systems (BMS) have allowed unauthorized users to immobilize vehicles mid-ride.

TrustRide eliminates these single-point-of-failure vulnerabilities by shifting authorization logic off the backend server and running it directly on the vehicle's electronic control unit (ECU).

---

## 📐 Architecture & Verification Flow

TrustRide operates under a **Zero-Trust Backend Model**: the server acts strictly as an untrusted relay. Command signatures are validated on-vehicle against pre-provisioned public key stores.

```
       +------------------+
       |  Financier Node  |
       +--------+---------+
                | 
                | (1) Signs command payload using ECDSA P-256
                v
  +-------------+--------------+
  |  Backend Server (Relay)    |
  +-------------+--------------+
                | 
                | (2) Relays raw signed payload verbatim
                v
       +--------+---------+
       |   Vehicle ECU    | <---+ (Simulated GPS / Speed Telemetry)
       +--------+---------+
                |
                | (3) Runs 5 Sequential Cryptographic Verification Checks
                +--------+------------------------+----------------------+-------------------------+
                         |                        |                      |                         |
                         v                        v                      v                         v
                 [1. Signature]              [2. Expiry]            [3. Replay]               [4. Chain]
                 ECDSA check                 Freshness check        Nonce verification        Hash-chain anchoring
                         |                        |                      |                         |
                         +------------------------+----------------------+-------------------------+
                                                  |
                                                  v
                                         [5. Motion Interlock]
                                         Speed > 0 ? -> HELD (Hold lock in buffer)
                                         Speed = 0 ? -> EXECUTED (ignition cut)
                                                  |
                                                  v
                                      +-----------+-----------+
                                      | Tamper-Evident Ledger |
                                      +-----------------------+
```

### The 5-Step ECU Validation Pipeline
1. **Signature Verification**: Validates the command signature using the pre-seeded public key PEM in the vehicle firmware's trust store.
2. **Freshness (Expiry) Check**: Ensures the command is processed within a 5-minute expiry window (`expiresAt`).
3. **Replay Protection**: Verifies that the command UUID and nonce have never been logged before.
4. **Command Chain Anchoring**: Validates that the command references the hash of the last executed command on that vehicle (`priorCommandHash`).
5. **Motion Safety Interlock**: Checks current telemetry. If moving (velocity > 0), the command status is set to `HELD` in the ECU buffer. It executes automatically only when velocity falls to exactly 0 km/h.

---

## 📂 Repository Structure

```
/TrustRide
  ├── backend/                   # Node/Express API Service
  │    ├── src/
  │    │    ├── crypto/          # Simulated HSM & ECDSA signing
  │    │    ├── engine/          # 5-step vehicle-side ECU verifier
  │    │    ├── audit/           # SHA-256 hash-chain audit log
  │    │    ├── models/          # In-memory stores & state managers
  │    │    └── server.ts        # Express REST API routes
  │    └── test/
  │         └── scenarios.ts     # 7 core API integration tests
  └── frontend/                  # Next.js 14 Web Portal
       ├── app/
       │    ├── globals.css      # Dark mode glassmorphic styles & cyber grids
       │    ├── layout.tsx       # Next.js layout configurations
       │    └── page.tsx         # Unified dashboard portal (Map, HUD, Sandbox)
       └── lib/
            ├── api-client.ts    # Fetch clients mapped to backend API
            └── types.ts         # Mapped TypeScript shared data structures
```

---

## 🚀 Setup & Installation

### 1. Install Project Dependencies
Run install in both root-level folders:
```bash
# Setup Backend
cd backend
npm install

# Setup Frontend
cd ../frontend
npm install
```

### 2. Run Scenario Test Suite
Run the 7 cryptographic validation tests:
```bash
cd ../backend
npm run test:scenarios
```

### 3. Spin Up Development Servers
Start both servers concurrently.

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# API running on http://localhost:4000
```

**Terminal 2 (Frontend Console):**
```bash
cd frontend
npm run dev
# Dashboard running on http://localhost:3000
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ☁️ Production Deployment Guide

### Frontend (Vercel)
- **Deployment**: Connect repository `https://github.com/Kanneboinashivakumar/TrustRide` to Vercel.
- **Root Directory**: `frontend`.
- **Environment Variables**:
  - `NEXT_PUBLIC_API_BASE`: Set to the live API endpoint (e.g., `https://trustride-backend.railway.app/api`).

### Backend (Railway / Render / Cloud Run)
Because the demo backend keeps simulator and HSM key states in-memory, it requires a **persistent long-lived server process** (serverless functions will wipe the memory cache).
- **Railway Configuration**:
  1. Add a new service from your GitHub repo.
  2. Set Root Directory to `backend`.
  3. Environment variables: `PORT=4000`.
  4. Ensure port mapping is exposed for external routing.
