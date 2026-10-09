import type {
  CreateTaskPayload,
  ProjectEpic,
  ProjectMember,
  Task,
} from "@/src/types/task";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function buildHeaders(accessToken: string): HeadersInit {
  return {
    apikey: SUPABASE_KEY ?? "",
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return body?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function fetchProjectEpics(
  projectId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<ProjectEpic[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/project_epics?project_id=eq.${encodeURIComponent(projectId)}`,
    { headers: buildHeaders(accessToken), signal },
  );
  if (!res.ok) throw new Error(await readError(res, "Failed to load epics"));
  return res.json();
}

export async function fetchProjectMembers(
  projectId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<ProjectMember[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/get_project_members?project_id=eq.${encodeURIComponent(projectId)}`,
    { headers: buildHeaders(accessToken), signal },
  );
  if (!res.ok) throw new Error(await readError(res, "Failed to load members"));
  return res.json();
}

export async function createTask(
  accessToken: string,
  payload: CreateTaskPayload,
): Promise<Task> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken),
      Prefer: "return=representation", // لإرجاع المهمة المنشأة
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to create task"));
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}