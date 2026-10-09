export type TaskStatus =
  | "TO_DO"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "IN_REVIEW"
  | "READY_FOR_QA"
  | "REOPENED"
  | "READY_FOR_PRODUCTION"
  | "DONE";

export interface Task {
  id: string;
  project_id: string;
  epic_id: string | null;
  title: string;
  description: string | null;
  assignee_id: string | null;
  due_date: string | null; // ISO timestamp
  status: TaskStatus;
}

// جسم طلب POST /rest/v1/tasks (الحقول الاختيارية تُحذف إن كانت فارغة)
export interface CreateTaskPayload {
  project_id: string;
  title: string;
  status: TaskStatus;
  epic_id?: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
}

export interface TaskStatusConfig {
  key: TaskStatus;
  label: string; // العنوان في رأس عمود اللوحة (حسب Figma)
  dotClass: string;
  badgeClass: string;
}

export interface ProjectEpic {
  id: string;
  title: string;
}

export interface ProjectMember {
  user_id: string;
  full_name?: string | null;
  email?: string | null;
}