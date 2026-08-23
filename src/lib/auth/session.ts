import "server-only";

import { cookies } from "next/headers";
import { TokenSet } from "./tokens";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "censo.session";
const STATE_COOKIE = "censo.oauth_state";
const CODE_VERIFIER_COOKIE = "censo.oauth_verifier";

const isSecure = process.env.NODE_ENV === "production";

interface SessionPayload {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function setSession(tokens: TokenSet): Promise<void> {
  const cookieStore = await cookies();
  const payload: SessionPayload = {
    idToken: tokens.idToken,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
  };

  cookieStore.set(SESSION_COOKIE, JSON.stringify(payload), cookieOptions(tokens.expiresIn));
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie?.value) return null;

  try {
    return JSON.parse(cookie.value) as SessionPayload;
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function setOAuthState(state: string, codeVerifier: string): Promise<void> {
  const cookieStore = await cookies();
  const options = cookieOptions(600); // 10 minutos
  cookieStore.set(STATE_COOKIE, state, options);
  cookieStore.set(CODE_VERIFIER_COOKIE, codeVerifier, options);
}

export async function getOAuthState(): Promise<{ state: string; codeVerifier: string } | null> {
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(STATE_COOKIE);
  const verifierCookie = cookieStore.get(CODE_VERIFIER_COOKIE);

  if (!stateCookie?.value || !verifierCookie?.value) return null;

  return {
    state: stateCookie.value,
    codeVerifier: verifierCookie.value,
  };
}

export async function clearOAuthState(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(STATE_COOKIE);
  cookieStore.delete(CODE_VERIFIER_COOKIE);
}
