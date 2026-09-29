import type { Metadata } from 'next';
import { CreateProjectForm } from '@/src/components/forms/create-project-form';

export const metadata: Metadata = {
  title: 'Add New Project · Taskly',
  description: 'Create a new project in Taskly.',
};

export default function AddProjectPage() {
  return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Page Breadcrumbs & Title: Hidden on mobile (hidden sm:flex) */}
        <div className="hidden flex-col gap-2 sm:flex">
          {/* Plain Text Breadcrumbs */}
          <div className="flex items-center gap-2 text-[12px] leading-[16px] font-bold tracking-[1.2px] uppercase">
            <span className="text-slate-600">PROJECTS</span>
            <span className="font-normal text-slate-600">›</span>
            <span className="text-primary">ADD NEW PROJECT</span>
          </div>

          {/* Page Heading */}
          <h1 className="text-[36px] leading-[40px] font-semibold tracking-[-0.9px] text-slate-900">
            Add New Project
          </h1>
        </div>

        {/* Main Content: Form Container */}
        <div className="sm:mt-2">
          <CreateProjectForm />
        </div>
      </div>
  );
}
