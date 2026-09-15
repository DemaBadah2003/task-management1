import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/project", "/statistics"];
const AUTH_PATHS = ["/login", "/sign-up"];

function matches(pathname: string, paths: string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken =
    request.cookies.get("taskly_session")?.value ||
    request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isProtected = matches(pathname, PROTECTED_PATHS);
  const isAuthPage = matches(pathname, AUTH_PATHS);

  if (!isProtected && !isAuthPage) {
    return NextResponse.next();
  }

  // Already have a live session token — straightforward cases first.
  if (sessionToken) {
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/project", request.url));
    }
    return NextResponse.next();
  }

  // No session token, but a refresh_token exists. Try to silently refresh before redirecting.
  if (isProtected && refreshToken) {
    try {
      const refreshRes = await fetch(new URL("/api/auth/refresh", request.url), {
        method: "POST",
        headers: { cookie: request.headers.get("cookie") ?? "" },
      });

      if (refreshRes.ok) {
        const response = NextResponse.next();
        for (const cookie of refreshRes.headers.getSetCookie?.() ?? []) {
          response.headers.append("Set-Cookie", cookie);
        }
        return response;
      }
    } catch {
      // Ignore refresh error and fall through to redirect
    }
  }

  if (isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const middleware = proxy;

export const config = {
  matcher: ["/project/:path*", "/statistics", "/login", "/sign-up"],
};