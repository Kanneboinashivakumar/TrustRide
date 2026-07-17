import assert from "node:assert";

// Set test port before importing server
process.env.PORT = "4001";

console.log("[Test] Starting backend server on port 4001...");
await import("../src/server.js");

const API_BASE = "http://localhost:4001/api";

// Helper for HTTP requests
async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request to ${url} failed with status ${response.status}: ${text}`);
  }
  return response.json();
}

async function runTests() {
  console.log("\n========================================================");
  console.log("RUNNING TRUSTRIDE API-LEVEL SCENARIO TESTS");
  console.log("========================================================\n");

  // Reset demo state first to have clean starting conditions
  console.log("[Test] Resetting demo state...");
  await request("/vehicles/reset-demo", { method: "POST" });

  // --------------------------------------------------------------------------
  // Scenario 1: Financier submits shutdown request on moving vehicle → HELD
  // --------------------------------------------------------------------------
  console.log("[Scenario 1] Dispatching command on moving vehicle (TR-103)...");
  
  // Verify TR-103 is moving
  const vehicles = await request("/vehicles");
  const tr103 = vehicles.find((v: any) => v.vehicleId === "TR-103");
  assert.ok(tr103, "TR-103 should exist");
  assert.strictEqual(tr103.isMoving, true, "TR-103 should be moving");

  // Dispatch IMMOBILIZE
  const cmdResponse = await request("/commands", {
    method: "POST",
    body: JSON.stringify({
      vehicleId: "TR-103",
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Missed payment, moving vehicle remote immobilization hold",
      issuerId: "fin-001",
    }),
  });

  assert.strictEqual(cmdResponse.result.outcome, "HELD", "Outcome should be HELD");
  assert.strictEqual(cmdResponse.result.failedCheck, null, "No checks should fail");
  console.log("✓ Success: Command held on moving vehicle.");

  // --------------------------------------------------------------------------
  // Scenario 2: Vehicle stops → HELD command executes automatically
  // --------------------------------------------------------------------------
  console.log("\n[Scenario 2] Stopping vehicle TR-103 to trigger interlock release...");
  
  const motionResponse = await request("/vehicles/TR-103/motion", {
    method: "POST",
    body: JSON.stringify({ isMoving: false }),
  });

  assert.strictEqual(motionResponse.vehicle.isMoving, false, "Vehicle should no longer be moving");
  assert.strictEqual(motionResponse.vehicle.immobilized, true, "Vehicle should now be immobilized");
  assert.ok(motionResponse.recheck, "Recheck outcome should be returned");
  assert.strictEqual(motionResponse.recheck.outcome, "EXECUTED", "Recheck outcome should be EXECUTED");
  console.log("✓ Success: Held command executed automatically once vehicle stopped.");

  // --------------------------------------------------------------------------
  // Scenario 3: Tampered command is rejected (signature invalid)
  // --------------------------------------------------------------------------
  console.log("\n[Scenario 3] Sending a tampered command payload...");
  
  const tamperResponse = await request("/commands/tamper-demo", {
    method: "POST",
    body: JSON.stringify({
      vehicleId: "TR-101",
      issuerId: "fin-001",
    }),
  });

  assert.strictEqual(tamperResponse.result.outcome, "REJECTED", "Tampered command must be REJECTED");
  assert.strictEqual(tamperResponse.result.failedCheck, "SIGNATURE", "Rejection cause must be SIGNATURE");
  console.log("✓ Success: Tampered signature command rejected.");

  // --------------------------------------------------------------------------
  // Scenario 4: Expired command is rejected
  // --------------------------------------------------------------------------
  console.log("\n[Scenario 4] Sending an expired command...");

  const expireResponse = await request("/commands/expire-demo", {
    method: "POST",
    body: JSON.stringify({
      vehicleId: "TR-101",
      issuerId: "fin-001",
    }),
  });

  assert.strictEqual(expireResponse.result.outcome, "REJECTED", "Expired command must be REJECTED");
  assert.strictEqual(expireResponse.result.failedCheck, "EXPIRY", "Rejection cause must be EXPIRY");
  console.log("✓ Success: Expired command rejected.");

  // --------------------------------------------------------------------------
  // Scenario 5: Replayed command is rejected
  // --------------------------------------------------------------------------
  console.log("\n[Scenario 5] Replaying the last valid command...");

  // Send a valid command to TR-101 first (stationary)
  const validResponse = await request("/commands", {
    method: "POST",
    body: JSON.stringify({
      vehicleId: "TR-101",
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Payment default replay test base",
      issuerId: "fin-001",
    }),
  });
  assert.strictEqual(validResponse.result.outcome, "EXECUTED", "Pre-requisite valid command should execute");

  // Replay it verbatim
  const replayResponse = await request("/commands/replay-demo", {
    method: "POST",
    body: JSON.stringify({
      vehicleId: "TR-101",
    }),
  });

  assert.strictEqual(replayResponse.result.outcome, "REJECTED", "Replayed command must be REJECTED");
  assert.strictEqual(replayResponse.result.failedCheck, "REPLAY", "Rejection cause must be REPLAY");
  console.log("✓ Success: Replayed command rejected.");

  // --------------------------------------------------------------------------
  // Scenario 6: Driver sees the request and can dispute it
  // --------------------------------------------------------------------------
  console.log("\n[Scenario 6] Filing a driver dispute against command...");

  // Fetch TR-101 driver view
  const tr101ViewBefore = await request("/vehicles/TR-101/driver-view");
  const commandToDispute = tr101ViewBefore.history[0]; // Last executed command
  assert.ok(commandToDispute, "TR-101 should have a command in history");

  // File dispute
  const disputeText = "Payment was sent 2 hours ago. Txn ID: TXN84910283.";
  const disputeResponse = await request("/vehicles/TR-101/dispute", {
    method: "POST",
    body: JSON.stringify({
      commandId: commandToDispute.command.commandId,
      disputeText,
    }),
  });

  assert.strictEqual(disputeResponse.disputed, true, "Record should be marked as disputed");
  assert.strictEqual(disputeResponse.disputeText, disputeText, "Dispute text should match");

  // Check driver-view updates
  const tr101ViewAfter = await request("/vehicles/TR-101/driver-view");
  const updatedCommand = tr101ViewAfter.history.find(
    (h: any) => h.command.commandId === commandToDispute.command.commandId
  );
  assert.strictEqual(updatedCommand.disputed, true, "Driver view should show dispute status");
  
  // Verify audit log has the DISPUTED event
  const logAfterDispute = await request("/audit-log");
  const disputeLogEntry = logAfterDispute.entries.find((e: any) => e.eventType === "DISPUTED");
  assert.ok(disputeLogEntry, "Audit log should contain a DISPUTED entry");
  assert.ok(disputeLogEntry.detail.includes(disputeText), "Audit log detail should contain dispute text");
  console.log("✓ Success: Dispute logged and reflected on Driver view + Audit chain.");

  // --------------------------------------------------------------------------
  // Scenario 7: Audit log chain validation and tampering breaking demo
  // --------------------------------------------------------------------------
  console.log("\n[Scenario 7] Checking audit log integrity and tampering simulation...");

  // Get initial log - should be healthy
  const initialLog = await request("/audit-log");
  assert.strictEqual(initialLog.chainIntact, true, "Initial chain must be intact");
  console.log(`✓ Initial log chain intact. Total entries: ${initialLog.entries.length}`);

  // Tamper with the log
  console.log("[Test] Mutating a historical entry...");
  const tamperResult = await request("/audit-log/tamper-demo", { method: "POST" });
  assert.ok(tamperResult.tampered, "Tamper response should return the tampered entry");

  // Check integrity again - should be broken
  const tamperedLog = await request("/audit-log");
  assert.strictEqual(tamperedLog.chainIntact, false, "Audit chain must report broken");
  assert.notStrictEqual(tamperedLog.firstBrokenIndex, null, "Broken index must be specified");
  console.log(`✓ Audit chain successfully detected tampering at entry index ${tamperedLog.firstBrokenIndex}`);

  // Restore the log
  console.log("[Test] Restoring audit log...");
  const restoreResult = await request("/audit-log/restore", { method: "POST" });
  assert.strictEqual(restoreResult.restoredCount, 1, "Should restore 1 entry");

  // Check integrity again - should be healthy
  const restoredLog = await request("/audit-log");
  assert.strictEqual(restoredLog.chainIntact, true, "Restored chain must be intact again");
  console.log("✓ Success: Tampered log successfully broke chain, restoration fixed it.");

  console.log("\n========================================================");
  console.log("ALL 7 SCENARIOS PASSED API-LEVEL VERIFICATION");
  console.log("========================================================\n");
  
  process.exit(0);
}

runTests().catch((err) => {
  console.error("\n❌ TESTS FAILED:", err);
  process.exit(1);
});
