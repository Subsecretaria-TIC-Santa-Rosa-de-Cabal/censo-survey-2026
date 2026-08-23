import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet, JWTPayload } from "jose";

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
  const sessionCookie = request.cookies.get("censo.session");
  if (!sessionCookie?.value) return null;

  let idToken: string;
  try {
    const payload = JSON.parse(sessionCookie.value);
    idToken = payload.idToken;
    if (!idToken) return null;
  } catch {
    return null;
  }

  const issuer = getIssuer();
  const clientId = getClientId();
  if (!issuer || !clientId) return null;

  try {
    const { payload } = await jwtVerify(idToken, getJwks(), {
      issuer,
      audience: clientId,
      algorithms: ["RS256"],
    });

    if (payload.exp && Date.now() >= (payload.exp - 60) * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Si ya está en una ruta pública de auth, no hacemos nada
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const session = await validateSession(request);
  if (!session) {
    const loginUrl = new URL("/api/auth/login", request.nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.svg$).*)",
  ],
};
