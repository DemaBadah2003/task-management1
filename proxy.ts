import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/project"];
const AUTH_PATHS = ["/login", "/sign-up"];

function matches(pathname: string, paths: string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isProtected = matches(pathname, PROTECTED_PATHS);
  const isAuthPage = matches(pathname, AUTH_PATHS);

  if (!isProtected && !isAuthPage) {
    return NextResponse.next();
  }

  // Already have a live access_token — straightforward cases first.
  if (accessToken) {
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/project", request.url));
    }
    return NextResponse.next();
  }

  // No access_token, but a refresh_token exists (e.g. Remember Me cookie
  // survived a browser restart, and the 1h access_token has since expired).
  // Try to silently refresh before deciding the user is logged out.
  if (isProtected && refreshToken) {
    const refreshRes = await fetch(new URL("/api/auth/refresh", request.url), {
      method: "POST",
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });

    if (refreshRes.ok) {
      const response = NextResponse.next();
      // Forward the new cookies the refresh route just issued.
      for (const cookie of refreshRes.headers.getSetCookie?.() ?? []) {
        response.headers.append("Set-Cookie", cookie);
      }
      return response;
    }
  }

  if (isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/project/:path*", "/login", "/sign-up"],
};