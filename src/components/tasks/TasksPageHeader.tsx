import Search from '@/src/components/icons/Search';
import AddTaskButton from './AddTaskButton';

export default function TasksPageHeader() {
  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb: ديسكتوب فقط */}
      <nav
        aria-label="Breadcrumb"
        className="hidden text-[9px] font-semibold tracking-wider text-slate-400 uppercase md:block"
      >
        Projects <span className="mx-1">›</span> Rafiq{' '}
        <span className="mx-1">›</span>
        <span className="text-slate-700">Tasks</span>
      </nav>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
            Active Workboard
          </h1>
          <p className="mt-1 hidden text-xs text-slate-400 md:block">
            Curating Project Alpha&apos;s production pipeline and milestones.
          </p>
        </div>

        {/* UI only: بلا state ولا طلبات */}
        <label className="relative block w-full md:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="h-9 w-full rounded-md bg-blue-50/60 pr-3 pl-9 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
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
