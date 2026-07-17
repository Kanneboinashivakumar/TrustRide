import { strict as assert } from "node:assert";

async function runHealthCheck() {
  console.log("========================================================");
  console.log("RUNNING TRUSTRIDE SYSTEM HEALTH VERIFICATION");
  console.log("========================================================");

  // 1. Verify Backend root
  try {
    console.log("[Health] Checking backend root at http://localhost:4000/...");
    const res = await fetch("http://localhost:4000/");
    assert.equal(res.status, 200);
    const data = await res.json() as any;
    assert.equal(data.status, "online");
    console.log("✓ Backend root is ONLINE and returning status JSON.");
  } catch (err: any) {
    console.error("❌ Backend root check failed:", err.message);
    process.exit(1);
  }

  // 2. Verify Backend vehicles API
  try {
    console.log("[Health] Checking backend API at http://localhost:4000/api/vehicles...");
    const res = await fetch("http://localhost:4000/api/vehicles");
    assert.equal(res.status, 200);
    const data = await res.json() as any[];
    assert(Array.isArray(data));
    assert.equal(data.length, 3);
    console.log(`✓ Backend API is healthy. Found ${data.length} pre-seeded vehicles.`);
  } catch (err: any) {
    console.error("❌ Backend API check failed:", err.message);
    process.exit(1);
  }

  // 3. Verify Frontend dev server
  try {
    console.log("[Health] Checking frontend at http://localhost:3000/...");
    const res = await fetch("http://localhost:3000/");
    assert.equal(res.status, 200);
    console.log("✓ Frontend dev server is ONLINE and serving index page.");
  } catch (err: any) {
    console.error("❌ Frontend check failed:", err.message);
    process.exit(1);
  }

  console.log("========================================================");
  console.log("ALL HEALTH CHECKS COMPLETED SUCCESSFULLY - SYSTEM ACTIVE");
  console.log("========================================================");
}

runHealthCheck();
