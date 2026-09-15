import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/project", "/statistics"];
const AUTH_PATHS = ["/login", "/sign-up"];

function matches(pathname: string, paths: string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken =
    request.cookies.get("taskly_session")?.value ||
    request.cookies.get("access_token")?.value;

  const isProtected = matches(pathname, PROTECTED_PATHS);
  const isAuthPage = matches(pathname, AUTH_PATHS);

  if (!isProtected && !isAuthPage) {
    return NextResponse.next();
  }

  if (sessionToken) {
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/project", request.url));
    }
    return NextResponse.next();
  }

  if (isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/project/:path*", "/statistics", "/login", "/sign-up"],
};
