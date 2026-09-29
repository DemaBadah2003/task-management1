import type { Metadata } from 'next';
import { ProjectsView } from '@/src/components/projects/projectViews';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Projects · Taskly',
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
      <ProjectsView />
    </div>
  );
}
