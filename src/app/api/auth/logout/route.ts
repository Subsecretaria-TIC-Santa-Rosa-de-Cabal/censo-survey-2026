import { NextRequest, NextResponse } from "next/server";
import { getLogoutUrl, getClientId, getLogoutRedirectUri } from "@/lib/auth/cognito";
import { deleteSession, getCookieConfig } from "@/lib/auth/session";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const cookieConfig = getCookieConfig(request);
  await deleteSession(cookieConfig);

  const params = new URLSearchParams({
    client_id: getClientId(),
    logout_uri: getLogoutRedirectUri(),
  });

  const logoutUrl = `${getLogoutUrl()}?${params.toString()}`;
  return NextResponse.redirect(logoutUrl);
}
