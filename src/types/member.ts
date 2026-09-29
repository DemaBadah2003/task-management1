export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

// شكل الصف كما يرجع من get_project_members (عدّل أسماء الحقول حسب الـ Network tab)
export interface ProjectMemberRow {
  user_id?: string;
  id?: string;
  full_name?: string | null;
  name?: string | null;
  email: string;
  avatar_url?: string | null;
  role: string;
}

// الشكل الذي تستخدمه الواجهة
export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: MemberRole;
}