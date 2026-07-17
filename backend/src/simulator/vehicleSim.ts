/**
 * Vehicle simulator — stands in for real telemetry (GPS/CAN speed signal).
 * The demo's motion toggle lands here. When a vehicle stops, any held command
 * is immediately re-checked; a 1s background sweep also expires held commands
 * whose window lapsed while the vehicle kept moving.
 */
import { vehicles } from "../models/store.js";
import { vehicleVerifier } from "../engine/verifier.js";
import type { Vehicle, VerificationResult } from "../models/types.js";

export function registerVehicle(vehicleId: string, driverName: string): Vehicle {
  const v: Vehicle = {
    vehicleId,
    driverName,
    isMoving: false,
    immobilized: false,
    pendingCommand: null,
  };
  vehicles.set(vehicleId, v);
  return v;
}

/**
 * Demo control: toggle the motion signal. Returns the re-check result if a
 * held command resolved (executed/expired) because of this change.
 */
export function setMotion(
  vehicleId: string,
  isMoving: boolean
): { vehicle: Vehicle; recheck: VerificationResult | null } {
  const vehicle = vehicles.get(vehicleId);
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

/** Background sweep: expire held commands whose window lapsed while moving. */
export function startExpirySweep(intervalMs = 1000): NodeJS.Timeout {
  const timer = setInterval(() => {
    for (const v of vehicles.values()) {
      if (v.pendingCommand && new Date(v.pendingCommand.expiresAt).getTime() <= Date.now()) {
        vehicleVerifier.recheckPending(v.vehicleId); // logs REJECTED/EXPIRED itself
      }
    }
  }, intervalMs);
  timer.unref(); // never keep the process alive just for the sweep
  return timer;
}
