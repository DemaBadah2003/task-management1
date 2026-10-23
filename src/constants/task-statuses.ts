import type { TaskStatus, TaskStatusConfig } from "@/src/types/task";

export const TASK_STATUSES: TaskStatusConfig[] = [
  {
    key: "TO_DO",
    label: "TO DO",
    dotClass: "bg-slate-400",
    badgeClass: "bg-slate-100 text-slate-600",
  },
  {
    key: "IN_PROGRESS",
    label: "IN PROGRESS",
    dotClass: "bg-blue-600",
    badgeClass: "bg-blue-50 text-blue-700",
  },
  {
    key: "BLOCKED",
    label: "BLOCKED",
    dotClass: "bg-red-600",
    badgeClass: "bg-red-50 text-red-600",
  },
  {
    key: "IN_REVIEW",
    label: "IN REVIEW",
    dotClass: "bg-purple-700",
    badgeClass: "bg-purple-50 text-purple-700",
  },
  {
    key: "READY_FOR_QA",
    label: "READY FOR QA",
    dotClass: "bg-orange-600",
    badgeClass: "bg-orange-50 text-orange-700",
  },
  {
    key: "REOPENED",
    label: "REOPENED",
    dotClass: "bg-red-500",
    badgeClass: "bg-red-50 text-red-600",
  },
  {
    key: "READY_FOR_PRODUCTION",
    label: "READY FOR PRODUCTION",
    dotClass: "bg-blue-600",
    badgeClass: "bg-blue-50 text-blue-700",
  },
  {
    key: "DONE",
    label: "DONE",
    dotClass: "bg-emerald-400",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
];

export const DEFAULT_TASK_STATUS: TaskStatus = "TO_DO";

export function formatStatusLabel(status: TaskStatus): string {
  return status.replace(/_/g, " ");
}