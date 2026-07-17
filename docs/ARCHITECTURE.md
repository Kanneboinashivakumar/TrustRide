# Architecture — concrete technical decisions

Read after PROJECT_BRIEF.md. This file is the contract for how the system is built. If you
change a decision here mid-build, update this file in the same turn — don't let it drift out of
sync with the actual code, that's exactly how a fresh AI session gets confused later.

## Decision log

| Decision | Choice | Why |
|---|---|---|
| Backend framework | Express (standalone, TypeScript, run via `tsx`) on port 4000 | (decided Session 1) Two reasons: (a) a separate process keeps the "backend is untrusted / vehicle verifies signatures itself" boundary architecturally visible rather than blurred into one Next.js app; (b) all state is in-memory, and Next.js dev-mode hot-reload wipes module state — a held command vanishing mid-demo would be fatal. A single long-lived Express process avoids that entirely. |
| Storage | In-memory (module-level singleton stores) | (decided Session 1) Per PROJECT_BRIEF, SQLite/in-memory both acceptable; in-memory has zero setup for judges, and seed data re-loads on every restart giving a clean known demo state each run. |
| Auth | Mock — role selector (Financier / Driver / Admin), no real login | Hackathon scope, real auth adds no demo value |
| Real-time updates | Frontend polling (2s interval) | (decided Session 1) Simplest and most demo-robust option; no extra deps, survives reconnects. The held→executed transition appearing within ≤2s of toggling motion off is easily fast enough for a live demo. WebSocket/SSE adds failure modes with no visible payoff. |
| Frontend port / API base | Next.js on 3000, calls Express at `http://localhost:4000` via `NEXT_PUBLIC_API_BASE` (defaults to that) | (decided Session 1) Standard split; CORS enabled on backend for localhost:3000. |

## Folder structure (target — build toward this, don't improvise a different shape)

```
/project
  /frontend                  Next.js app
    /app
      /financier             Financier portal routes
      /driver                Driver app routes
      /admin                 Admin/audit dashboard routes
      /vehicle-sim           Vehicle simulator route
    /components
      /ui                    shadcn/ui components
      /shared                Cross-portal components (RequestCard, StatusBadge, etc.)
    /lib
      api-client.ts          Typed fetch wrappers to backend
      types.ts               Shared TypeScript types (mirror backend types exactly)
  /backend
    /src
      /crypto                Signing, verification, key management (SoftHSM-style sim)
      /engine                Core security engine: replay check, expiry check, motion interlock
      /audit                 Hash-chain log implementation
      /routes                Express routes (or API route handlers)
      /models                Data models / schema
      /simulator              Vehicle state simulator (motion on/off)
    server.ts
  /docs
    PROJECT_BRIEF.md
    ARCHITECTURE.md
    STATE.md                 <- update this at the end of every session, no exceptions
  README.md
```

## Core data model

```typescript
interface Command {
  commandId: string;        // UUID, unique per request
  vehicleId: string;
  action: "IMMOBILIZE" | "CANCEL";
  reasonCode: "loan_default" | "theft" | "maintenance";
  reasonText: string;
  issuerId: string;          // financier account id
  issuedAt: string;          // ISO timestamp
  expiresAt: string;         // issuedAt + short window, e.g. 5 min
  nonce: string;             // random, prevents replay
  priorCommandHash: string;  // chains to last executed command for this vehicle
  signature: string;         // signs all fields above
}

interface AuditLogEntry {
  entryId: string;
  timestamp: string;
  commandId: string;
  eventType: "REQUESTED" | "DISPATCHED" | "HELD" | "REJECTED" | "EXECUTED" | "ACKNOWLEDGED";
  detail: string;
  previousEntryHash: string; // hash-chain link
  entryHash: string;          // hash of this entry + previousEntryHash
}

interface Vehicle {
  vehicleId: string;
  driverName: string;
  isMoving: boolean;          // the "motion signal" toggle for the demo
  pendingCommand: Command | null;
}
```

## Command verification order (implement in exactly this order — do not reorder)

1. Signature valid? → if not, reject, log REJECTED, stop.
2. `expiresAt` not passed? → if expired, reject, log REJECTED, stop.
3. `commandId`/`nonce` not seen before? → if replayed, reject, log REJECTED, stop.
4. `priorCommandHash` matches vehicle's last executed command? → if not, reject, log REJECTED, stop.
5. Only now check motion: `isMoving === true` → HOLD, log HELD, queue for re-check when motion
   toggles off (or until expiry, whichever first).
6. `isMoving === false` → EXECUTE, log EXECUTED, produce signed acknowledgement.

This order matters for the demo: it lets you show rejection at any of steps 1-4 independently of
the motion state, which makes for a cleaner, more controllable live demo than coupling everything
together.

## API surface (fill in exact routes once backend framework is chosen)

- `POST /api/commands` — financier submits a new shutdown request
- `GET /api/commands/:vehicleId` — current/pending command for a vehicle
- `POST /api/vehicles/:vehicleId/motion` — demo control: toggle moving/stationary
- `GET /api/audit-log` — full hash-chained log
- `POST /api/audit-log/tamper-demo` — demo-only endpoint: mutate one entry's `detail` field
  without recomputing its hash, to visibly break the chain live for judges
- `GET /api/vehicles/:vehicleId/driver-view` — what the driver app displays

## Honest representation of simulated components (UI requirement, not optional)

Anywhere the HSM or Secure Element appears in the UI, label it explicitly:
`"Secure Element (simulated — production uses hardware-backed keys)"`. Do not let the UI imply
real hardware exists. This is a design requirement, not a caveat to skip under time pressure —
judges who ask "is this real hardware" should already have their answer on screen.
