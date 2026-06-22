import { NextResponse } from "next/server";
import { getPublicUrl } from "@/lib/requestUrl";
import { clearAuthCookies } from "@/lib/auth";

export async function POST(request) {
  const response = NextResponse.redirect(getPublicUrl(request, "/login"), { status: 303 });
  clearAuthCookies(response);
  return response;
}

export function GET() {
  return NextResponse.json(
    { message: "Method not allowed." },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } }
  );
}
