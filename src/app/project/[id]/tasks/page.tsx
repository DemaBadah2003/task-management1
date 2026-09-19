import type { Metadata } from "next";
import { AuthenticatedLayout } from "@/src/components/layout/AuthenticatedLayout";

export const metadata: Metadata = {
  title: "Tasks · Taskly",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectTasksPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-4 max-w-6xl mx-auto p-6">
        <h1 className="text-[24px] font-bold text-[#041B3C]">Tasks</h1>
        <p className="text-[14px] text-[#4F5F7B]">
          Active Project Tasks (Project ID: {id}).
        </p>
        <div className="rounded-2xl bg-white p-6 border border-[#E8EDFF]">
          <span className="text-[14px] font-semibold text-[#041B3C]">
            Task management list placeholder.
          </span>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
