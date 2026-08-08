/**
 * Vehicle simulator — stands in for real telemetry (GPS/CAN speed signal).
 * The demo's motion toggle lands here. When a vehicle stops, any held command
 * is immediately re-checked; a 1s background sweep also expires held commands
 * whose window lapsed while the vehicle kept moving.
 */
import { vehicles, getVehicle, pendingMultiSigCommands } from "../models/store.js";
import { vehicleVerifier } from "../engine/verifier.js";
import { auditLog } from "../audit/auditLog.js";
import type { Vehicle, VerificationResult } from "../models/types.js";

export function registerVehicle(vehicleId: string, driverName: string, metadata?: Partial<Vehicle>): Vehicle {
  const v: Vehicle = {
    vehicleId,
    driverName,
    isMoving: false,
    immobilized: false,
    pendingCommand: null,
    id: vehicleId,
    ...metadata,
  };
  vehicles.set(vehicleId, v);
  return v;
}

export function setMotion(
  vehicleId: string,
  isMoving: boolean
): { vehicle: Vehicle; recheck: VerificationResult | null } {
  const vehicle = getVehicle(vehicleId) || vehicles.get(vehicleId);
  if (!vehicle) throw new Error(`Unknown vehicle '${vehicleId}'`);
  if (isMoving && vehicle.immobilized) {
    // An immobilized vehicle cannot start moving — that's the point of it.
    throw new Error(`Vehicle ${vehicleId} is immobilized and cannot move (send a CANCEL first)`);
  }
  const changed = vehicle.isMoving !== isMoving;
  vehicle.isMoving = isMoving;

  let recheck: VerificationResult | null = null;
  if (changed && !isMoving && vehicle.pendingCommand) {
    // Vehicle just stopped with a held command — the interlock releases.
    recheck = vehicleVerifier.recheckPending(vehicleId);
  }
  return { vehicle, recheck };
}

// Hyderabad Cable Bridge Road Loop Waypoints for Sargam EV
const HYDERABAD_WAYPOINTS = [
  { lat: 17.4239, lng: 78.3826, address: "Durgam Cheruvu Cable Bridge, Hyderabad" },
  { lat: 17.4265, lng: 78.3860, address: "Knowledge City Main Rd, Hyderabad" },
  { lat: 17.4310, lng: 78.3895, address: "HITEC City Flyover, Hyderabad" },
  { lat: 17.4380, lng: 78.3810, address: "Cyber Towers Junction, Hyderabad" },
  { lat: 17.4420, lng: 78.3750, address: "Mindspace IT Park, Hyderabad" },
];
let currentWaypointIndex = 0;

/** Background sweep: expire held commands whose window lapsed while moving,
 *  purge stale pending multi-sig entries, and update moving vehicle GPS. */
export function startExpirySweep(intervalMs = 1000): NodeJS.Timeout {
  const timer = setInterval(() => {
    // Expire held single commands on vehicles
    for (const v of vehicles.values()) {
      if (v.pendingCommand && new Date(v.pendingCommand.expiresAt).getTime() <= Date.now()) {
        vehicleVerifier.recheckPending(v.vehicleId); // logs REJECTED/EXPIRED itself
      }
    }
    // Purge expired pending multi-sig entries
    for (const [entryId, entry] of pendingMultiSigCommands) {
      if (new Date(entry.expiresAt).getTime() <= Date.now()) {
        pendingMultiSigCommands.delete(entryId);
        auditLog.append(
          entryId,
          "REJECTED",
          `[MULTISIG] Co-authorization window lapsed (5 min window expired) — partial 1-of-2 command for ${entry.vehicleId} discarded by sweep`
        );
      }
    }

    // Actively moving vehicles (TR-101 and TR-102) continuously update GPS telemetry
    currentWaypointIndex = (currentWaypointIndex + 1) % HYDERABAD_WAYPOINTS.length;
    const wp1 = HYDERABAD_WAYPOINTS[currentWaypointIndex];

    const tr101 = getVehicle("TR-101");
    if (tr101 && tr101.isMoving && !tr101.immobilized) {
      tr101.speed = 25;
      tr101.status = "active";
      tr101.location = { lat: wp1.lat, lng: wp1.lng, address: wp1.address };
    }

    const tr102 = getVehicle("TR-102");
    if (tr102 && tr102.isMoving && !tr102.immobilized) {
      tr102.speed = 28;
      tr102.status = "active";
      const wp2 = HYDERABAD_WAYPOINTS[(currentWaypointIndex + 2) % HYDERABAD_WAYPOINTS.length];
      tr102.location = { lat: wp2.lat, lng: wp2.lng, address: wp2.address };
    }
  }, intervalMs);
  timer.unref();
  return timer;
}
