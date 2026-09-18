import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthenticatedLayout } from '@/src/components/layout/AuthenticatedLayout';
import { ProjectCard } from '@/src/components/projects/ProjectCard';
import { AddProjectCard } from '@/src/components/projects/AddProjectCard';
import { AddProjectFab } from '@/src/components/projects/AddProjectFab';
import { ProjectsPagination } from '@/src/components/projects/ProjectsPagination';
import { ProjectsEmptyState } from '@/src/components/projects/ProjectsEmptyState';
import { getProjectsApi } from '@/src/lib/api/project';
import type { Project } from '@/src/types/project';

// منع التخزين المؤقت لضمان ظهور المشاريع الجديدة فور إضافتها
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Projects · Taskly',
};

interface ProjectsListProps {
  projects?: Project[];
}

export function ProjectsList({ projects = [] }: ProjectsListProps) {
  const hasProjects = projects.length > 0;

  return (
    <div className="@container flex flex-col gap-6">
      <div className="flex flex-row flex-wrap items-center justify-between gap-4">
        {hasProjects && (
          <Link
            href="/project/add"
            className="hidden w-fit shrink-0 items-center justify-center gap-2 rounded-[2px] px-6 py-3 text-center align-middle text-[16px] leading-[24px] font-medium tracking-[0px] whitespace-nowrap text-white shadow-[0px_1px_2px_0px_#0000000D] md:flex"
            style={{
              background: 'linear-gradient(135deg, #003D9B 0%, #0052CC 100%)',
            }}
          >
            Create New Project
          </Link>
        )}
      </div>

      {hasProjects ? (
        <>
          <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            <AddProjectCard />
          </div>

          <div className="mt-[138.5px]">
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

export default async function ProjectsPage() {
  let projects: Project[] = [];

  try {
    projects = await getProjectsApi();
  } catch (error) {
    console.error('Failed to fetch projects in ProjectsPage:', error);
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-[36px] leading-[40px] font-semibold tracking-[-0.9px] text-[#041B3C]">
            Projects
          </h1>
          <p className="text-[14px] leading-[20px] text-[#4F5F7B]">
            Manage and curate your projects
          </p>
        </div>

        <ProjectsList projects={projects} />
      </div>
    </AuthenticatedLayout>
  );
}
