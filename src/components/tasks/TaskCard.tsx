import CalendarDays from '@/src/components/icons/CalendarDays';
import { TASK_STATUSES } from '@/src/constants/task-statuses';
import { useDraggable } from '@dnd-kit/react';
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
  isUpdating = false,
}: {
  task: Task;
  assignee?: ProjectMember;
  onClick?: () => void;
  isUpdating?: boolean;
}) {
  const due = task.due_date ? formatDueDate(task.due_date) : null;
  const status = TASK_STATUSES.find((item) => item.key === task.status);
  const { ref, handleRef, isDragging } = useDraggable({
    id: task.id,
    type: 'task',
    data: { kind: 'task', taskId: task.id, status: task.status },
    disabled: isUpdating,
  });

  return (
    <article
      ref={ref}
      aria-busy={isUpdating || undefined}
      onClick={onClick}
      className={`flex min-h-[88px] min-w-0 cursor-pointer flex-col rounded-lg border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        {status ? (
          <span
            className={`rounded-sm px-1.5 py-0.5 text-[8px] leading-none font-bold md:hidden ${status.badgeClass}`}
          >
            {status.label}
          </span>
        ) : (
          <span />
        )}
        <button
          ref={handleRef}
          type="button"
          disabled={isUpdating}
          aria-label={`Move ${task.title} to another status`}
          title="Drag to move task"
          onClick={(event) => event.stopPropagation()}
          className="flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600 active:cursor-grabbing disabled:cursor-wait disabled:opacity-50"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-4"
          >
            <circle cx="5" cy="3" r="1" />
            <circle cx="11" cy="3" r="1" />
            <circle cx="5" cy="8" r="1" />
            <circle cx="11" cy="8" r="1" />
            <circle cx="5" cy="13" r="1" />
            <circle cx="11" cy="13" r="1" />
          </svg>
        </button>
      </div>
      <h3 className="break-words text-xs leading-4 font-semibold text-slate-800">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClick?.();
          }}
          className="text-left focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          {task.title}
        </button>
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
