import type { Metadata } from 'next';
import { AuthenticatedLayout } from '@/src/components/layout/AuthenticatedLayout';

export const metadata: Metadata = {
  title: 'Projects · Taskly',
  description: 'Manage your Taskly projects.',
};

export default function ProjectsPage() {
  return (
    <AuthenticatedLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Page Title & Breadcrumb */}
      </div>
    </AuthenticatedLayout>
  );
}
