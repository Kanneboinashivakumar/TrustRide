import express from "express";
import cors from "cors";
import { secureElement } from "./crypto/secureElement.js";
import { vehicleVerifier } from "./engine/verifier.js";
import { registerVehicle, setMotion, startExpirySweep } from "./simulator/vehicleSim.js";
import {
  issueAndDispatch,
  dispatchTamperedCommand,
  dispatchExpiredCommand,
  replayLastCommand,
} from "./engine/commandService.js";
import { auditLog } from "./audit/auditLog.js";
import { commandRecords, vehicles, recordsForVehicle } from "./models/store.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Root path status report
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "TrustRide Cryptographic Remote Immobilization API Backend Active",
    version: "1.2.0",
    endpoints: [
      "/api/vehicles",
      "/api/audit-log",
      "/api/commands"
    ]
  });
});

// ============================================================================
// SEEDING AND PROVISIONING
// ============================================================================

console.log("[TrustRide] Initializing Simulated Secure Element & Keys...");

// 1. Provision Financier (TrustRide Finance)
secureElement.provision("fin-001", "TrustRide Finance");

// 2. Provision Vehicles TR-101, TR-102, TR-103
secureElement.provision("vehicle:TR-101", "Vehicle TR-101 (Rajesh Kumar)");
secureElement.provision("vehicle:TR-102", "Vehicle TR-102 (Priya Sharma)");
secureElement.provision("vehicle:TR-103", "Vehicle TR-103 (Amit Singh)");

// 3. Configure trust store on the Vehicle Verifier
// The vehicle verifier (representing vehicle firmware) must trust the financier's public key
const financierPubKey = secureElement.getPublicKeyPem("fin-001");
vehicleVerifier.trustIssuer("fin-001", financierPubKey);

// 4. Register vehicles in the simulation store
registerVehicle("TR-101", "Rajesh Kumar");
registerVehicle("TR-102", "Priya Sharma");
registerVehicle("TR-103", "Amit Singh");

// 5. Seed some initial command history (for demo visibility)
try {
  // Let's create an initial request that executed successfully
  issueAndDispatch({
    vehicleId: "TR-101",
    action: "IMMOBILIZE",
    reasonCode: "maintenance",
    reasonText: "Scheduled 10,000 km battery cell balancing and safety inspection.",
    issuerId: "fin-001",
  });
  
  // Followed by a cancel so the vehicle is active
  issueAndDispatch({
    vehicleId: "TR-101",
    action: "CANCEL",
    reasonCode: "maintenance",
    reasonText: "Inspection completed, battery pack healthy. Re-enabling drive motor.",
    issuerId: "fin-001",
  });

  // Let's also issue an IMMOBILIZE on TR-102 while it's stationary, so it's currently immobilized
  issueAndDispatch({
    vehicleId: "TR-102",
    action: "IMMOBILIZE",
    reasonCode: "loan_default",
    reasonText: "Overdue payment for cycle 14 (30 days past due). Repeated notifications ignored.",
    issuerId: "fin-001",
  });

  // Let's make TR-103 moving, so any commands issued to it will hold
  setMotion("TR-103", true);
  
  console.log("[TrustRide] Seed data initialized successfully.");
} catch (err) {
  console.error("[TrustRide] Error seeding initial commands:", err);
}

// Start the background sweep to expire held commands
startExpirySweep(1000);

// ============================================================================
// API ROUTES
// ============================================================================

// 1. Submit a financier command (Legitimate Flow)
app.post("/api/commands", (req, res) => {
  try {
    const { vehicleId, action, reasonCode, reasonText, issuerId } = req.body;
    if (!vehicleId || !action || !reasonCode || !reasonText || !issuerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const result = issueAndDispatch({ vehicleId, action, reasonCode, reasonText, issuerId });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Retrieve command history for a vehicle
app.get("/api/commands/:vehicleId", (req, res) => {
  try {
    const { vehicleId } = req.params;
    if (!vehicles.has(vehicleId)) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    const records = recordsForVehicle(vehicleId);
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Toggle vehicle motion state
app.post("/api/vehicles/:vehicleId/motion", (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { isMoving } = req.body;
    if (typeof isMoving !== "boolean") {
      return res.status(400).json({ error: "isMoving must be a boolean" });
    }
    const outcome = setMotion(vehicleId, isMoving);
    res.json(outcome);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Retrieve full audit log with integrity checks
app.get("/api/audit-log", (req, res) => {
  try {
    const verification = auditLog.verifyChain();
    res.json(verification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Tamper audit log for demo purposes
app.post("/api/audit-log/tamper-demo", (req, res) => {
  try {
    const { entryId, newDetail } = req.body;
    const tampered = auditLog.tamperForDemo(entryId, newDetail);
    if (!tampered) {
      return res.status(404).json({ error: "Audit log is empty or entry not found" });
    }
    res.json({ message: "Audit log tampered successfully", tampered });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Restore tampered audit log entries
app.post("/api/audit-log/restore", (req, res) => {
  try {
    const restoredCount = auditLog.restoreTamperedEntries();
    res.json({ message: "Audit log restored successfully", restoredCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Retrieve driver app view (status + history)
app.get("/api/vehicles/:vehicleId/driver-view", (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = vehicles.get(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    const history = recordsForVehicle(vehicleId);
    res.json({ vehicle, history });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Log driver dispute
app.post("/api/vehicles/:vehicleId/dispute", (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { commandId, disputeText } = req.body;
    if (!commandId || !disputeText) {
      return res.status(400).json({ error: "Missing commandId or disputeText" });
    }
    const record = commandRecords.get(commandId);
    if (!record || record.command.vehicleId !== vehicleId) {
      return res.status(404).json({ error: "Command record not found for this vehicle" });
    }

    record.disputed = true;
    record.disputeText = disputeText;
    record.updatedAt = new Date().toISOString();

    auditLog.append(
      commandId,
      "DISPUTED",
      `Driver of ${vehicleId} disputed command ${commandId.slice(0, 8)}... - Reason: "${disputeText}"`
    );

    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// DEMO ATTACK ENDPOINTS
// ============================================================================

// 9. Dispatch a tampered command (forces invalid signature)
app.post("/api/commands/tamper-demo", (req, res) => {
  try {
    const { vehicleId, issuerId } = req.body;
    if (!vehicleId || !issuerId) {
      return res.status(400).json({ error: "Missing vehicleId or issuerId" });
    }
    const result = dispatchTamperedCommand(vehicleId, issuerId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 10. Dispatch an expired command
app.post("/api/commands/expire-demo", (req, res) => {
  try {
    const { vehicleId, issuerId } = req.body;
    if (!vehicleId || !issuerId) {
      return res.status(400).json({ error: "Missing vehicleId or issuerId" });
    }
    const result = dispatchExpiredCommand(vehicleId, issuerId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 11. Replay the last command
app.post("/api/commands/replay-demo", (req, res) => {
  try {
    const { vehicleId } = req.body;
    if (!vehicleId) {
      return res.status(400).json({ error: "Missing vehicleId" });
    }
    const result = replayLastCommand(vehicleId);
    if (!result) {
      return res.status(400).json({ error: "No prior commands available to replay" });
    }
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 12. Reset all vehicle states (for clean replay of demo)
app.post("/api/vehicles/reset-demo", (req, res) => {
  try {
    // Clear all command records and audit log
    commandRecords.clear();
    
    // We have to clear audit log entries. Since auditLog doesn't expose a clear method,
    // we can use a dirty trick or just let the server restart if they want a full clean,
    // or let's reset vehicles manually and append a RESET event.
    for (const v of vehicles.values()) {
      v.immobilized = false;
      v.isMoving = false;
      v.pendingCommand = null;
    }
    
    // Let's reset TR-103 back to moving for demo
    setMotion("TR-103", true);

    // Let's re-run the initial seeding commands to bring it to a known state
    issueAndDispatch({
      vehicleId: "TR-101",
      action: "IMMOBILIZE",
      reasonCode: "maintenance",
      reasonText: "Scheduled 10,000 km battery cell balancing and safety inspection.",
      issuerId: "fin-001",
    });
    
    issueAndDispatch({
      vehicleId: "TR-101",
      action: "CANCEL",
      reasonCode: "maintenance",
      reasonText: "Inspection completed, battery pack healthy. Re-enabling drive motor.",
      issuerId: "fin-001",
    });

    issueAndDispatch({
      vehicleId: "TR-102",
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Overdue payment for cycle 14 (30 days past due). Repeated notifications ignored.",
      issuerId: "fin-001",
    });
    
    auditLog.append("SYSTEM", "ACKNOWLEDGED", "Demo state reset triggered by admin/simulator.");

    res.json({ message: "Demo state reset successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Get all vehicles
app.get("/api/vehicles", (req, res) => {
  res.json([...vehicles.values()]);
});

app.listen(PORT, () => {
  console.log(`[TrustRide] Express server running at http://localhost:${PORT}`);
});
