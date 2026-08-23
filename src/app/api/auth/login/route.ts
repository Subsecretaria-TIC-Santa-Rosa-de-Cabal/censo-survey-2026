import { NextRequest, NextResponse } from "next/server";
import {
  getAuthorizeUrl,
  getClientId,
  getRedirectUri,
} from "@/lib/auth/cognito";
import { generateCodeVerifier, generateCodeChallenge, generateState } from "@/lib/auth/pkce";
import { getCookieConfig, setOAuthState } from "@/lib/auth/session";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const cookieConfig = getCookieConfig(request);
  await setOAuthState(state, codeVerifier, cookieConfig);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: getClientId(),
    redirect_uri: getRedirectUri(),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: "openid email profile",
  });

  const authorizationUrl = `${getAuthorizeUrl()}?${params.toString()}`;
  return NextResponse.redirect(authorizationUrl);
}
