import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const authRoutes: string[] = [];
const protectedRoutes = ["/checkout"];

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const sessionCookie = getSessionCookie(request);

  const res = NextResponse.next();

  const isLoggedIn = !!sessionCookie;
  const isOnAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isOnProtectedRoute = nextUrl.pathname.startsWith("/account") || protectedRoutes.includes(nextUrl.pathname);
  const isOnAdminRoute = nextUrl.pathname.startsWith("/admin");

  if ((isOnAdminRoute || isOnProtectedRoute) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
