// ادمجها مع الموجود عندك في src/types/epic.ts (عدّل الحقول حسب الـ API الفعلي)
export interface Epic {
  id: string;
  code?: string; // EPIC-102
  title: string;
  description?: string | null;
  assignee?: { id: string; name: string } | null;
  creator?: { id: string; name: string } | null;
  created_at: string; // ISO date
}

export interface EpicsResponse {
  epics: Epic[];
  totalCount: number;
}