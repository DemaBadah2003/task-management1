import type { Metadata } from "next";
import { AuthenticatedLayout } from "@/src/components/layout/AuthenticatedLayout";

export const metadata: Metadata = {
  title: "Members · Taskly",
};

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectMembersPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-4 max-w-6xl mx-auto p-6">
        <h1 className="text-[24px] font-bold text-slate-900">Project Members</h1>
        <p className="text-[14px] text-slate-600">
          Members assigned to active project (Project ID: {projectId}).
        </p>
        <div className="rounded-2xl bg-white p-6 border border-card-border">
          <span className="text-[14px] font-semibold text-slate-900">
            Project members list placeholder.
          </span>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
