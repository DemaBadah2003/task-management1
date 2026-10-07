'use client';

import { useRouter } from 'next/navigation';
import type { Project } from '@/src/types/project';
import { PAGE_SIZE } from '@/src/lib/pagination';
import { ProjectsList } from '@/src/components/projects/ProjectsList';

type ProjectsViewProps = {
  initialProjects: Project[];
  totalCount: number;
  page: number;
  hasError: boolean;
};

export function ProjectsView({
  initialProjects,
  totalCount,
  page,
  hasError,
}: ProjectsViewProps) {
  const router = useRouter();
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <ProjectsList
      initialProjects={initialProjects}
      totalCount={totalCount}
      currentPage={page}
      totalPages={totalPages}
      basePath="/project"
      status={hasError ? 'error' : 'success'}
      onRetry={() => router.refresh()}
    />
  );
}
