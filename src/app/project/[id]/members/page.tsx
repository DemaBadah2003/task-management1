import type { Metadata } from "next";
import { AuthenticatedLayout } from "@/src/components/layout/AuthenticatedLayout";

export const metadata: Metadata = {
  title: "Members · Taskly",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectMembersPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-4 max-w-6xl mx-auto p-6">
        <h1 className="text-[24px] font-bold text-[#041B3C]">Project Members</h1>
        <p className="text-[14px] text-[#4F5F7B]">
          Members assigned to active project (Project ID: {id}).
        </p>
        <div className="rounded-2xl bg-white p-6 border border-[#E8EDFF]">
          <span className="text-[14px] font-semibold text-[#041B3C]">
            Project members list placeholder.
          </span>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
