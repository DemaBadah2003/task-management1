import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthenticatedLayout } from '@/src/components/layout/AuthenticatedLayout';

export const metadata: Metadata = {
  title: 'Projects · Taskly',
  description: 'Manage your Taskly projects.',
};

export default function ProjectsPage() {
  return (
    <AuthenticatedLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[36px] font-semibold leading-[40px] tracking-[-0.9px] text-[#041B3C]">
              Projects
            </h1>
            <p className="mt-1 text-[14px] text-[#4F5F7B]">
              Overview of all active and created projects.
            </p>
          </div>
          <Link
            href="/project/add"
            className="inline-flex items-center gap-2 rounded-[4px] bg-[#003D9B] px-5 py-2.5 text-[14px] font-bold text-white shadow-[0px_4px_6px_-4px_rgba(0,61,155,0.2)] transition-all hover:bg-[#002B70]"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Project
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
