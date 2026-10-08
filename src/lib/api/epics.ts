import { ApiError } from '@/src/lib/api/members';
import type { Epic } from '@/src/types/epic';
import { PAGE_SIZE } from '@/src/lib/pagination';

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface ProjectEpicsPage {
  epics: Epic[];
  totalCount: number | null;
}

export async function getProjectEpicDetails(
  projectId: string,
  epicId: string,
  token: string,
  signal?: AbortSignal,
): Promise<Epic> {
  const url = new URL(`${BASE_URL}/rest/v1/project_epics`);
  url.searchParams.set('project_id', `eq.${projectId}`);
  url.searchParams.set('id', `eq.${epicId}`);

  const response = await fetch(url, {
    headers: {
      apikey: API_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    const responseBody = await response.text();
    let message = responseBody || 'Failed to fetch epic details';
    try {
      const errorBody: unknown = JSON.parse(responseBody);
      if (
        typeof errorBody === 'object' &&
        errorBody !== null &&
        'message' in errorBody &&
        typeof errorBody.message === 'string'
      ) {
        message = errorBody.message;
      }
    } catch {
      // Keep the backend response text when the error body is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new ApiError('The epic details response was invalid', response.status);
  }

  const epic = data.find(
    (item): item is Epic =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      item.id === epicId,
  );
  if (!epic) {
    throw new ApiError('Epic not found for this project', 404);
  }

  return epic;
}

export async function getProjectEpics(
  projectId: string,
  token: string,
  offset = 0,
  limit = PAGE_SIZE,
  signal?: AbortSignal,
  searchTerm?: string,
): Promise<ProjectEpicsPage> {
  const url = new URL(`${BASE_URL}/rest/v1/project_epics`);
  url.searchParams.set('project_id', `eq.${projectId}`);
  const trimmedSearch = searchTerm?.trim();
  if (trimmedSearch) {
    url.searchParams.set('title', `ilike.%${trimmedSearch}%`);
  }
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));

  const response = await fetch(url, {
    headers: {
      apikey: API_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'count=exact',
    },
    signal,
  });

  if (!response.ok) {
    const responseBody = await response.text();
    let message = responseBody || 'Failed to fetch project epics';
    try {
      const errorBody: unknown = JSON.parse(responseBody);
      if (
        typeof errorBody === 'object' &&
        errorBody !== null &&
        'message' in errorBody &&
        typeof errorBody.message === 'string'
      ) {
        message = errorBody.message;
      }
    } catch {
      // Keep the backend response text when the error body is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new ApiError('The project epics response was invalid', response.status);
  }

  const contentRange = response.headers.get('Content-Range');
  const totalMatch = contentRange?.match(/\/(\d+)$/);
  const totalCount =
    totalMatch && Number.isSafeInteger(Number(totalMatch[1]))
      ? Number(totalMatch[1])
      : null;

  return { epics: data as Epic[], totalCount };
}

export type CreateEpicPayload = {
  title: string;
  project_id: string;
  description?: string;
  assignee_id?: string;
  deadline?: string; // YYYY-MM-DD
};

export async function createEpic(
  payload: CreateEpicPayload,
  token: string,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${BASE_URL}/rest/v1/epics`, {
    method: 'POST',
    headers: {
      apikey: API_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    let message = 'Failed to create epic. Please try again.';
    try {
      const err = await response.json();
      if (err?.message) message = err.message;
    } catch {
      // الرد مش JSON، نستخدم الرسالة الافتراضية
    }
    throw new ApiError(message, response.status);
  }
}