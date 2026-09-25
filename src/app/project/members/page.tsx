import type { Metadata } from "next";
import { AuthenticatedLayout } from "@/src/components/layout/AuthenticatedLayout";

export const metadata: Metadata = {
  title: "Members · Taskly",
};

export default function MembersPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-4 max-w-6xl mx-auto">
        <h1 className="text-[24px] font-bold text-slate-900">Project Members</h1>
        <p className="text-[14px] text-slate-600">Members assigned to active project.</p>
        <div className="rounded-2xl bg-white p-6 border border-card-border">
          <span className="text-[14px] font-semibold text-slate-900">Project members list placeholder.</span>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
