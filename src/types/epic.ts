export interface EpicUser {
  sub: string;
  name: string;
  email?: string;
  department?: string;
  avatar_url?: string | null;
}

export interface Epic {
  id: string;
  epic_id: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  created_at: string;
  created_by?: EpicUser | null;
  assignee?: EpicUser | null;
}

export interface EpicsResponse {
  epics: Epic[];
  totalCount: number;
}
