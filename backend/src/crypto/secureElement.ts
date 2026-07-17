/**
 * SIMULATED Secure Element / HSM (software-only, PKCS#11-style in spirit).
 *
 * In production this would be a hardware-backed key store (HSM on the financier
 * side, Secure Element on the vehicle side). Here it is a software simulation —
 * the UI labels it as such everywhere it appears (see ARCHITECTURE.md
 * "Honest representation of simulated components").
 *
 * Key property preserved by this design: PRIVATE KEYS NEVER LEAVE THIS MODULE.
 * Callers can ask it to sign a payload under a holder's identity, or fetch a
 * holder's PUBLIC key, but nothing else in the codebase can touch a private key.
 * That is what makes "the backend is not trusted" honest even in a simulation:
 * the backend cannot mint a valid signature for an identity it doesn't control —
 * it must go through this module, and every signing operation is attributable
 * to a specific key holder.
 */
import {
  generateKeyPairSync,
  createSign,
  createVerify,
  type KeyObject,
} from "node:crypto";

interface KeyPairSlot {
  privateKey: KeyObject; // never exported
  publicKeyPem: string;
  holderLabel: string;
}

const SIGN_ALGO = "SHA256"; // ECDSA over P-256 with SHA-256

class SimulatedSecureElement {
  private slots = new Map<string, KeyPairSlot>();

  /** Provision an ECDSA P-256 keypair for an identity (factory/onboarding step). */
  provision(holderId: string, holderLabel: string): void {
    if (this.slots.has(holderId)) return; // idempotent
    const { privateKey, publicKey } = generateKeyPairSync("ec", {
      namedCurve: "P-256",
    });
    this.slots.set(holderId, {
      privateKey,
      publicKeyPem: publicKey.export({ type: "spki", format: "pem" }).toString(),
      holderLabel,
    });
  }

  /** Sign a payload under a holder's identity. Throws if the holder has no key. */
  sign(holderId: string, payload: string): string {
    const slot = this.slots.get(holderId);
    if (!slot) throw new Error(`SecureElement: no key provisioned for '${holderId}'`);
    const signer = createSign(SIGN_ALGO);
    signer.update(payload, "utf8");
    return signer.sign(slot.privateKey, "base64");
  }

  /** Public key export — this is what gets baked into the vehicle's trust store. */
  getPublicKeyPem(holderId: string): string {
    const slot = this.slots.get(holderId);
    if (!slot) throw new Error(`SecureElement: no key provisioned for '${holderId}'`);
    return slot.publicKeyPem;
  }

  listHolders(): { holderId: string; holderLabel: string }[] {
    return [...this.slots.entries()].map(([holderId, s]) => ({
      holderId,
      holderLabel: s.holderLabel,
    }));
  }
}

/** Stateless signature verification — usable by anyone holding a public key. */
export function verifySignature(
  publicKeyPem: string,
  payload: string,
  signatureB64: string
): boolean {
  try {
    const verifier = createVerify(SIGN_ALGO);
    verifier.update(payload, "utf8");
    return verifier.verify(publicKeyPem, signatureB64, "base64");
  } catch {
    return false; // malformed signature = invalid, never an exception path
  }
}

/** Singleton — one simulated secure element for the whole demo process. */
export const secureElement = new SimulatedSecureElement();
