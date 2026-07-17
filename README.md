# TrustRide 🛡️ — Secure & Accountable Remote Vehicle Governance Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)](#)

**TrustRide** is a cybersecurity-centric, zero-trust remote vehicle immobilization platform. It simulates a governed, safe, and tamper-evident remote shutdown command pipeline. Designed for vehicle financiers (NBFCs), EV manufacturers (OEMs), and fleet operators, it eliminates unauthorized vehicle control exploits (such as unauthenticated BLE BMS sweeps) by moving the cryptographic authorization logic directly onto the vehicle's electronic control unit (ECU).

> [!NOTE]
> *Designed with reference to AIS-156 (EV Battery Safety), ISO 26262 (ASIL-D Functional Safety), UNECE R155 (Cyber Security Management), and ISO/SAE 21434 (Automotive Cybersecurity Engineering), without claiming official hardware certification.*

---

## ⚡ The Security Problem

Traditional remote vehicle shutdown tools (like BMS override apps) suffer from critical vulnerabilities:

| Vulnerability | Traditional BMS/IoT Systems | TrustRide Secure Architecture |
|---|---|---|
| **Local Intercepts** | Raw override codes sent via unauthenticated Bluetooth/BLE to cheap controllers. | All commands require asymmetric signature validation on the vehicle. |
| **Untrusted Server** | Central server database compromises allow malicious actors to halt entire fleets unilaterally. | Central server has **no signing keys**. Relays commands verbatim; verifications run on the vehicle. |
| **Motion Hazard** | Vehicles are turned off mid-ride, causing immediate motor shutdowns and accidents. | **Motion Interlock**: Local telemetry checks hold commands until velocity reaches exactly 0 km/h. |
| **Audit Trails** | Simple database records can be altered, leading to driver vs. financier payment disputes. | **Tamper-Evident Hash-Chained Ledger**: SHA-256 links entries; tampering instantly breaks the chain. |

---

## 🛠️ System & Cryptographic Architecture

TrustRide is built on the principle that **the central backend is untrusted by design**. 

```
┌─────────────────┐           (1) Signs command using EC private key
│ Financier Portal│ ────────► [Simulated HSM Slot / Private Key]
└────────┬────────┘
         │
         ▼
┌─────────────────┐           (2) Relays payload verbatim (Cannot modify)
│ Backend Server  │ ────────► [Express Relay / In-Memory Log]
└────────┬────────┘
         │
         ▼
┌─────────────────┐           (3) Runs 5-step signature/telemetry checks
│ Vehicle ECU     │ ────────► [Verifier Firmware / Public Trust Store]
└────────┬────────┘
         │
         ▼
┌─────────────────┐           (4) Appends transaction blocks
│ Audit Ledger    │ ────────► [SHA-256 Hash-Chained Chain]
└─────────────────┘
```

### The 5-Step ECU Verification Pipeline
When a command reaches the vehicle verifier, it executes exactly five checks in strict sequence. If any check fails, the pipeline halts immediately, logging a `REJECTED` event:

1. **Check 1: Signature Verification** — Verifies the ECDSA P-256 signature against the canonicalized command fields using the public key in the vehicle trust store.
2. **Check 2: Expiry Check** — Confirms the command is fresh. The current system time must be less than `expiresAt` (issued time + 5-minute window).
3. **Check 3: Replay Protection** — Compares the `commandId` and `nonce` against seen values. Duplicates are instantly rejected.
4. **Check 4: Prior-Command Chain Check** — Verifies that the command cites the hash of the last executed command on that specific vehicle (`priorCommandHash`).
5. **Check 5: Motion Interlock** — Only checked after validation steps 1-4 pass. If velocity telemetry is > 0, the command is set to `HELD` in the vehicle's pending buffer. Power is cut **only** when the vehicle speed reaches 0.

---

## 📂 Repository Folder Structure

```
/TrustRide
  ├── backend/                   # Express API Service
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

## 🎮 The Interactive Presentation Flow

The frontend features a **12-Step Auto Demo Player** that simulates the complete remote immobilization lifecycle:

1. **Telemetry Setup**: Verifies TR-103 is active and driving at 32 km/h.
2. **Lock Dispatch**: Financier issues an `IMMOBILIZE` request to TR-103.
3. **Safe Interlock Hold**: ECU verifier intercept is simulated, marking command as `HELD`.
4. **Stop Action**: Speed slides to 0 km/h, releasing the interlock and changing state to `EXECUTED`.
5. **Settlement Release**: Financier issues a `RELEASE` command to unlock the ignition.
6. **MITM Mutated Attack**: Attacker edits a field post-signing; verifier rejects under `SIGNATURE` check.
7. **Stale Command Attack**: Command with an expired timestamp is rejected under `EXPIRY` check.
8. **Verbatim Replay Attack**: Attacker attempts to resend the previous command; verifier rejects under `REPLAY` check.
9. **Rogue Issuer Attack**: Rogues sign with unprovisioned keys; verifier rejects under `SIGNATURE` check.
10. **Driver Dispute**: Driver registers an account dispute along with payment proof on the ledger.
11. **Ledger Tampering**: Attacker mutates historical log text; audit ledger highlights a `CHAIN BREACHED` state.
12. **Ledger Restoration**: Admin restores logs; verification returns ledger to `Healthy` state.

---

## 🚀 Local Setup & Launch

### 1. Install Dependencies
Install packages in both directories:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Run Integration Tests
Verify that all 7 cryptographic scenarios pass the API validation check:
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
# Running on http://localhost:4000
```

**Terminal 2 (Frontend Console):**
```bash
cd frontend
npm run dev
# Running on http://localhost:3000
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser to interact with the console.

---

## ☁️ Deployment Strategy (Production)

To deploy the TrustRide prototype to the cloud, the following services are recommended:

### 1. Frontend: Vercel (Serverless)
Since the frontend is a React Next.js application, **Vercel** is the optimal choice.
- **Steps**:
  1. Connect your GitHub repository `https://github.com/Kanneboinashivakumar/TrustRide`.
  2. Set the Root Directory to `frontend`.
  3. Configure the Environment Variable:
     - `NEXT_PUBLIC_API_BASE`: Set this to your deployed backend URL (e.g., `https://trustride-api.up.railway.app/api`).
  4. Click **Deploy**.

### 2. Backend: Railway / Render / Google Cloud Run (Container/Server)
Because the backend maintains simulated vehicle and command state **in-memory** to avoid heavy database dependencies for the demo, it requires a **persistent long-lived server process** (standard Next.js Serverless Functions will recycle and wipe the memory).
* **Railway (Recommended)**:
  1. Create a new service from your GitHub repo.
  2. Set the root directory to `backend`.
  3. Specify the build command: `npm install` and start command: `npm start`.
  4. Expose the port (Port `4000` is default; Railway automatically detects Express configurations).
* **Google Cloud Run**:
  1. Create a Dockerfile in the `backend/` directory.
  2. Deploy the container using `gcloud run deploy`.
  3. Ensure memory limit constraints permit standard runtime execution.
