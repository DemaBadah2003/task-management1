import { getSessionToken } from "./user";
import { ApiError } from "./auth";
import type { Project } from "@/src/types/project";

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

function buildHeaders(
  anonKey: string,
  token: string | null,
  prefer?: string
): HeadersInit {
  return {
    "Content-Type": "application/json",
    apikey: anonKey,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function request(
  input: RequestInfo | URL,
  init: RequestInit
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    const detail = error instanceof Error ? `: ${error.message}` : "";
    throw new ApiError(`Network request failed${detail}`);
  }
}

async function readErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  if (response.status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  try {
    const body: unknown = await response.json();
    if (isRecord(body)) {
      for (const field of ["message", "msg", "error_description"]) {
        const value = body[field];
        if (typeof value === "string" && value.length > 0) return value;
      }
    }
  } catch {
    // Some API errors have no JSON body.
  }

  return fallback;
}

async function readJson(response: Response, description: string): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ApiError(
      `The ${description} response was not valid JSON.`,
      response.status
    );
  }
}

function mapProject(value: unknown): Project {
  if (
    !isRecord(value) ||
    (typeof value.id !== "string" && typeof value.id !== "number")
  ) {
    throw new ApiError("The projects response contained an invalid project.");
  }

  const createdAt = value.created_at ?? value.createdAt;
  return {
    id: String(value.id),
    name:
      typeof value.name === "string" && value.name
        ? value.name
        : "Untitled Project",
    description:
      typeof value.description === "string" ? value.description : "",
    createdAt:
      typeof createdAt === "string" && createdAt.trim() ? createdAt : null,
  };
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  id: string;
  name: string;
  description?: string;
}

export async function createProjectApi(
  payload: CreateProjectPayload
): Promise<void> {
  const { url, anonKey } = getSupabaseConfig();
  const response = await request(`${url}/rest/v1/projects`, {
    method: "POST",
    headers: buildHeaders(anonKey, getSessionToken()),
    body: JSON.stringify({
      name: payload.name,
      ...(payload.description !== undefined
        ? { description: payload.description }
        : {}),
    }),
  });

  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(
        response,
        "Failed to add new project. Try again later."
      ),
      response.status
    );
  }
}

export async function getProjectsApi(): Promise<Project[]> {
  const { url, anonKey } = getSupabaseConfig();
  const headers = buildHeaders(anonKey, getSessionToken());
  const response = await request(
    `${url}/rest/v1/projects?select=*&order=created_at.desc`,
    { method: "GET", headers }
  );

  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response, "Failed to fetch projects."),
      response.status
    );
  }

  const data = await readJson(response, "projects");
  if (!Array.isArray(data)) {
    throw new ApiError("The projects response was not a list.", response.status);
  }

  return data.map(mapProject);
}

export async function getProjectByIdApi(id: string): Promise<Project> {
  const { url, anonKey } = getSupabaseConfig();
  const response = await request(
    `${url}/rest/v1/projects?id=eq.${encodeURIComponent(id)}&select=*`,
    {
      method: "GET",
      headers: buildHeaders(anonKey, getSessionToken()),
    }
  );

  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response, "Failed to fetch project."),
      response.status
    );
  }

  const data = await readJson(response, "project");
  if (!Array.isArray(data)) {
    throw new ApiError("The project response was not a list.", response.status);
  }
  if (data.length === 0) {
    throw new ApiError("Project not found.", 404);
  }

  return mapProject(data[0]);
}

export async function updateProjectApi(
  payload: UpdateProjectPayload
): Promise<void> {
  if (!payload.id.trim()) {
    throw new ApiError("A project ID is required to update a project.");
  }

  const { url, anonKey } = getSupabaseConfig();
  const response = await request(
    `${url}/rest/v1/projects?id=eq.${encodeURIComponent(payload.id)}`,
    {
      method: "PATCH",
      headers: buildHeaders(
        anonKey,
        getSessionToken(),
        "return=representation"
      ),
      body: JSON.stringify({
        name: payload.name,
        ...(payload.description !== undefined
          ? { description: payload.description }
          : {}),
      }),
    }
  );

  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response, "Failed to update project."),
      response.status
    );
  }

  const data = await readJson(response, "project update");
  if (!Array.isArray(data) || data.length === 0) {
    throw new ApiError(
      "The project was not updated. It may not exist or you may not have permission to edit it.",
      404
    );
  }

  const updatedProject = mapProject(data[0]);
  if (updatedProject.id !== payload.id) {
    throw new ApiError("The update response did not match the requested project.");
  }
}
