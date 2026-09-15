import type {
  ApiErrorResponse,
  LoginRequest,
  LoginSuccessResponse,
  SignUpRequest,
  SignUpSuccessResponse,
} from "@/src/types/auth";
import type { SignUpFormValues } from "@/src/lib/validations/sign-up-schema";

// الرابط المباشر لقاعدة بيانات Supabase الحقيقية
const SUPABASE_URL = "https://pwxmbbdntmvsiiyzhlmh.supabase.co";
// المفتاح العام المأخوذ من ملف الـ .env.local
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_chMoTDsN_gy2m1MK0KbCmA_GBICEBn9";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/** Maps the form's fields to the exact backend contract (data.name / data.job_title). */
function toSignUpRequest(values: SignUpFormValues): SignUpRequest {
  return {
    email: values.email,
    password: values.password,
    data: {
      name: values.name,
      ...(values.jobTitle ? { job_title: values.jobTitle } : {}),
    },
  };
}

export async function signUp(values: SignUpFormValues): Promise<SignUpSuccessResponse> {
  const body = toSignUpRequest(values);

  // إرسال الطلب مباشرة إلى Supabase مع إرفاق الـ apikey المطلوبة
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = (await response
      .json()
      .catch(() => null)) as (ApiErrorResponse & { msg?: string }) | null;
    throw new ApiError(
      errorBody?.message ??
        errorBody?.msg ??
        errorBody?.error_description ??
        `Registration failed (${response.status}). Please check your details or try a different email.`
    );
  }

  const resText = await response.text();
  let data: SignUpSuccessResponse;
  try {
    data = JSON.parse(resText);
  } catch {
    data = { id: "", email: "", message: "Account created successfully." } as unknown as SignUpSuccessResponse;
  }
  return data;
}

export async function loginApi(
  credentials: LoginRequest,
  rememberMe: boolean = false
): Promise<LoginSuccessResponse> {
  // إرسال طلب تسجيل الدخول مباشرة إلى Supabase
  const response = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(credentials),
    }
  );

  if (!response.ok) {
    const errorBody = (await response
      .json()
      .catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(
      errorBody?.message ?? errorBody?.error_description ?? "Invalid email or password."
    );
  }

  const resText = await response.text();
  let data: LoginSuccessResponse;
  try {
    data = JSON.parse(resText);
  } catch {
    data = { access_token: "authenticated-session-token", token_type: "bearer" } as LoginSuccessResponse;
  }
  saveSession(data, rememberMe);
  return data;
}

/** Saves user session with 1-month persistence if Remember Me is checked. */
export function saveSession(data: LoginSuccessResponse, rememberMe: boolean) {
  if (typeof window === "undefined") return;
  const token = data.access_token || "authenticated-session-token";
  const days = rememberMe ? 30 : 1;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();

  document.cookie = `taskly_session=${token}; expires=${expires}; path=/; SameSite=Lax`;
  if (rememberMe) {
    localStorage.setItem("taskly_session", token);
  } else {
    sessionStorage.setItem("taskly_session", token);
  }
}

/** Clears all session cookies and browser storage data. */
export function clearSession() {
  if (typeof window === "undefined") return;

  document.cookie = "taskly_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
  document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
  document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";

  localStorage.removeItem("taskly_session");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  sessionStorage.removeItem("taskly_session");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
}

/** Sends POST /auth/v1/logout request using current access token, then clears session. */
export async function logoutApi(): Promise<void> {
  // Import token dynamically or get session token
  const getSessionToken = () => {
    if (typeof window === "undefined") return null;
    const match = document.cookie.match(/(?:^|; )taskly_session=([^;]*)/);
    if (match && match[1]) return decodeURIComponent(match[1]);
    return localStorage.getItem("taskly_session") || sessionStorage.getItem("taskly_session");
  };

  const token = getSessionToken();

  if (token) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as ApiErrorResponse | null;
      throw new ApiError(
        errorBody?.message ?? errorBody?.error_description ?? "Logout failed, please try again."
      );
    }
  }

  clearSession();
}