import type { ProjectMember, ProjectMemberRow } from '@/src/types/member';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function fetchProjectMembers(
  projectId: string,
  token: string,
  signal?: AbortSignal
): Promise<ProjectMember[]> {
  const response = await fetch(
    `${BASE_URL}/rest/v1/get_project_members?project_id=eq.${encodeURIComponent(projectId)}`,
    {
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal,
    }
  );

  if (!response.ok) {
    throw new ApiError('Failed to fetch project members', response.status);
  }

  const rows: ProjectMemberRow[] = await response.json();

  return rows.map((row: any) => {
    // محاولة استخراج الاسم من الحقول المتاحة، أو استنتاجه من الإيميل قبل "@" كحل بديل
    let derivedName = 
      row.full_name || 
      row.name || 
      row.username || 
      row.display_name || 
      row.raw_user_meta_data?.full_name || 
      row.raw_user_meta_data?.name;

    if (!derivedName && row.email) {
      // استخراج الاسم من الإيميل (مثال: hala23@gmail.com تصبح Hala أو hala23)
      const emailPrefix = row.email.split('@')[0];
      derivedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }

    return {
      id: row.user_id || row.id || '',
      name: derivedName || 'Unknown',
      email: row.email,
      avatarUrl: row.avatar_url || null,
      role: (row.role as ProjectMember['role']) || 'member',
    };
  });
}