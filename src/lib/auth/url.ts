import "server-only";

import { NextRequest } from "next/server";

export function getConfiguredAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_APP_URL (e.g. https://censo.emir.gov.co)"
    );
  }
  return url.replace(/\/$/, "");
}

export function getAppUrl(request?: NextRequest): URL {
  const configuredUrl = getConfiguredAppUrl();

  if (!request) {
    return new URL(`${configuredUrl}/`);
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");

  const protocol = forwardedProto ?? request.nextUrl.protocol.replace(":", "");
  const hostname = forwardedHost ?? host ?? request.nextUrl.host;

  if (hostname && hostname !== "localhost" && !hostname.includes(":3000")) {
    return new URL(`${protocol}://${hostname}`);
  }

  return new URL(`${configuredUrl}/`);
}
