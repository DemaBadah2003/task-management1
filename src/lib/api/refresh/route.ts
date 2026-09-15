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
    // 1. قراءة الـ cookies من الطلب
    const refreshToken = request.cookies.get("refresh_token")?.value;
    const rememberMe = request.cookies.get("remember_me")?.value === "1";

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token found." },
        { status: 401 }
      );
    }

    // 2. إرسال طلب إلى Supabase لتجديد الجلسة باستخدام الـ refresh_token
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // إذا انتهت صلاحية الـ refresh_token أو حدث خطأ، نقوم بحذف الـ cookies القديمة
      const res = NextResponse.json(
        { message: data?.error_description || data?.message || "Failed to refresh token." },
        { status: response.status }
      );
      res.cookies.delete("access_token");
      res.cookies.delete("refresh_token");
      res.cookies.delete("remember_me");
      return res;
    }

    // 3. إنشاء استجابة ناجحة بالبيانات الجديدة
    const res = NextResponse.json(data, { status: 200 });

    const isProd = process.env.NODE_ENV === "production";
    const accessTokenMaxAge = typeof data.expires_in === "number" ? data.expires_in : 3600;

    // 4. تحديث access_token الجديد (قصير الأجل)
    res.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: accessTokenMaxAge,
    });

    // 5. تحديث refresh_token الجديد (إذا أعيد إصداره من Supabase)
    if (data.refresh_token) {
      res.cookies.set("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        ...(rememberMe ? { maxAge: THIRTY_DAYS_IN_SECONDS } : {}),
      });
    }

    return res;
  } catch (error: any) {
    console.error("Refresh Token Error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}