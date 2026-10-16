import type {
  LoginRequest,
  LoginSuccessResponse,
  SignUpRequest,
} from "@/src/types/auth";
import type { SignUpFormValues } from "@/src/lib/validations/sign-up-schema";

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new ApiError(
      "Supabase configuration is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return { url, anonKey };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (!isRecord(body)) return fallback;

    for (const key of ["message", "msg", "error_description"]) {
      const message = body[key];
      if (typeof message === "string" && message.length > 0) return message;
    }
  } catch {
    // Error responses may have an empty or non-JSON body.
  }

  return fallback;
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

export async function signUp(values: SignUpFormValues): Promise<void> {
  const { url, anonKey } = getSupabaseConfig();
  const body = toSignUpRequest(values);

  const response = await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(
        response,
        `Registration failed (${response.status}). Please check your details or try a different email.`
      ),
      response.status
    );
  }
}

export async function loginApi(
  credentials: LoginRequest,
  rememberMe: boolean = false
): Promise<LoginSuccessResponse> {
  const { url, anonKey } = getSupabaseConfig();
  const response = await fetch(
    `${url}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
      },
      body: JSON.stringify(credentials),
    }
  );

  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response, "Invalid email or password."),
      response.status
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("The login response was not valid JSON.", response.status);
  }

  if (
    !isRecord(data) ||
    typeof data.access_token !== "string" ||
    data.access_token.length === 0
  ) {
    throw new ApiError(
      "The login response did not contain a valid access token.",
      response.status
    );
  }

  const session: LoginSuccessResponse = { access_token: data.access_token };
  if (typeof data.token_type === "string") {
    session.token_type = data.token_type;
  }
  if (typeof data.expires_in === "number") {
    session.expires_in = data.expires_in;
  }
  if (
    isRecord(data.user) &&
    typeof data.user.id === "string" &&
    typeof data.user.email === "string"
  ) {
    session.user = { id: data.user.id, email: data.user.email };
  }

  saveSession(session, rememberMe);
  return session;
}

/** Saves user session with 1-month persistence if Remember Me is checked. */
export function saveSession(data: LoginSuccessResponse, rememberMe: boolean) {
  if (typeof window === "undefined") return;
  const token = data.access_token;
  if (!token) {
    throw new ApiError("Cannot save a session without an access token.");
  }

  const expires = rememberMe
    ? `; expires=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()}`
    : "";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `taskly_session=${encodeURIComponent(token)}${expires}; path=/; SameSite=Lax${secure}`;
  if (rememberMe) {
    localStorage.setItem("taskly_session", token);
    sessionStorage.removeItem("taskly_session");
  } else {
    sessionStorage.setItem("taskly_session", token);
    localStorage.removeItem("taskly_session");
  }
}

/** Clears all session cookies and browser storage data. */
export function clearSession() {
  if (typeof window === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const expired = `expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secure}`;
  document.cookie = `taskly_session=; ${expired}`;
  document.cookie = `access_token=; ${expired}`;
  document.cookie = `refresh_token=; ${expired}`;

  localStorage.removeItem("taskly_session");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  sessionStorage.removeItem("taskly_session");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
}

/** Sends POST /auth/v1/logout request using current access token, then clears session. */
export async function logoutApi(): Promise<void> {
  const getSessionToken = () => {
    if (typeof window === "undefined") return null;
    const match = document.cookie.match(/(?:^|; )taskly_session=([^;]*)/);
    if (match && match[1]) return decodeURIComponent(match[1]);
    return localStorage.getItem("taskly_session") || sessionStorage.getItem("taskly_session");
  };

  const token = getSessionToken();

  if (token) {
    try {
      const { url, anonKey } = getSupabaseConfig();
      const response = await fetch(`${url}/auth/v1/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": anonKey,
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        console.warn(
          `Server logout notification failed (${response.status}); clearing the local session.`
        );
      }
    } catch (err) {
      console.warn("Server logout notification skipped:", err);
    }
  }

  // Always clear client-side session cookies and local storage
  clearSession();
}

function isUserExistenceError(body: unknown) {
  if (!isRecord(body)) return false;

  const code = [body.code, body.error_code]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
  const message = [body.message, body.msg, body.error_description]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return (
    code.includes('user_not_found') ||
    message.includes('user not found') ||
    message.includes('email not found')
  );
}

/** Sends POST /auth/v1/recover. Never reveals whether the email exists. */
export async function recoverPassword(email: string): Promise<void> {
  const { url: supabaseUrl, anonKey } = getSupabaseConfig();
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : undefined;

  const url = new URL(`${supabaseUrl}/auth/v1/recover`);
  if (redirectTo) {
    url.searchParams.set('redirect_to', redirectTo);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
      },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new ApiError(
      'Network error. Please check your connection and try again.'
    );
  }

  if (response.ok) {
    return;
  }

  let errorBody: unknown = null;
  try {
    errorBody = await response.json();
  } catch {
    // Keep the generic response for empty or non-JSON error bodies.
  }

  if (isUserExistenceError(errorBody)) {
    return;
  }

  throw new ApiError(
    response.status >= 500
      ? 'Something went wrong. Please try again later.'
      : 'We could not send the reset link. Please try again.',
    response.status
  );
}

/** Sends PUT /auth/v1/user with the recovery access token to set a new password. */
export async function updatePasswordWithRecoveryToken(
  accessToken: string,
  password: string
): Promise<void> {
  const { url, anonKey } = getSupabaseConfig();
  let response: Response;
  try {
    response = await fetch(`${url}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ password }),
    });
  } catch {
    throw new ApiError(
      'Network error. Please check your connection and try again.'
    );
  }

  if (!response.ok) {
    throw new ApiError(
      'We could not update your password. The reset link may be invalid or expired. Please try again.',
      response.status
    );
  }
}