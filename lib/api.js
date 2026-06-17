import { requireApiUser } from "./auth";
import { jsonError } from "./http";

export function routeError(error, fallback = "Internal Server Error.") {
  return jsonError(fallback, error?.status || 500);
}

export async function requireJsonBody(request, fields = []) {
  const body = await request.json().catch(() => ({}));
  const missing = fields.some((field) => body[field] == null || body[field] === "");
  return { ok: !missing, body };
}

export function withApiUser(handler) {
  return async function apiHandler(request, context) {
    const session = await requireApiUser();
    if (!session.ok) return session.response;
    return handler({ request, context, session, supabase: session.supabase });
  };
}
