import type { Metadata } from "next";
import Link from "next/link";
import { AuthenticatedLayout } from "@/src/components/layout/AuthenticatedLayout";

export const metadata: Metadata = {
  title: "Details · Taskly",
};

export default function DetailsPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-[#041B3C]">Project Details</h1>
            <p className="text-[14px] text-[#4F5F7B]">Settings and metadata for active project.</p>
          </div>
          <Link
            href="/project/edit"
            className="inline-flex items-center gap-2 rounded-[4px] bg-[#003D9B] px-4 py-2 text-[14px] font-bold text-white shadow-xs transition-all hover:bg-[#002B70]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Project
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-[#E8EDFF]">
          <span className="text-[14px] font-semibold text-[#041B3C]">Project details placeholder.</span>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
