import type { Task, TaskStatusConfig } from '@/src/types/task';
import AddTaskButton from './AddTaskButton';
import ColumnEmptyState from './ColumnEmptyState';
import TaskCard from './TaskCard';

interface BoardColumnProps {
  status: TaskStatusConfig;
  tasks?: Task[];
}

export default function BoardColumn({ status, tasks = [] }: BoardColumnProps) {
  return (
    <section
      aria-label={status.label}
      className="flex w-[85vw] max-w-[320px] shrink-0 snap-start flex-col gap-3 sm:w-[240px] sm:max-w-none"
    >
      <header className="flex items-center gap-2 px-1">
        <span className={`size-1.5 rounded-full ${status.dotClass}`} />
        <h3 className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
          {status.label}
        </h3>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] leading-none font-bold ${status.badgeClass}`}
        >
          {tasks.length}
        </span>
      </header>

      <div className="hidden md:block">
        <AddTaskButton variant="column" />
      </div>

      {tasks.length === 0 ? (
        <ColumnEmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}
