import "server-only";

import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import { getClientId, getIssuer, getJwksUri } from "./cognito";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(getJwksUri()), {
      cooldownDuration: 86400000, // 24 horas
      cacheMaxAge: 86400000,
    });
  }
  return jwks;
}

export interface CognitoIdTokenPayload extends JWTPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  "cognito:username"?: string;
}

export interface TokenSet {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}

export async function verifyIdToken(
  idToken: string
): Promise<CognitoIdTokenPayload> {
  const { payload } = await jwtVerify(idToken, getJwks(), {
    issuer: getIssuer(),
    audience: getClientId(),
    algorithms: ["RS256"],
  });

  return payload as CognitoIdTokenPayload;
}

export async function verifyAccessToken(
  accessToken: string
): Promise<JWTPayload> {
  const { payload } = await jwtVerify(accessToken, getJwks(), {
    issuer: getIssuer(),
    algorithms: ["RS256"],
  });

  return payload;
}

export function isTokenExpired(exp?: number): boolean {
  if (!exp) return true;
  // Consideramos expirado 60 segundos antes para evitar edge cases
  return Date.now() >= (exp - 60) * 1000;
}
