import type { Metadata } from 'next';
import { AuthenticatedLayout } from '@/src/components/layout/AuthenticatedLayout';
import { ProjectsView } from '@/src/components/projects/projectViews';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Projects · Taskly',
};

export default function ProjectsPage() {
  return (
    <AuthenticatedLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
        <ProjectsView />
      </div>
    </AuthenticatedLayout>
  );
}
