'use client';

import { useRouter } from 'next/navigation';
import type { Project } from '@/src/types/project';
import { useActiveProject } from '@/src/context/project-context';
import EpicsIcon from '@/src/components/icons/Epics';
import TasksIcon from '@/src/components/icons/Tasks';
import MembersIcon from '@/src/components/icons/Members';

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

// Epics / Tasks / Members buttons (Inter, 600, 10px / 15px, #003D9B)
// icon (20px) + no gap + text (matches Figma: icon and text are touching)
const actionBtn =
  "flex shrink-0 items-center gap-0 font-['Inter'] text-[10px] leading-[15px] font-semibold tracking-[0px] whitespace-nowrap text-[#003D9B] transition-opacity hover:opacity-80 focus:outline-none";

// Icons: 20px wide, color #003D9B (forces fill even if the SVG has a hardcoded color)
const iconCls = 'h-auto w-5 shrink-0 text-[#003D9B] [&_path]:fill-current';

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const { setActiveProject } = useActiveProject();

  const handleCardClick = () => {
    setActiveProject(project);
    router.push(`/project/${project.id}/epics`);
  };

  const handleEpicsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProject(project);
    router.push(`/project/${project.id}/epics`);
  };

  const handleTasksClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProject(project);
    router.push(`/project/${project.id}/tasks`);
  };

  const handleMembersClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProject(project);
    router.push(`/project/${project.id}/members`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex h-auto min-h-[220px] w-full min-w-0 cursor-pointer flex-col gap-4 overflow-hidden rounded-[8px] border border-[var(--color-card-border)] bg-white p-6 transition-shadow hover:shadow-md"
    >
      {/* Title + description */}
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="line-clamp-2 text-[18px] leading-7 font-semibold break-words text-[var(--color-slate-900)]">
          {project.name} II
        </h3>
        <p className="line-clamp-3 text-[14px] leading-[22.75px] font-normal break-words text-[var(--color-slate-500)]">
          {project.description}
        </p>
      </div>

      {/* Actions row: 24px padding on both sides, equal spacing between items, very light border */}
      <div className="mt-2 flex w-full items-center justify-between border-b border-[#F8FAFC] pb-4">
        <button type="button" onClick={handleEpicsClick} className={actionBtn}>
          <EpicsIcon className={iconCls} aria-hidden="true" />
          Epics
        </button>

        <button type="button" onClick={handleTasksClick} className={actionBtn}>
          <TasksIcon className={iconCls} aria-hidden="true" />
          Tasks
        </button>

        <button
          type="button"
          onClick={handleMembersClick}
          className={actionBtn}
        >
          <MembersIcon className={iconCls} aria-hidden="true" />
          Members
        </button>
      </div>

      {/* Footer */}
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
