import { NextResponse } from "next/server";
import { getPublicUrl } from "@/lib/requestUrl";

export async function GET(request) {
  const response = NextResponse.redirect(getPublicUrl(request, "/login"), { status: 303 });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}
