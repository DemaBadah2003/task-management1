'use client';

import { useRouter } from 'next/navigation';
import type { Project } from '@/src/types/project';

interface ProjectCardProps {
  project: Project;
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/project/${project.id}/epics`);
  };

  const handleEpicsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/project/${project.id}/epics`);
  };

  const handleTasksClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/project/${project.id}/tasks`);
  };

  const handleMembersClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/project/${project.id}/members`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex min-h-[220px] w-full min-w-0 cursor-pointer flex-col gap-[var(--spacing-card-gap)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-card-border)] bg-white p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="line-clamp-2 text-[length:var(--text-card-title)] leading-[var(--text-card-title--line-height)] font-[var(--text-card-title--font-weight)] break-words text-[var(--color-slate-900)]">
          {project.name}
        </h3>
        <p className="line-clamp-2 text-[length:var(--text-card-desc)] leading-[var(--text-card-desc--line-height)] font-[var(--text-card-desc--font-weight)] break-words text-[var(--color-slate-500)]">
          {project.description}
        </p>
      </div>

      <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-2">
        <button
          type="button"
          onClick={handleEpicsClick}
          className="flex shrink-0 items-center gap-1 text-[length:var(--text-badge-sm)] leading-[var(--text-badge-sm--line-height)] font-[var(--text-badge-sm--font-weight)] whitespace-nowrap text-[var(--color-primary)] transition-opacity hover:opacity-80 focus:outline-none"
        >
          <span
            className="icon-primary h-[15.07px] w-5 shrink-0"
            style={{
              maskImage: 'url(/icons/Epics.svg)',
              WebkitMaskImage: 'url(/icons/Epics.svg)',
            }}
          />
          Epics
        </button>

        <button
          type="button"
          onClick={handleTasksClick}
          className="flex shrink-0 items-center gap-1 text-[length:var(--text-badge-sm)] leading-[var(--text-badge-sm--line-height)] font-[var(--text-badge-sm--font-weight)] whitespace-nowrap text-[var(--color-primary)] transition-opacity hover:opacity-80 focus:outline-none"
        >
          <span
            className="icon-primary h-[15.07px] w-5 shrink-0"
            style={{
              maskImage: 'url(/icons/Tasks.svg)',
              WebkitMaskImage: 'url(/icons/Tasks.svg)',
            }}
          />
          Tasks
        </button>

        <button
          type="button"
          onClick={handleMembersClick}
          className="flex shrink-0 items-center gap-1 text-[length:var(--text-badge-sm)] leading-[var(--text-badge-sm--line-height)] font-[var(--text-badge-sm--font-weight)] whitespace-nowrap text-[var(--color-primary)] transition-opacity hover:opacity-80 focus:outline-none"
        >
          <span
            className="icon-primary h-[15.07px] w-5 shrink-0"
            style={{
              maskImage: 'url(/icons/Members.svg)',
              WebkitMaskImage: 'url(/icons/Members.svg)',
            }}
          />
          Members
        </button>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <span className="text-[length:var(--text-label-neg-sm)] leading-[var(--text-label-neg-sm--line-height)] font-[var(--text-label-neg-sm--font-weight)] tracking-[var(--text-label-neg-sm--letter-spacing)] whitespace-nowrap text-[var(--color-surface-medium)] uppercase">
          Created At
        </span>
        <span className="text-[length:var(--text-body-md)] leading-[1.25rem] font-medium whitespace-nowrap text-[var(--color-slate-500)]">
          {formatDate(project.createdAt)}
        </span>
      </div>
    </div>
  );
}
