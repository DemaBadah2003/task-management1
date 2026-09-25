import type { Metadata } from "next";
import { AuthenticatedLayout } from "@/src/components/layout/AuthenticatedLayout";

export const metadata: Metadata = {
  title: "Tasks · Taskly",
};

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectTasksPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-4 max-w-6xl mx-auto p-6">
        <h1 className="text-[24px] font-bold text-slate-900">Tasks</h1>
        <p className="text-[14px] text-slate-600">
          Active Project Tasks (Project ID: {projectId}).
        </p>
        <div className="rounded-2xl bg-white p-6 border border-card-border">
          <span className="text-[14px] font-semibold text-slate-900">
            Task management list placeholder.
          </span>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
