import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function redirectIfAuthenticated(request: NextRequest) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (data.user && pathname === "/") {
    return NextResponse.redirect(new URL("/programs", request.url));
  }

  return NextResponse.next();
}
