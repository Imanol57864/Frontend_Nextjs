import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SUPABASE_URL), { status: 303 });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}
