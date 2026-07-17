# Project brief — read this first, every session

This file is the single source of truth for what we're building and why. If you are an AI
picking this project up mid-build (fresh context, different tool, tokens ran out last session),
read this file, then ARCHITECTURE.md, then STATE.md, in that order, before writing any code.
Do not re-derive the concept from scratch or infer requirements — they're all here.

## What this is

**Secure & Accountable Remote Immobilization Platform** — a hackathon MVP (software simulation,
no real hardware) demonstrating a governed way to remotely disable an electric vehicle.

## The problem (context, not to be re-explained to the user — they know this)

In July 2026, apps like BAT-BMS went viral in India for letting anyone within Bluetooth range
remotely cut power to e-rickshaws mid-ride, by exploiting unauthenticated BLE connections to
cheap battery management systems. The government banned the apps. But the underlying gap isn't
"Bluetooth is insecure" — it's that even *legitimate* remote shutdown (a financier disabling a
vehicle over unpaid loans) has no authentication, no motion-safety check, and no accountability
trail. That gap doesn't go away when the news cycle does.

## What we're building (in scope for the hackathon MVP)

A software-only simulation of a governed command pipeline:
1. A **financier** submits a signed shutdown request with a reason.
2. The **backend** never executes anything itself — it can request a signature from a simulated
   HSM/PKI layer, and must log every event, but has no unilateral authority.
3. A **vehicle simulator** (with a speed/motion toggle standing in for real telemetry) only
   executes an immobilize command if: the signature verifies, the command hasn't expired, it
   hasn't been seen before (replay check), and the vehicle is NOT currently moving.
4. If moving, the command is held and queued until the vehicle stops (or expires).
5. A **driver app** shows any pending/executed request against their vehicle, with requester
   identity, reason, and a dispute button.
6. An **admin/audit dashboard** shows the full tamper-evident, hash-chained log, and can visibly
   demonstrate that editing a past entry breaks the chain.

## Explicitly out of scope (do not build, do not suggest building)

- Real hardware, real Bluetooth, real CAN bus integration
- Real HSM (use SoftHSM or an equivalent software-only PKCS#11-style simulation, clearly labeled
  as simulated in the UI — see ARCHITECTURE.md for exactly how to represent this honestly)
- Real user accounts / production auth — mock auth (role picker) is fine and expected
- Payment, billing, or real financier/NBFC integration
- Mobile native apps — responsive web is sufficient

## Why these design choices exist (don't relitigate these, they're settled)

- **Motion interlock is the core safety property**, not a nice-to-have — a shutdown request must
  never execute while the vehicle is moving, full stop.
- **The backend is not trusted by design** — the vehicle-side verifier checks signatures itself;
  this is the single most important architectural decision in this project and must not be
  simplified away for convenience. If a shortcut would make the backend able to unilaterally
  execute a command without a valid signature, it violates the core thesis of the project — stop
  and flag it rather than doing it.
- **The audit log must be hash-chained**, not just a database table, and the demo must be able to
  show a broken chain live when an entry is tampered with — this is the single best demo moment,
  do not cut it for time.

## Tech stack (fixed — do not substitute without updating this file and telling the user why)

- Frontend: Next.js + TypeScript + Tailwind + shadcn/ui
- Backend: Node.js/Express (or Next.js API routes if that speeds up the hackathon build — see
  ARCHITECTURE.md decision log for which was chosen and why)
- Crypto: Node's built-in `crypto` module (ECDSA), no need for external HSM SDKs
- Storage: in-memory or SQLite is sufficient for a hackathon demo — do not build out a production
  database layer, that's effort spent on the wrong thing

## Definition of done for the hackathon demo

The demo is ready when a judge can watch, live, without narration filling gaps:
1. A financier submits a shutdown request on a moving vehicle → it's held, not executed.
2. The vehicle stops → the held command executes automatically.
3. A tampered command is rejected (signature invalid).
4. An expired command is rejected.
5. A replayed command is rejected.
6. The driver sees the request and can dispute it.
7. The admin dashboard shows the hash-chained log, and editing one entry visibly breaks the chain.

If those seven things work cleanly, the MVP is done. Polish and extra features only after all
seven are solid — do not add scope before these are bulletproof.

## Source documents (for deeper detail, read on demand, not upfront)

- `e-rickshaw-immobilization-security-architecture.md` — full threat model, crypto flow,
  standards alignment (from earlier planning — reference for design decisions, not something to
  re-implement in full for the hackathon)
- `business-case-and-deployment-plan.md` — costs, customer, competitors (not needed for coding,
  useful for the pitch deck)
