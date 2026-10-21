import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "renplay_session";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/") || pathname === "/dev" || pathname.startsWith("/dev/");

  if (protectedRoute && !request.cookies.get(SESSION_COOKIE)?.value) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dev/:path*"],
};
