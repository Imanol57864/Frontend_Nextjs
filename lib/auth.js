import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  getSupabaseSession,
  setAuthCookies,
  setAuthCookieStore
} from "./authSession";

export async function getSessionContext() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const session = await getSupabaseSession(accessToken, refreshToken);

  if (!session.ok) return { ok: false, supabase: null, user: null };

  setAuthCookieStore(cookieStore, session.session);

  return {
    ok: true,
    supabase: session.supabase,
    user: session.user,
    accessToken: session.session.access_token
  };
}

export async function requirePageUser() {
  const session = await getSessionContext();
  if (!session.ok) redirect("/login");
  return session;
}

export async function requireApiUser() {
  const session = await getSessionContext();
  if (session.ok) return session;

  const response = NextResponse.json(
    { message: "No autenticado.", data: [] },
    { status: 401 }
  );
  return { ok: false, response };
}

export { clearAuthCookies, setAuthCookies };
