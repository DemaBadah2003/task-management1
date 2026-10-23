import type {
  MemberRole,
  ProjectMember,
  ProjectMemberRow,
} from "@/src/types/member";
import { ApiError } from "@/src/lib/api/members";

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

export async function inviteProjectMember(
  email: string,
  projectId: string,
  accessToken: string,
  appUrl: string,
): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase configuration is missing.");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/invite_member`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_email: email,
      p_project_id: projectId,
      p_app_url: appUrl,
      p_base_url: SUPABASE_URL,
    }),
  });

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof result === "object" && result !== null && "message" in result
        ? String(result.message)
        : "Failed to send the invitation.";
    throw new ApiError(message, response.status);
  }
  if (
    result === false ||
    (typeof result === "object" &&
      result !== null &&
      "success" in result &&
      result.success === false)
  ) {
    const message =
      typeof result === "object" && result !== null && "message" in result
        ? String(result.message)
        : "Failed to send the invitation.";
    throw new Error(message);
  }
}

export async function acceptProjectInvitation(
  invitationToken: string,
  accessToken: string,
): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase configuration is missing.");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/accept_invitation`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_token: invitationToken }),
  });

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof result === "object" && result !== null && "message" in result
        ? String(result.message)
        : "Something went wrong while accepting the invitation. Please try again.";
    throw new ApiError(message, response.status);
  }

  if (
    result === false ||
    (typeof result === "object" &&
      result !== null &&
      "success" in result &&
      result.success === false)
  ) {
    const message =
      typeof result === "object" && result !== null && "message" in result
        ? String(result.message)
        : "This invitation could not be accepted.";
    throw new Error(message);
  }

  if (typeof result !== "object" || result === null) return null;
  const resultRecord = result as Record<string, unknown>;
  const projectId = resultRecord.project_id ?? resultRecord.projectId;
  return typeof projectId === "string" && projectId.trim()
    ? projectId
    : null;
}