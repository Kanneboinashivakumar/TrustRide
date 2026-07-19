<div align="center">

<img src="branding.svg" alt="TrustRide Logo" width="480">

### Zero-Trust, Decentralized Cryptographic Remote EV Governance Platform

*Governed & safe remote immobilization — for a system nobody currently has to answer to.*

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25_typesafe-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_API-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![ECDSA](https://img.shields.io/badge/Crypto-ECDSA_P--256-8A2BE2?style=for-the-badge)](#-the-5-step-security-pipeline)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)
[![Built for](https://img.shields.io/badge/Built_for-Operation_Cipher_2026-22D3EE?style=for-the-badge)](#)

[Live Demo](https://trustride-frontend.onrender.com) · [Backend API](https://trustride-backend.onrender.com) · [Technical Docs](./docs/ARCHITECTURE.md) · [Report a Bug](../../issues)

</div>

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [The Gap Nobody Fixed](#-the-gap-nobody-fixed)
- [The TrustRide Solution](#-the-trustride-solution)
- [Key Features](#-key-features)
- [Platform Architecture](#-platform-architecture)
- [The 5-Step Security Pipeline](#-the-5-step-security-pipeline)
- [Threat Sandbox & Attack Simulations](#-threat-sandbox--attack-simulations)
- [Screenshots](#-screenshots)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Real-World Impact & Compliance](#-real-world-impact--compliance)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚨 The Problem

In July 2026, an app called **BAT-BMS** went viral across India for one reason: **anyone within Bluetooth range could remotely cut power to a moving e-rickshaw.** Cheap battery management systems accept unauthenticated BLE connections — no PIN, no pairing, no signature. The Indian government pulled the app, along with two others, from app stores within days.

But BAT-BMS and its equivalents weren't built as attack tools. They were legitimate utilities — used by **NBFC financiers and fleet operators** to remotely disable a vehicle over an unpaid loan or a theft report. The ban fixed the exploit that made headlines. It didn't fix what made the exploit possible in the first place:

- **Centralized, unauthenticated trust** — if the server (or the BLE channel) is compromised, an attacker gains the same power a legitimate financier has, with none of the accountability.
- **No motion safety interlock** — nothing on the vehicle checks whether it's moving before cutting power. A shutdown at 40 km/h is a safety incident, not just a security one.
- **No audit trail** — when a vehicle is disabled, there is no cryptographic record of who ordered it, when, or why — which means disputes between drivers and financiers have no evidence trail on either side.

---

## 🎯 The Gap Nobody Fixed

Banning the app doesn't remove the underlying pattern — it just removes one implementation of it. The deeper problem was never really "Bluetooth is insecure." It's that **even a fully legitimate remote shutdown — issued by a real financier, for a real reason — has no authentication, no safety check, and no accountability.** That gap doesn't disappear when the news cycle does, and nothing in the current regulatory or product landscape closes it yet.

> Nobody today — driver, financier, or regulator — has a safe, accountable way to remotely disable a vehicle.

---

## 💡 The TrustRide Solution

TrustRide replaces informal, unauthenticated remote shutdown with a **decentralized, zero-trust cryptographic command verification pipeline**:

- **The backend server is untrusted by design.** It cannot generate or sign authorization commands — it acts strictly as a relay with no unilateral power, even if fully compromised.
- **On-board asymmetric signature verification.** Every command is signed by a simulated Hardware Security Module key slot and verified natively on the vehicle's ECU against a pre-provisioned trust store.
- **Firmware-governed safety interlocks.** Telemetry is checked on the vehicle itself. A command issued while the vehicle is moving is held in a deferred state — the motor relay is disabled only once velocity reaches exactly 0 km/h.
- **Tamper-evident chronological auditing.** Every command, dispute, and reset is written as a SHA-256 hash-chained block — any post-hoc tampering is immediately, provably visible.

---

## ✨ Key Features

| Feature | Category | Description |
|---|---|---|
| 🔐 Secure Remote Immobilization | Security | Cryptographically authorized power isolation that overrides standard vehicle ignition |
| ✍️ Asymmetric Verification | Cryptography | ECU-side signature checking using real ECDSA P-256 public keys stored in secure firmware |
| 🛡️ Replay Protection | Cryptography | Strict nonce and command UUID checks preventing reuse of intercepted authorization packets |
| 🚦 Motion Safety Interlock | Safety | Telemetry-aware interlock that defers execution of override commands while speed > 0 |
| 🔗 Immutable Audit Ledger | Integrity | SHA-256 hash-chained block ledger that makes any post-hoc database tampering immediately visible |
| ⚖️ Driver Dispute Portal | Compliance | Lets drivers append dispute records with payment reference hashes directly to the audit log |
| 🎬 Auto Demo Mode | Presentation | A guided player walking through threat simulations, interlock states, and ledger forensics |
| 🕵️ Presenter's Judge Mode | Presentation | Live pop-up annotations detailing exactly which ECU check is running at each step |
| ⚡ Interactive Attack Simulator | Threat Sandbox | Triggers replay, MITM, rogue-issuer, and stale-command attacks live, and shows the ECU reject each one |
| 📊 Enterprise Analytics | Dashboard | Real-time fleet status, blocked threats, held-command queues, and ledger health |
| 🗺️ Digital Twin Map | Telemetry | Interactive map tracking simulated vehicles, routes, and live speed telemetry |
| 📟 Simulated HSM Module | Hardware | Software emulation of a secure element — ECDSA key slot storage, signing, and verification |

---

## 🏗 Platform Architecture

TrustRide separates key management, transport, verification, and forensic logging into distinct trust boundaries:

```
 Financier / NBFC Portal            Simulated HSM (Secure Element)
 ─────────────────────              ──────────────────────────────
 Holds no private keys.       ───▶  Cryptographic vault. Signs
 Sends payloads to the HSM           commands with ECDSA P-256.
 for signing.                       Private key never leaves.
                                              │
                                              ▼
                              Backend Relay Server (Express)
                              ───────────────────────────────
                              Holds NO signing keys. Cannot
                              alter payloads. Strictly relays.
                                              │
                                              ▼
                              Vehicle ECU Verifier (firmware sim)
                              ────────────────────────────────────
                              Independently verifies every command.
                              Runs the 5-step pipeline below.
                                              │
                                              ▼
                              Audit Ledger (SHA-256 hash chain)
                              ───────────────────────────────────
                              Every event — Requested, Held,
                              Rejected, Executed, Disputed —
                              written as a tamper-evident block.
```

**The core rule the whole system is built around:** the vehicle never trusts the backend — only a signature it verifies itself. Even a fully compromised backend cannot forge a valid, authorized shutdown command.

---

## 🔒 The 5-Step Security Pipeline

Before executing any remote override, the vehicle ECU runs every command through five sequential checkpoints, in strict order — if any step fails, the pipeline halts immediately and logs a `REJECTED` event:

| # | Check | What it verifies |
|---|---|---|
| 1 | **Signature** | Command fields are canonicalized, hashed, and verified against the issuer's public key in the ECU trust store |
| 2 | **Freshness window** | Current time vs. command timestamp — anything older than 5 minutes is discarded as stale |
| 3 | **Replay / nonce** | Unique command ID and nonce checked against everything the vehicle has already seen |
| 4 | **Hash-chain anchoring** | Command must reference the hash of the last successfully executed command on that vehicle |
| 5 | **Motion interlock** | Reads speed telemetry — non-zero speed holds the command; execution proceeds only at 0 km/h |

---

## ⚔️ Threat Sandbox & Attack Simulations

An interactive sandbox lets you trigger real exploit patterns and watch the ECU respond, live:

| Attack Vector | Exploit | Blocked By | Result |
|---|---|---|---|
| BLE Local Sweep | Raw override payload sent with no signature | Check 1 | **REJECTED** — no trusted HSM certificate match |
| Man-in-the-Middle | Valid payload intercepted and a field mutated | Check 1 | **REJECTED** — mutation breaks the canonical hash |
| Verbatim Replay | A previously executed command resent as-is | Check 3 | **REJECTED** — nonce/command ID already consumed |
| Stale Command Playback | A valid but hours-old signed command replayed | Check 2 | **REJECTED** — outside the 5-minute freshness window |
| Rogue Issuer | Command signed with an unauthorized key pair | Check 1 | **REJECTED** — signing key not in the firmware trust store |
| Backend Compromise | Attacker controls the API server, tries bulk shutdown | Check 1 | **REJECTED** — the backend never held signing keys |
| Ledger Tampering | Direct database edit to erase or alter a logged event | Hash-chain | **FLAGGED** — chain breaks at the exact tampered index |

---

## 📸 Screenshots

**Landing page — live ECU status on the hero itself**

![TrustRide landing page](./docs/screenshots/landing.png)

**Control center — fleet telemetry, threat stats, and the governance pipeline**

![TrustRide dashboard overview](./docs/screenshots/dashboard.png)

**Threat Sandbox — detailed cryptographic intercept reports**

![Financier Sandbox Screenshot](./docs/screenshots/sandbox.png)

**Digital Twin Map — real-time Hyderabad road navigation**

![Vehicle Simulator Screenshot](./docs/screenshots/simulator.png)

**Audit Ledger Console — forensic proof of chain tampering**

![Audit Ledger Screenshot](./docs/screenshots/ledger.png)

---

## 💻 Technology Stack

* **Frontend** — Next.js 14 (React 18), TypeScript, TailwindCSS, Framer Motion, Lucide React
* **Backend** — Node.js, Express (REST API), native `crypto` (ECDSA P-256 + SHA-256), `tsx` runtime
* **Security** — custom 5-step ECU verifier engine, custom SHA-256 hash-chain audit log
* **Hosting** — Render (long-lived containers — required, since in-memory state can't survive serverless recycling)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18.x or v22.x
- npm v9.x or later

### Quick start

```bash
git clone https://github.com/Kanneboinashivakumar/TrustRide.git
cd TrustRide

# backend
cd backend && npm install

# frontend
cd ../frontend && npm install
```

### Run the scenario test suite

Confirms all 7 core security scenarios pass before you touch the UI:

```bash
cd backend
npm run test:scenarios
```

### Run locally

```bash
# Terminal 1 — backend
cd backend
npm run dev            # http://localhost:4000

# Terminal 2 — frontend
cd frontend
npm run dev            # http://localhost:3000
```

Open `http://localhost:3000`.

---

## 🌐 Environment Variables

Local development has pre-configured fallbacks. For a production deployment, set:

**`frontend/.env.production`**
```bash
# Public base URL of your deployed Express backend
NEXT_PUBLIC_API_BASE=https://trustride-backend.onrender.com/api
```

---

## ☁️ Deployment

Because vehicle and command state lives in-memory (no database dependency for the demo), the backend needs a **persistent, long-lived server process** — standard serverless functions recycle and wipe that state.

**Backend on Render:** New Web Service → root directory `backend` → build `npm install` → start `npm start`.
**Frontend on Render:** New Web Service → root directory `frontend` → build `npm install && npm run build` → start `npm start` → set `NEXT_PUBLIC_API_BASE` to `https://<your-backend>.onrender.com/api`.

> Render's free tier spins the backend down after ~15 minutes idle — the first request after that takes ~30-50s to wake it. Warm it up before a live demo.

---

## 📈 Real-World Impact & Compliance

**Scale:** India's e-rickshaw market is valued at **$1.62B in 2026**, growing to **$3.14B by 2031** (14.12% CAGR). Roughly **700,000 new e-rickshaws** were registered in 2024 alone (VAHAN state data), with **316,000 more** targeted under the PM E-DRIVE subsidy scheme — the large majority financed through NBFCs rather than owned outright, meaning each one is already a viable remote-shutdown target with zero governance standard today.

**Who benefits:**
- **NBFCs** — enforceable lease compliance with a defensible audit trail, not informal apps carrying legal exposure
- **EV OEMs** — security moves from bolt-on apps into standardized vehicle firmware
- **Fleet operators** — vehicles can never be disabled mid-ride by a rogue call or a database breach
- **Insurers** — standardized, provable ignition cut-offs support lower risk-based premiums

**Designed in alignment with** (not certified against) established connected-vehicle frameworks: **AIS-156** (EV battery & power isolation safety), **ISO 26262** (functional safety), **UNECE R155** (cybersecurity management systems), and **ISO/SAE 21434** (automotive cybersecurity engineering lifecycle).

---

## 🗺 Roadmap

- [ ] **Physical HSM integration** — verification testing on real ATECC608-class secure element boards
- [ ] **CAN bus integration** — command decoding over simulated CAN network frames
- [ ] **Multi-signature policies** — require multiple distinct financier signatures for immobilization
- [ ] **Offline verification** — fallback verification via time-based one-time tokens
- [ ] **Beyond e-rickshaws** — the same governance layer extends to e-two-wheelers, e-autos, and fleet/last-mile delivery EVs using the same BMS/VCU pattern

---

## 🤝 Contributing

Issues and pull requests are welcome — see [Issues](../../issues) to report a bug or propose a feature.

---

## 📄 License

Licensed under the [MIT License](./LICENSE).

---

<div align="center">

**Built for Operation Cipher 2026** — Kanneboina Shiva Kumar

*Plan the mission. Build the solution. Execute the heist.*

</div>
