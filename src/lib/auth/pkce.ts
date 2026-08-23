import { randomBytes, createHash } from "crypto";

const CODE_VERIFIER_LENGTH = 128;

export function generateCodeVerifier(): string {
  return randomBytes(96).toString("base64url").slice(0, CODE_VERIFIER_LENGTH);
}

export function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function generateState(): string {
  return randomBytes(32).toString("base64url");
}
