import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { getSession } from "./session";
import { verifyIdToken, CognitoIdTokenPayload, isTokenExpired } from "./tokens";

export interface SessionUser {
  sub: string;
  email?: string;
  name?: string;
}

export const verifySession = cache(async (): Promise<SessionUser> => {
  const session = await getSession();

  if (!session) {
    redirect("/api/auth/login");
  }

  let payload: CognitoIdTokenPayload;
  try {
    payload = await verifyIdToken(session.idToken);
  } catch {
    redirect("/api/auth/login");
  }

  if (isTokenExpired(payload.exp)) {
    redirect("/api/auth/login");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.given_name ?? payload.family_name,
  };
});

export async function requireAuth(): Promise<SessionUser> {
  return verifySession();
}

export async function getOptionalSession(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const payload = await verifyIdToken(session.idToken);
    if (isTokenExpired(payload.exp)) return null;

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.given_name ?? payload.family_name,
    };
  } catch {
    return null;
  }
}
