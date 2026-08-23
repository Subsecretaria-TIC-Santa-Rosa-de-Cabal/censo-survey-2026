import { NextResponse } from "next/server";
import { getLogoutUrl, getClientId, getLogoutRedirectUri } from "@/lib/auth/cognito";
import { deleteSession } from "@/lib/auth/session";

export async function GET(): Promise<NextResponse> {
  await deleteSession();

  const params = new URLSearchParams({
    client_id: getClientId(),
    logout_uri: getLogoutRedirectUri(),
  });

  const logoutUrl = `${getLogoutUrl()}?${params.toString()}`;
  return NextResponse.redirect(logoutUrl);
}
