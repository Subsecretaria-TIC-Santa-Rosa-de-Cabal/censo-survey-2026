import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet, JWTPayload } from "jose";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "censo.session";
const protectedRoutes = ["/admin"];
const publicRoutes = ["/api/auth/login", "/api/auth/callback", "/api/auth/logout"];

function getEnv(name: string): string | undefined {
  return process.env[name];
}

function getIssuer(): string | null {
  const region = getEnv("COGNITO_REGION");
  const userPoolId = getEnv("COGNITO_USER_POOL_ID");
  if (!region || !userPoolId) return null;
  return `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
}

function getJwksUri(): string | null {
  const issuer = getIssuer();
  return issuer ? `${issuer}/.well-known/jwks.json` : null;
}

function getClientId(): string | undefined {
  return getEnv("COGNITO_CLIENT_ID");
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    const jwksUri = getJwksUri();
    if (!jwksUri) {
      throw new Error("Missing Cognito configuration for JWKS");
    }
    jwks = createRemoteJWKSet(new URL(jwksUri), {
      cooldownDuration: 86400000,
      cacheMaxAge: 86400000,
    });
  }
  return jwks;
}

async function validateSession(request: NextRequest): Promise<JWTPayload | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    console.log("[proxy] no session cookie found");
    return null;
  }

  let idToken: string;
  try {
    const payload = JSON.parse(sessionCookie.value);
    idToken = payload.idToken;
    if (!idToken) {
      console.log("[proxy] session cookie has no idToken");
      return null;
    }
  } catch {
    console.log("[proxy] failed to parse session cookie");
    return null;
  }

  const issuer = getIssuer();
  const clientId = getClientId();
  if (!issuer || !clientId) {
    console.error("[proxy] missing Cognito configuration");
    return null;
  }

  try {
    const { payload } = await jwtVerify(idToken, getJwks(), {
      issuer,
      audience: clientId,
      algorithms: ["RS256"],
    });

    if (payload.exp && Date.now() >= (payload.exp - 60) * 1000) {
      console.log("[proxy] session token expired");
      return null;
    }

    return payload;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[proxy] jwt verification failed:", message);
    return null;
  }
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function getAppUrl(request: NextRequest): URL {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");

  const protocol = forwardedProto ?? request.nextUrl.protocol.replace(":", "");
  const hostname = forwardedHost ?? host ?? request.nextUrl.host;

  return new URL(`${protocol}://${hostname}`);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  try {
    const { pathname } = request.nextUrl;
    const appUrl = getAppUrl(request);

    console.log(`[proxy] raw request.url:`, request.url);
    console.log(`[proxy] computed appUrl:`, appUrl.toString());
    console.log(`[proxy] checking route: ${pathname}`);

    if (isPublicRoute(pathname)) {
      console.log(`[proxy] public auth route, passing through`);
      return NextResponse.next();
    }

    if (!isProtectedRoute(pathname)) {
      return NextResponse.next();
    }

    console.log(`[proxy] protected route, validating session...`);
    const session = await validateSession(request);
    if (!session) {
      console.log(`[proxy] no valid session, redirecting to login`);
      const loginUrl = new URL("/api/auth/login", appUrl);
      return NextResponse.redirect(loginUrl);
    }

    console.log(`[proxy] valid session, passing through`);
    return NextResponse.next();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[proxy] unhandled error:", message);
    if (stack) console.error("[proxy] stack:", stack);

    // En caso de error crítico, redirigir a login en lugar de dejar crashear
    const appUrl = getAppUrl(request);
    const loginUrl = new URL("/api/auth/login", appUrl);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.svg$).*)",
  ],
};
