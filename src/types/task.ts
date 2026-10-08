export type TaskStatusKey =
  | "todo"
  | "in_progress"
  | "blocked"
  | "in_review"
  | "ready_for_qa"
  | "reopened"
  | "ready_for_prod"
  | "done";

// نوع مبدئي، يتم توسيعه عند ربط الـ API لاحقاً
export interface Task {
  id: string;
  title: string;
  status: TaskStatusKey;
}

export interface TaskStatusConfig {
  key: TaskStatusKey;
  label: string;
  dotClass: string;   // لون النقطة
  badgeClass: string; // لون شارة العدد
}