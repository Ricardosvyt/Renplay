import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "renplay_session";
const SESSION_TOKEN_REGEX = /^[a-zA-Z0-9_-]{32,128}$/;

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/dev" ||
    pathname.startsWith("/dev/");

  if (protectedRoute) {
    const cookie = request.cookies.get(SESSION_COOKIE)?.value;
    if (!cookie || !SESSION_TOKEN_REGEX.test(cookie)) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      const response = NextResponse.redirect(login);
      if (cookie) {
        response.cookies.delete(SESSION_COOKIE);
      }
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dev/:path*"],
};

