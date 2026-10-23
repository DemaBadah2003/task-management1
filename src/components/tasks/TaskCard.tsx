import CalendarDays from '@/src/components/icons/CalendarDays';
import { TASK_STATUSES } from '@/src/constants/task-statuses';
import type { ProjectMember, Task } from '@/src/types/task';

function formatDueDate(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const today = new Date();
  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return 'TODAY';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  })
    .format(date)
    .toUpperCase();
}

function getInitials(member?: ProjectMember) {
  const name = member?.full_name?.trim() || member?.email?.split('@')[0] || '';
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  if (parts.length > 1) {
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }
  return parts[0]?.slice(0, 2).toUpperCase() || '?';
}

export default function TaskCard({
  task,
  assignee,
  onClick,
}: {
  task: Task;
  assignee?: ProjectMember;
  onClick?: () => void;
}) {
  const due = task.due_date ? formatDueDate(task.due_date) : null;
  const status = TASK_STATUSES.find((item) => item.key === task.status);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Open task details: ${task.title}`}
      className="flex min-h-[88px] min-w-0 cursor-pointer flex-col rounded-lg border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-blue-600"
    >
      {status ? (
        <div className="mb-2 flex justify-end md:hidden">
          <span
            className={`rounded-sm px-1.5 py-0.5 text-[8px] leading-none font-bold ${status.badgeClass}`}
          >
            {status.label}
          </span>
        </div>
      ) : null}
      <h3 className="break-words text-xs leading-4 font-semibold text-slate-800">
        {task.title}
      </h3>
      <div className="mt-auto flex min-w-0 items-center justify-between gap-2 pt-3">
        {due ? (
          <div className="flex min-w-0 items-center gap-1 text-[9px] font-semibold text-blue-800 uppercase">
            <CalendarDays aria-hidden="true" className="size-3 shrink-0" />
            <time className="truncate" dateTime={task.due_date ?? undefined}>
              {due}
            </time>
          </div>
        ) : (
          <span />
        )}
        {task.assignee_id ? (
          <span
            aria-label={`Assigned to ${assignee?.full_name ?? assignee?.email ?? 'project member'}`}
            title={assignee?.full_name ?? assignee?.email ?? undefined}
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#D7E2FF] text-[9px] leading-none font-bold text-[#003D9B]"
          >
            {getInitials(assignee)}
          </span>
        ) : null}
      </div>
    </article>
  );
}
