import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://pwxmbbdntmvsiiyzhlmh.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_chMoTDsN_gy2m1MK0KbCmA_GBICEBn9";

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body as {
      email?: string;
      password?: string;
      rememberMe?: boolean;
    };

    if (!email || !password) {
      return NextResponse.json(
        { message: "Please provide email and password." },
        { status: 400 }
      );
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.error_description || data?.message || "Invalid email or password." },
        { status: response.status }
      );
    }

    // Return the raw Supabase token payload — matches LoginSuccessResponse
    // as consumed by src/lib/api/auth.ts (no {success, data} wrapper).
    const res = NextResponse.json(data, { status: response.status });

    const isProd = process.env.NODE_ENV === "production";
    const accessTokenMaxAge = typeof data.expires_in === "number" ? data.expires_in : 3600;

    // access_token: always short-lived, matches Supabase's own expiry.
    res.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: accessTokenMaxAge,
    });

    // refresh_token: long-lived (30 days) only when Remember Me is checked,
    // otherwise a browser-session cookie (cleared on close) — this is what
    // /api/auth/refresh reads to silently mint a new access_token later.
    res.cookies.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      ...(rememberMe ? { maxAge: THIRTY_DAYS_IN_SECONDS } : {}),
    });

    // A small non-secret flag so /api/auth/refresh knows whether to keep
    // re-issuing a 30-day refresh_token or a session-only one.
    if (rememberMe) {
      res.cookies.set("remember_me", "1", {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: THIRTY_DAYS_IN_SECONDS,
      });
    } else {
      res.cookies.delete("remember_me");
    }

    return res;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}