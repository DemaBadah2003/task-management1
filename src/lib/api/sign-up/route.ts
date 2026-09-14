import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, data } = body as {
      email?: string;
      password?: string;
      data?: { name?: string; job_title?: string };
    };

    const name = data?.name;
    const jobTitle = data?.job_title;

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Please provide name, email and password." },
        { status: 400 }
      );
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          name,
          ...(jobTitle ? { job_title: jobTitle } : {}),
        },
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: responseData?.error_description || responseData?.message || "Failed to sign up." },
        { status: response.status }
      );
    }

    // Per spec: success just redirects to /login — no session is created
    // here, so we don't set any cookies even if Supabase happens to return
    // a session (e.g. when email confirmation is disabled).
    return NextResponse.json(responseData, { status: response.status });
  } catch (error: any) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}