import { cookies } from 'next/headers';
import type { EpicsResponse } from '@/src/types/epic';

export class EpicsFetchError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

interface FetchEpicsParams {
  projectId: string;
  limit: number;
  offset: number;
  q?: string;
}

/**
 * ⚠️ افتراض: نفس طريقة fetchProjects عندك.
 * عدّل الـ URL وطريقة جلب الـ token بحيث تطابق src/lib/projects.ts
 */
export async function fetchEpics({
  projectId,
  limit,
  offset,
  q,
}: FetchEpicsParams): Promise<EpicsResponse> {
  const token = (await cookies()).get('access_token')?.value;

  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/epics`);
  url.searchParams.set('project_id', projectId);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  if (q) url.searchParams.set('q', q);

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });

  if (!res.ok) throw new EpicsFetchError('Failed to load epics', res.status);

  const json = await res.json();
  return {
    epics: json.epics ?? json.data ?? [],
    totalCount: json.totalCount ?? json.total ?? 0,
  };
}