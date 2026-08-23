import { NextRequest, NextResponse } from "next/server";
import {
  getTokenUrl,
  getClientId,
  getRedirectUri,
  getClientSecret,
} from "@/lib/auth/cognito";
import {
  clearOAuthState,
  getOAuthState,
  setSession,
} from "@/lib/auth/session";
import { TokenSet } from "@/lib/auth/tokens";
import { getAppUrl } from "@/lib/auth/url";

interface TokenResponse {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

function getRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = getRequestId();

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    console.log(`[Cognito callback ${requestId}] request.url:`, request.url);
    console.log(`[Cognito callback ${requestId}] request.nextUrl.href:`, request.nextUrl.href);
    console.log(`[Cognito callback ${requestId}] request.nextUrl.search:`, request.nextUrl.search);
    console.log(
      `[Cognito callback ${requestId}] received code=${code?.slice(0, 8)}... state=${state?.slice(0, 8)}...`
    );

    if (error) {
      return NextResponse.json(
        { error: errorDescription ?? error },
        { status: 400 }
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: "Faltan parámetros de autorización." },
        { status: 400 }
      );
    }

    const oauthState = await getOAuthState();
    if (!oauthState || oauthState.state !== state) {
      console.error(
        `[Cognito callback ${requestId}] state mismatch: expected=${oauthState?.state.slice(0, 8)}... received=${state.slice(0, 8)}...`
      );
      return NextResponse.json(
        { error: "Estado de autorización inválido." },
        { status: 400 }
      );
    }

    const redirectUri = getRedirectUri();
    const tokenParams: Record<string, string> = {
      grant_type: "authorization_code",
      client_id: getClientId(),
      redirect_uri: redirectUri,
      code,
      code_verifier: oauthState.codeVerifier,
    };

    const clientSecret = getClientSecret();
    if (clientSecret) {
      tokenParams.client_secret = clientSecret;
    }

    const body = new URLSearchParams(tokenParams).toString();

    console.log(`[Cognito callback ${requestId}] token endpoint:`, getTokenUrl());
    console.log(`[Cognito callback ${requestId}] redirect_uri:`, redirectUri);
    console.log(
      `[Cognito callback ${requestId}] client_id:`,
      getClientId().slice(0, 8) + "..."
    );
    console.log(
      `[Cognito callback ${requestId}] code_verifier length:`,
      oauthState.codeVerifier.length
    );
    console.log(
      `[Cognito callback ${requestId}] state matches:`,
      oauthState.state === state
    );
    console.log(
      `[Cognito callback ${requestId}] has client_secret:`,
      Boolean(clientSecret)
    );
    console.log(
      `[Cognito callback ${requestId}] request body length:`,
      body.length
    );

    const tokenResponse = await fetch(getTokenUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error(
        `[Cognito callback ${requestId}] token error (${tokenResponse.status}):`,
        errorBody
      );
      console.error(
        `[Cognito callback ${requestId}] request body sent:`,
        body.replace(oauthState.codeVerifier, "[REDACTED]")
      );
      return NextResponse.json(
        { error: "No se pudo completar el inicio de sesión." },
        { status: 500 }
      );
    }

    const data = (await tokenResponse.json()) as TokenResponse;
    console.log(
      `[Cognito callback ${requestId}] tokens exchanged successfully`
    );

    const tokens: TokenSet = {
      idToken: data.id_token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };

    console.log(`[Cognito callback ${requestId}] setting session cookie...`);
    await setSession(tokens);
    console.log(`[Cognito callback ${requestId}] session cookie set`);

    console.log(`[Cognito callback ${requestId}] clearing oauth state...`);
    await clearOAuthState();
    console.log(`[Cognito callback ${requestId}] oauth state cleared`);

    const appUrl = getAppUrl(request);
    const redirectUrl = new URL("/admin", appUrl);
    console.log(
      `[Cognito callback ${requestId}] redirecting to:`,
      redirectUrl.toString()
    );

    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error(`[Cognito callback ${requestId}] unhandled error:`, message);
    if (stack) {
      console.error(`[Cognito callback ${requestId}] stack:`, stack);
    }

    return NextResponse.json(
      { error: "Error interno al procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}
