import { NextRequest, NextResponse } from "next/server";
import { getTokenUrl, getClientId, getRedirectUri } from "@/lib/auth/cognito";
import {
  clearOAuthState,
  getOAuthState,
  setSession,
} from "@/lib/auth/session";
import { TokenSet } from "@/lib/auth/tokens";

interface TokenResponse {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

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
    return NextResponse.json(
      { error: "Estado de autorización inválido." },
      { status: 400 }
    );
  }

  const tokenResponse = await fetch(getTokenUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: getClientId(),
      redirect_uri: getRedirectUri(),
      code,
      code_verifier: oauthState.codeVerifier,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    console.error("Error al intercambiar código por tokens:", errorBody);
    return NextResponse.json(
      { error: "No se pudo completar el inicio de sesión." },
      { status: 500 }
    );
  }

  const data = (await tokenResponse.json()) as TokenResponse;

  const tokens: TokenSet = {
    idToken: data.id_token,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };

  await setSession(tokens);
  await clearOAuthState();

  return NextResponse.redirect(new URL("/admin", request.nextUrl));
}
