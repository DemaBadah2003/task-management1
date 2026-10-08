import type { TaskStatusConfig } from "@/src/types/task";
export const TASK_STATUSES: TaskStatusConfig[] = [
  { key: "todo",           label: "TO DO",          dotClass: "bg-slate-400",   badgeClass: "bg-slate-100 text-slate-600" },
  { key: "in_progress",    label: "IN PROGRESS",    dotClass: "bg-blue-600",    badgeClass: "bg-blue-50 text-blue-700" },
  { key: "blocked",        label: "BLOCKED",        dotClass: "bg-red-600",     badgeClass: "bg-red-50 text-red-600" },
  { key: "in_review",      label: "IN REVIEW",      dotClass: "bg-indigo-700",  badgeClass: "bg-indigo-50 text-indigo-700" },
  { key: "ready_for_qa",   label: "READY FOR QA",   dotClass: "bg-blue-500",    badgeClass: "bg-blue-50 text-blue-700" },
  { key: "reopened",       label: "REOPENED",       dotClass: "bg-red-500",     badgeClass: "bg-red-50 text-red-600" },
  { key: "ready_for_prod", label: "READY FOR PROD", dotClass: "bg-emerald-800", badgeClass: "bg-emerald-50 text-emerald-800" },
  { key: "done",           label: "DONE",           dotClass: "bg-emerald-400", badgeClass: "bg-emerald-100 text-emerald-700" },
];