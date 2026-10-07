import { cookies } from 'next/headers';
import { PAGE_SIZE } from '@/src/lib/pagination';
import type { Project, ProjectsResponse } from '@/src/types/project';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export class ProjectsFetchError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** "0-9/100" → 100 ، ولو الـ header ناقص أو غلط → null */
export function parseTotalCount(contentRange: string | null): number | null {
  if (!contentRange) return null;
  const total = contentRange.split('/')[1];
  if (total === undefined) return null;
  const n = Number(total);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

// نفس الكوكيز اللي بيقرأها proxy.ts
async function getAccessToken(): Promise<string> {
  const store = await cookies();
  return (
    store.get('taskly_session')?.value ||
    store.get('access_token')?.value ||
    ''
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProject(item: any): Project {
  return {
    id: String(item.id),
    name: item.name || 'Untitled Project',
    description: item.description || '',
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
  };
}

export async function fetchProjects({
  limit = PAGE_SIZE,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}): Promise<ProjectsResponse> {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    Prefer: 'count=exact',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const query = `limit=${limit}&offset=${offset}`;

  let res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_projects?${query}`, {
    headers,
    cache: 'no-store',
  });

  // نفس الـ fallback اللي كان عندك: لو الـ RPC مش موجود نستخدم الجدول
  if (res.status === 404) {
    res = await fetch(
      `${SUPABASE_URL}/rest/v1/projects?select=*&order=created_at.desc&${query}`,
      { headers, cache: 'no-store' }
    );
  }

  // offset أكبر من عدد المشاريع → PostgREST بيرجع 416 ومعه العدد الكلي
  if (res.status === 416) {
    return {
      projects: [],
      totalCount: parseTotalCount(res.headers.get('Content-Range')) ?? 0,
    };
  }

  if (!res.ok) {
    throw new ProjectsFetchError('Failed to load projects', res.status);
  }

  const raw = await res.json();
  const projects: Project[] = Array.isArray(raw) ? raw.map(mapProject) : [];

  // fallback آمن لو الـ header مش موجود أو غلط
  const totalCount =
    parseTotalCount(res.headers.get('Content-Range')) ??
    offset + projects.length;

  return { projects, totalCount };
}