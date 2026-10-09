import type {
  MemberRole,
  ProjectMember,
  ProjectMemberRow,
} from "@/src/types/member";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const VALID_ROLES: MemberRole[] = ["owner", "admin", "member", "viewer"];

function toRole(value: string | undefined): MemberRole {
  const role = value?.toLowerCase() as MemberRole;
  return VALID_ROLES.includes(role) ? role : "member";
}

function mapRow(row: ProjectMemberRow): ProjectMember {
  return {
    id: row.user_id ?? row.id ?? "",
    name: row.full_name ?? row.name ?? row.email ?? "",
    email: row.email ?? "",
    avatarUrl: row.avatar_url ?? null,
    role: toRole(row.role),
  };
}

export async function fetchProjectMembersView(
  projectId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<ProjectMember[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/get_project_members?project_id=eq.${encodeURIComponent(projectId)}`,
    {
      headers: {
        apikey: SUPABASE_KEY ?? "",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      signal,
    },
  );

  if (!res.ok) {
    let message = "Failed to load members";
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {}
    throw new Error(message);
  }

  const rows: ProjectMemberRow[] = await res.json();
  return rows.map(mapRow);
}