import Link from 'next/link';
import type { Project } from '@/src/types/project';

interface ProjectCardProps {
  project: Project;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/project/${project.id}/epics`}
      className="flex min-h-[220px] w-full min-w-0 flex-col gap-[var(--spacing-card-gap)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-card-border)] bg-white p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="line-clamp-2 text-[length:var(--text-card-title)] leading-[var(--text-card-title--line-height)] font-[var(--text-card-title--font-weight)] break-words text-[var(--color-slate-900)]">
          {project.name}
        </h3>
        <p className="line-clamp-2 text-[length:var(--text-card-desc)] leading-[var(--text-card-desc--line-height)] font-[var(--text-card-desc--font-weight)] break-words text-[var(--color-slate-500)]">
          {project.description}
        </p>
      </div>

      {/* flex-wrap عشان لو ضاق الكارد ينزلوا سطر بدل ما ينقصّوا */}
      <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-2">
        <span className="flex shrink-0 items-center gap-1 text-[length:var(--text-badge-sm)] leading-[var(--text-badge-sm--line-height)] font-[var(--text-badge-sm--font-weight)] whitespace-nowrap text-[var(--color-primary)]">
          <span
            className="icon-primary h-[15.07px] w-5 shrink-0"
            style={{
              maskImage: 'url(/icons/Epics.svg)',
              WebkitMaskImage: 'url(/icons/Epics.svg)',
            }}
          />
          Epics
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[length:var(--text-badge-sm)] leading-[var(--text-badge-sm--line-height)] font-[var(--text-badge-sm--font-weight)] whitespace-nowrap text-[var(--color-primary)]">
          <span
            className="icon-primary h-[15.07px] w-5 shrink-0"
            style={{
              maskImage: 'url(/icons/Tasks.svg)',
              WebkitMaskImage: 'url(/icons/Tasks.svg)',
            }}
          />
          Tasks
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[length:var(--text-badge-sm)] leading-[var(--text-badge-sm--line-height)] font-[var(--text-badge-sm--font-weight)] whitespace-nowrap text-[var(--color-primary)]">
          <span
            className="icon-primary h-[15.07px] w-5 shrink-0"
            style={{
              maskImage: 'url(/icons/Members.svg)',
              WebkitMaskImage: 'url(/icons/Members.svg)',
            }}
          />
          Members
        </span>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <span className="text-[length:var(--text-label-neg-sm)] leading-[var(--text-label-neg-sm--line-height)] font-[var(--text-label-neg-sm--font-weight)] tracking-[var(--text-label-neg-sm--letter-spacing)] whitespace-nowrap text-[var(--color-surface-medium)] uppercase">
          Created At
        </span>
        <span className="text-[length:var(--text-body-md)] leading-[1.25rem] font-medium whitespace-nowrap text-[var(--color-slate-500)]">
          {formatDate(project.createdAt)}
        </span>
      </div>
    </Link>
  );
}
