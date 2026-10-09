import type { TaskStatus, TaskStatusConfig } from "@/src/types/task";

export const TASK_STATUSES: TaskStatusConfig[] = [
  { key: "TO_DO", label: "TO DO", dotClass: "bg-slate-400", badgeClass: "bg-slate-100 text-slate-600" },
  { key: "IN_PROGRESS", label: "IN PROGRESS", dotClass: "bg-blue-600", badgeClass: "bg-blue-50 text-blue-700" },
  { key: "BLOCKED", label: "BLOCKED", dotClass: "bg-red-600", badgeClass: "bg-red-50 text-red-600" },
  { key: "IN_REVIEW", label: "IN REVIEW", dotClass: "bg-indigo-700", badgeClass: "bg-indigo-50 text-indigo-700" },
  { key: "READY_FOR_QA", label: "READY FOR QA", dotClass: "bg-blue-500", badgeClass: "bg-blue-50 text-blue-700" },
  { key: "REOPENED", label: "REOPENED", dotClass: "bg-red-500", badgeClass: "bg-red-50 text-red-600" },
  { key: "READY_FOR_PRODUCTION", label: "READY FOR PROD", dotClass: "bg-emerald-800", badgeClass: "bg-emerald-50 text-emerald-800" },
  { key: "DONE", label: "DONE", dotClass: "bg-emerald-400", badgeClass: "bg-emerald-100 text-emerald-700" },
];

export const DEFAULT_TASK_STATUS: TaskStatus = "TO_DO";

// للعرض فقط: TO_DO ← TO DO. لا تستخدمها عند الإرسال
export function formatStatusLabel(status: TaskStatus): string {
  return status.replace(/_/g, " ");
}