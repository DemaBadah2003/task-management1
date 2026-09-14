import type { Metadata } from "next";
import { AuthenticatedLayout } from "@/src/components/layout/AuthenticatedLayout";

export const metadata: Metadata = {
  title: "Statistics · Taskly",
  description: "View your personal statistics and task analytics.",
};

export default function StatisticsPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-[24px] font-bold text-[#041B3C]">My Statistics</h1>
          <p className="text-[14px] text-[#4F5F7B]">
            Overview of your task completion rates and performance analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-6 border border-[#E8EDFF] shadow-xs flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#737685] uppercase">Total Tasks</span>
            <span className="text-[32px] font-bold text-[#041B3C]">48</span>
          </div>
          <div className="rounded-2xl bg-white p-6 border border-[#E8EDFF] shadow-xs flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#737685] uppercase">Completed</span>
            <span className="text-[32px] font-bold text-[#10B981]">36</span>
          </div>
          <div className="rounded-2xl bg-white p-6 border border-[#E8EDFF] shadow-xs flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#737685] uppercase">In Progress</span>
            <span className="text-[32px] font-bold text-[#0052CC]">12</span>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
