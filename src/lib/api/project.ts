import { getSessionToken } from "./user";
import { ApiError } from "./auth";
import type { Project } from "@/src/types/project";

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

// 1. دالة إنشاء مشروع جديد
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

// 2. دالة جلب المشاريع (مضافة حديثاً لتعمل مع صفحة القائمة والكاردات)
export async function getProjectsApi(): Promise<Project[]> {
  const token = getSessionToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // محاولة جلب المشاريع من RPC المذكور بالـ Requirement أولاً، ثم الـ Table كاحتيطي
  let response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_projects`, {
    method: "GET",
    headers,
  });

  if (response.status === 404 || !response.ok) {
    // إذا لم يتوفر الـ RPC، نستخدم الجدول مباشرة
    const tableRes = await fetch(
      `${SUPABASE_URL}/rest/v1/projects?select=*&order=created_at.desc`,
      { method: "GET", headers }
    );
    if (tableRes.ok || response.status === 404) {
      response = tableRes;
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const errorMessage =
      errorBody?.message ||
      errorBody?.msg ||
      errorBody?.error_description ||
      "Failed to fetch projects";
    const err = new ApiError(errorMessage);
    (err as any).status = response.status;
    throw err;
  }

  const resText = await response.text();
  try {
    const data = JSON.parse(resText);
    
    return (data || []).map((item: any) => ({
      id: String(item.id),
      name: item.name || "Untitled Project",
      description: item.description || "",
      createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Failed to parse projects:", err);
    return [];
  }
}
// 3. دالة تحديث المشروع
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