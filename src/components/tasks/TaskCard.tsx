import CalendarDays from '@/src/components/icons/CalendarDays';
import type { Task } from '@/src/types/task';

export default function TaskCard({ task }: { task: Task }) {
  const due = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <article className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
      <h4 className="text-xs font-medium text-slate-800">{task.title}</h4>
      {due && (
        <div className="mt-3 flex items-center gap-1 text-[9px] font-semibold text-slate-400 uppercase">
          <CalendarDays className="size-3" />
          {due}
        </div>
      )}
    </article>
  );
}
