import { NextResponse } from "next/server";
import { getSupabaseSession, setAuthCookies } from "./lib/authSession";

export async function middleware(request) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) return NextResponse.next();

  const result = await getSupabaseSession(accessToken, refreshToken);
  if (!result.ok) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Cookie", buildForwardedCookieHeader(request, result.session));

  const response = NextResponse.next({
    request: { headers: requestHeaders }
  });
  setAuthCookies(response, result.session);
  return response;
}

export const config = {
  matcher: ["/main_catalog/:path*", "/api/:path*"]
};

function buildForwardedCookieHeader(request, session) {
  const values = new Map(
    request.cookies.getAll().map((cookie) => [cookie.name, cookie.value])
  );

  values.set("access_token", session.access_token);
  values.set("refresh_token", session.refresh_token);

  return Array.from(values)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}
