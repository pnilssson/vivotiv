import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { Logger } from "next-axiom";

export async function middleware(request: NextRequest) {
  const logger = new Logger({ source: "middleware" }); // traffic, request
  logger.middleware(request);
  logger.flush();
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
