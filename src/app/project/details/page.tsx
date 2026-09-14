import type { Metadata } from "next";
import { AuthenticatedLayout } from "@/src/components/layout/AuthenticatedLayout";

export const metadata: Metadata = {
  title: "Details · Taskly",
};

export default function DetailsPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-4 max-w-6xl mx-auto">
        <h1 className="text-[24px] font-bold text-[#041B3C]">Project Details</h1>
        <p className="text-[14px] text-[#4F5F7B]">Settings and metadata for active project.</p>
        <div className="rounded-2xl bg-white p-6 border border-[#E8EDFF]">
          <span className="text-[14px] font-semibold text-[#041B3C]">Project details placeholder.</span>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
