import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("auth-session");
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
