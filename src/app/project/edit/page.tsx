import type { Metadata } from 'next';
import { AuthenticatedLayout } from '@/src/components/layout/AuthenticatedLayout';
import { EditProjectForm } from '@/src/components/forms/edit-project-form';

export const metadata: Metadata = {
  title: 'Edit Project · Taskly',
  description: 'Edit your project details in Taskly.',
};

export default function EditProjectPage() {
  return (
    <AuthenticatedLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Page Breadcrumbs & Title: Hidden on mobile (hidden sm:flex) */}
        <div className="hidden sm:flex flex-col gap-2">
          {/* Plain Text Breadcrumbs */}
          <div className="flex items-center gap-2 text-[12px] font-bold leading-[16px] tracking-[1.2px] uppercase">
            <span className="text-slate-600">PROJECTS</span>
            <span className="text-slate-600 font-normal">›</span>
            <span className="text-slate-600">PROJECT TITLE</span>
            <span className="text-slate-600 font-normal">›</span>
            <span className="text-primary">EDIT</span>
          </div>

          {/* Page Heading */}
          <h1 className="text-[36px] font-semibold leading-[40px] tracking-[-0.9px] text-slate-900">
            Edit Project
          </h1>
        </div>

        {/* Main Content: Form Container */}
        <div className="sm:mt-2">
          <EditProjectForm />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
