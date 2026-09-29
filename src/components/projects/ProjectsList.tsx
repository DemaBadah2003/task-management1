import { ProjectCard } from './ProjectCard';
import { AddProjectCard } from './AddProjectCard';
import { AddProjectFab } from './AddProjectFab';
import { ProjectsPagination } from './ProjectsPagination';
import { ProjectsEmptyState } from './ProjectsEmptyState';
import { ProjectsLoadingSkeleton } from './ProjectsLoadingSkeleton';
import { ProjectsErrorState } from './ProjectsErrorState';
import Link from 'next/link';
import type { Project } from '@/src/types/project';

type ProjectsStatus = 'loading' | 'success' | 'error';

interface ProjectsListProps {
  projects?: Project[];
  status?: ProjectsStatus;
  onRetry?: () => void;
}

export function ProjectsList({
  projects = [],
  status = 'success',
  onRetry,
}: ProjectsListProps) {
  if (status === 'loading') {
    return <ProjectsLoadingSkeleton />;
  }

  if (status === 'error') {
    return <ProjectsErrorState onRetry={onRetry ?? (() => {})} />;
  }

  const hasProjects = projects.length > 0;

  return (
    <div className="@container flex flex-1 flex-col gap-6">
      {hasProjects ? (
        <>
          <div className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-[36px] leading-[40px] font-semibold tracking-[-0.9px] text-slate-900">
                Projects
              </h1>
              <p className="text-[14px] leading-[20px] text-slate-600">
                Manage and curate your projects
              </p>
            </div>

            <Link
              href="/project/add"
              className="bg-btn-gradient-card hidden w-fit shrink-0 items-center justify-center gap-2 rounded-[2px] px-6 py-3 text-center align-middle text-[16px] leading-[24px] font-medium tracking-[0px] whitespace-nowrap text-white md:flex"
            >
              Create New Project
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            <AddProjectCard />
          </div>

          <div className="mt-auto flex min-h-10 w-full items-center justify-center pt-8 md:justify-end">
            <ProjectsPagination />
          </div>

          <AddProjectFab />
        </>
      ) : (
        <ProjectsEmptyState />
      )}
    </div>
  );
}
