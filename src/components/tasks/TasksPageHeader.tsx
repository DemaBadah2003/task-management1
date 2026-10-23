'use client';

import Search from '@/src/components/icons/Search';
import { useActiveProject } from '@/src/context/project-context';
import AddTaskButton from './AddTaskButton';

export default function TasksPageHeader({
  searchValue,
  onSearchChange,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
}) {
  const { activeProjectName } = useActiveProject();

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb: ديسكتوب فقط */}
      <nav
        aria-label="Breadcrumb"
        className="hidden text-[9px] font-semibold tracking-wider text-slate-400 uppercase md:block"
      >
        Projects <span className="mx-1">›</span>{' '}
        {activeProjectName ?? 'Project'} <span className="mx-1">›</span>
        <span className="text-slate-700">Tasks</span>
      </nav>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-headline-lg font-bold text-slate-900">
            Active Workboard
          </h1>
          <p className="mt-1 hidden text-xs text-slate-400 md:block">
            Curating Project Alpha&apos;s production pipeline and milestones.
          </p>
        </div>

        <label className="relative block w-full md:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search tasks by title"
            className="h-10 w-full rounded-md bg-[#D7E2FF] pr-3 pl-9 text-xs text-slate-700 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-200"
          />
        </label>
      </div>

      {/* Add New: عريض على الموبايل فقط */}
      <div className="md:hidden">
        <AddTaskButton variant="full" />
      </div>
    </div>
  );
}
