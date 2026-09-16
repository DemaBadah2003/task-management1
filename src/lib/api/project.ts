import { getSessionToken } from "./user";
import { ApiError } from "./auth";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://pwxmbbdntmvsiiyzhlmh.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_chMoTDsN_gy2m1MK0KbCmA_GBICEBn9";

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  id?: string;
  name: string;
  description?: string;
}

export async function createProjectApi(payload: CreateProjectPayload): Promise<any> {
  const token = getSessionToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: payload.name,
      ...(payload.description !== undefined ? { description: payload.description } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const errorMessage =
      errorBody?.message ||
      errorBody?.msg ||
      errorBody?.error_description ||
      "Failed To Add New Project, Try Again Later";
    throw new ApiError(errorMessage);
  }

  const resText = await response.text();
  try {
    return JSON.parse(resText);
  } catch {
    return { success: true };
  }
}

export async function updateProjectApi(payload: UpdateProjectPayload): Promise<any> {
  const token = getSessionToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = payload.id
    ? `${SUPABASE_URL}/rest/v1/projects?id=eq.${payload.id}`
    : `${SUPABASE_URL}/rest/v1/projects`;

  const response = await fetch(url, {
    method: payload.id ? "PATCH" : "POST",
    headers,
    body: JSON.stringify({
      name: payload.name,
      ...(payload.description !== undefined ? { description: payload.description } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const errorMessage =
      errorBody?.message ||
      errorBody?.msg ||
      errorBody?.error_description ||
      "Failed To Update Project, Try Again Later";
    throw new ApiError(errorMessage);
  }

  const resText = await response.text();
  try {
    return JSON.parse(resText);
  } catch {
    return { success: true };
  }
}
