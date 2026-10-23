import type {
  CreateTaskPayload,
  ProjectEpic,
  ProjectMember,
  Task,
  TaskStatus,
} from "@/src/types/task";
import { ApiError } from "@/src/lib/api/members";
import { PAGE_SIZE } from "@/src/lib/pagination";

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

export interface TaskDetails extends Omit<Task, "status"> {
  status: string;
  priority: string | null;
  assignee_name: string | null;
  assignee_avatar: string | null;
  reporter: string | null;
  created_at: string | null;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function personValue(value: unknown): string | null {
  if (typeof value === "string") return optionalString(value);
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const person = value as Record<string, unknown>;
  return (
    optionalString(person.full_name) ??
    optionalString(person.name) ??
    optionalString(person.email) ??
    optionalString(person.user_id) ??
    optionalString(person.id)
  );
}

export async function fetchProjectTaskDetails(
  projectId: string,
  taskId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<TaskDetails | null> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/project_tasks`);
  url.searchParams.set("project_id", `eq.${projectId}`);
  url.searchParams.set("id", `eq.${taskId}`);

  const res = await fetch(url, {
    headers: buildHeaders(accessToken),
    signal,
  });
  if (!res.ok) {
    throw new ApiError(
      await readError(res, "Failed to load task details"),
      res.status,
    );
  }

  const response: unknown = await res.json();
  if (!Array.isArray(response)) {
    throw new Error("The task details response was invalid");
  }
  if (response.length === 0) return null;
  if (response.length !== 1) {
    throw new Error("The task details response was invalid");
  }

  const row = response[0];
  if (typeof row !== "object" || row === null || Array.isArray(row)) {
    throw new Error("The task details response was invalid");
  }

  if (
    typeof row.id !== "string" ||
    typeof row.project_id !== "string" ||
    typeof row.title !== "string" ||
    typeof row.status !== "string" ||
    row.id !== taskId ||
    row.project_id !== projectId
  ) {
    throw new Error("The task details response was invalid");
  }

  return {
    id: row.id,
    project_id: row.project_id,
    epic_id: optionalString(row.epic_id),
    title: row.title,
    description: optionalString(row.description),
    assignee_id: optionalString(row.assignee_id),
    due_date: optionalString(row.due_date),
    status: row.status,
    priority: optionalString(row.priority),
    assignee_name: optionalString(row.assignee_name),
    assignee_avatar: optionalString(row.assignee_avatar),
    reporter: personValue(
      row.reporter ??
        row.reporter_name ??
        row.created_by_name ??
        row.created_by ??
        row.created_by_id,
    ),
    created_at: optionalString(row.created_at),
  };
}

export async function fetchEpicTasks(
  projectId: string,
  epicId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<Task[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/project_tasks`);
  url.searchParams.set("project_id", `eq.${projectId}`);
  url.searchParams.set("epic_id", `eq.${epicId}`);

  const res = await fetch(url, {
    headers: buildHeaders(accessToken),
    signal,
  });
  if (!res.ok) {
    throw new ApiError(
      await readError(res, "Failed to load epic tasks"),
      res.status,
    );
  }

  const tasks: unknown = await res.json();
  if (!Array.isArray(tasks)) {
    throw new Error("The epic tasks response was invalid");
  }

  return tasks as Task[];
}

export interface PaginatedTasksResult {
  tasks: Task[];
  contentRange: { start: number | null; end: number | null; total: number | null } | null;
  totalCount: number | null;
}

export interface FetchProjectTasksPageOptions {
  limit?: number;
  offset?: number;
  status?: TaskStatus;
  title?: string;
  signal?: AbortSignal;
}

export function parseContentRange(
  value: string | null,
): { start: number | null; end: number | null; total: number | null } | null {
  if (!value) return null;

  const match = value.trim().match(/^(?:(\d+)-(\d+)|\*)\/(\d+|\*)$/);
  if (!match) return null;

  const start = match[1] === undefined ? null : Number(match[1]);
  const end = match[2] === undefined ? null : Number(match[2]);
  const total = match[3] === "*" ? null : Number(match[3]);
  if (
    (start !== null && !Number.isSafeInteger(start)) ||
    (end !== null && !Number.isSafeInteger(end)) ||
    (total !== null && (!Number.isSafeInteger(total) || total < 0)) ||
    (start !== null && end !== null && end < start) ||
    (total !== null && end !== null && end >= total)
  ) {
    return null;
  }

  return { start, end, total };
}

export async function fetchProjectTasksPage(
  projectId: string,
  accessToken: string,
  {
    limit = PAGE_SIZE,
    offset = 0,
    status,
    title,
    signal,
  }: FetchProjectTasksPageOptions = {},
): Promise<PaginatedTasksResult> {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new RangeError("Task page limit must be a positive integer");
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError("Task page offset must be a non-negative integer");
  }

  const url = new URL(`${SUPABASE_URL}/rest/v1/project_tasks`);
  url.searchParams.set("project_id", `eq.${projectId}`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("order", "created_at.desc,id.asc");
  if (status) url.searchParams.set("status", `eq.${status}`);
  const normalizedTitle = title?.trim();
  if (normalizedTitle) {
    const literalTitle = normalizedTitle.replace(/[\\%_]/g, "\\$&");
    url.searchParams.set("title", `ilike.%${literalTitle}%`);
  }

  const res = await fetch(url, {
    headers: {
      ...buildHeaders(accessToken),
      Prefer: "count=exact",
    },
    cache: "no-store",
    signal,
  });
  if (!res.ok) {
    throw new ApiError(
      await readError(res, "Failed to load project tasks"),
      res.status,
    );
  }

  const tasks: unknown = await res.json();
  if (!Array.isArray(tasks)) {
    throw new Error("The project tasks response was invalid");
  }

  const contentRange = parseContentRange(res.headers.get("Content-Range"));
  return {
    tasks: tasks as Task[],
    contentRange,
    totalCount: contentRange?.total ?? null,
  };
}