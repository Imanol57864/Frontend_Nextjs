import { createSupabaseClient } from "./supabase";

const ACCESS_TOKEN_TEST_MAX_AGE_SECONDS = 1 * 60 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 15 * 24 * 60 * 60;

export async function getSupabaseSession(accessToken, refreshToken) {
  if (!refreshToken) {
    console.warn("Auth refresh token unavailable");
    return { ok: false };
  }

  const supabase = createSupabaseClient();
  const { data, error } = accessToken
    ? await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })
    : await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

  if (error || !data?.session?.access_token || !data?.user) {
    console.warn("Auth session unavailable", {
      message: error?.message || "User unavailable"
    });
    return { ok: false };
  }

  return {
    ok: true,
    supabase,
    user: data.user,
    session: data.session
  };
}

export function setAuthCookies(response, session) {
  const options = getAuthCookieOptions();

  response.cookies.set("access_token", session.access_token, {
    ...options,
    maxAge: getAccessTokenCookieMaxAge()
  });

  response.cookies.set("refresh_token", session.refresh_token, {
    ...options,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS
  });
}

export function clearAuthCookies(response) {
  const options = getAuthCookieOptions();

  response.cookies.set("access_token", "", { ...options, maxAge: 0 });
  response.cookies.set("refresh_token", "", { ...options, maxAge: 0 });
}

export function setAuthCookieStore(cookieStore, session) {
  const options = getAuthCookieOptions();

  try {
    cookieStore.set("access_token", session.access_token, {
      ...options,
      maxAge: getAccessTokenCookieMaxAge()
    });

    cookieStore.set("refresh_token", session.refresh_token, {
      ...options,
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS
    });
  } catch {
    // Middleware refreshes cookies for page requests; route handlers can set them here.
  }
}

function getAccessTokenCookieMaxAge() {
  const configured = Number(process.env.AUTH_ACCESS_COOKIE_MAX_AGE_SECONDS);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : ACCESS_TOKEN_TEST_MAX_AGE_SECONDS;
}

function getAuthCookieOptions() {
  const appUrl = process.env.APP_URL ? new URL(process.env.APP_URL) : null;

  return {
    httpOnly: true,
    secure: appUrl ? appUrl.protocol === "https:" : process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(appUrl ? { domain: appUrl.hostname } : {})
  };
}
