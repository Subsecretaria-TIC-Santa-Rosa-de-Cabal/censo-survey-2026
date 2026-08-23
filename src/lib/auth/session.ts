import "server-only";

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { TokenSet } from "./tokens";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "censo.session";
const STATE_COOKIE = "censo.oauth_state";
const CODE_VERIFIER_COOKIE = "censo.oauth_verifier";

export interface CookieConfig {
  domain?: string;
  secure: boolean;
}

interface SessionPayload {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

function cookieOptions(maxAgeSeconds: number, config: CookieConfig) {
  return {
    httpOnly: true,
    secure: config.secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
    ...(config.domain ? { domain: config.domain } : {}),
  };
}

export async function setSession(
  tokens: TokenSet,
  config: CookieConfig
): Promise<void> {
  const cookieStore = await cookies();
  const payload: SessionPayload = {
    idToken: tokens.idToken,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
  };

  cookieStore.set(
    SESSION_COOKIE,
    JSON.stringify(payload),
    cookieOptions(tokens.expiresIn, config)
  );
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

export async function deleteSession(config?: CookieConfig): Promise<void> {
  const cookieStore = await cookies();
  const deleteOptions = config?.domain
    ? { domain: config.domain, path: "/" }
    : { path: "/" };
  cookieStore.set(SESSION_COOKIE, "", { ...deleteOptions, maxAge: 0 });
}

export async function setOAuthState(
  state: string,
  codeVerifier: string,
  config: CookieConfig
): Promise<void> {
  const cookieStore = await cookies();
  const options = cookieOptions(600, config); // 10 minutos
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

export function getCookieConfig(request?: NextRequest): CookieConfig {
  const forwardedProto = request?.headers.get("x-forwarded-proto");
  const protocol = forwardedProto ?? request?.nextUrl.protocol.replace(":", "");
  const secure = protocol === "https" || process.env.NODE_ENV === "production";

  const host = request?.headers.get("x-forwarded-host") ?? request?.headers.get("host") ?? request?.nextUrl.host;
  let domain: string | undefined;

  if (host && host !== "localhost" && !host.includes(":3000")) {
    domain = host.split(":")[0];
  }

  return { domain, secure };
}
