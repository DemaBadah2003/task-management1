import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks · Taskly",
};

export default function TasksPage() {
  return (
      <div className="flex flex-col gap-4 max-w-6xl mx-auto">
        <h1 className="text-[24px] font-bold text-slate-900">Tasks</h1>
        <p className="text-[14px] text-slate-600">Active Project Tasks list.</p>
        <div className="rounded-2xl bg-white p-6 border border-card-border">
          <span className="text-[14px] font-semibold text-slate-900">Task management list placeholder.</span>
        </div>
      </div>
  );
}
