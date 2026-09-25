import type { Metadata } from "next";
import { AuthenticatedLayout } from "@/src/components/layout/AuthenticatedLayout";

export const metadata: Metadata = {
  title: "Epics · Taskly",
};

export default function EpicsPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-4 max-w-6xl mx-auto">
        <h1 className="text-[24px] font-bold text-slate-900">Epics</h1>
        <p className="text-[14px] text-slate-600">Active Project Epics and Milestones.</p>
        <div className="rounded-2xl bg-white p-6 border border-card-border">
          <span className="text-[14px] font-semibold text-slate-900">No epics found yet.</span>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
