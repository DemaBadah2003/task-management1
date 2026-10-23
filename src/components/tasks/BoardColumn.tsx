'use client';

import { useEffect, useRef } from 'react';
import type { ProjectMember, Task, TaskStatusConfig } from '@/src/types/task';
import AddTaskButton from './AddTaskButton';
import ColumnEmptyState from './ColumnEmptyState';
import TaskCard from './TaskCard';

interface BoardColumnProps {
  status: TaskStatusConfig;
  tasks: Task[];
  loading: boolean;
  infiniteEnabled: boolean;
  hasMore: boolean;
  loadMoreError: boolean;
  onLoadMore: () => void;
  members: ProjectMember[];
  onTaskSelect: (task: Task, assignee?: ProjectMember) => void;
}

function ColumnLoading() {
  return (
    <>
      <div
        aria-label="Loading tasks"
        aria-busy="true"
        className="h-24 animate-pulse rounded-lg border border-slate-100 bg-white p-3 shadow-sm md:hidden"
      >
        <div className="h-2 w-16 rounded bg-slate-100" />
        <div className="mt-4 h-3 w-4/5 rounded bg-slate-100" />
        <div className="mt-2 h-3 w-3/5 rounded bg-slate-100" />
      </div>
      <div
        aria-label="Loading tasks"
        aria-busy="true"
        className="hidden space-y-3 md:block"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg border border-slate-100 bg-white p-3 shadow-sm"
          >
            <div className="h-2 w-16 rounded bg-slate-100" />
            <div className="mt-4 h-3 w-4/5 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-3/5 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </>
  );
}

export default function BoardColumn({
  status,
  tasks,
  loading,
  infiniteEnabled,
  hasMore,
  loadMoreError,
  onLoadMore,
  members,
  onTaskSelect,
}: BoardColumnProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      !infiniteEnabled ||
      loading ||
      !hasMore ||
      loadMoreError ||
      !sentinelRef.current
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { rootMargin: '240px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [
    hasMore,
    infiniteEnabled,
    loadMoreError,
    loading,
    onLoadMore,
    tasks.length,
  ]);

  const count = loading && tasks.length === 0 ? '…' : tasks.length;

  return (
    <section
      aria-label={`${status.label} tasks`}
      className={`${!loading && tasks.length === 0 ? 'hidden md:flex' : 'flex'} w-full min-w-0 flex-col gap-0 md:w-60 md:shrink-0 md:gap-3`}
    >
      <header className="hidden min-h-6 items-center gap-2 px-1 md:flex">
        <span className={`size-1.5 shrink-0 rounded-full ${status.dotClass}`} />
        <h2 className="min-w-0 flex-1 text-[10px] font-bold tracking-wider text-slate-600 uppercase">
          {status.label}
        </h2>
        <span
          aria-label={!loading ? `${tasks.length} tasks` : undefined}
          className={`rounded px-1.5 py-0.5 text-[10px] leading-none font-bold ${status.badgeClass}`}
        >
          {count}
        </span>
      </header>

      <div className="hidden md:block">
        <AddTaskButton variant="column" status={status.key} />
      </div>

      <div className="min-w-0">
        {loading && tasks.length === 0 ? (
          <ColumnLoading />
        ) : tasks.length === 0 ? (
          <div className="hidden md:block">
            <ColumnEmptyState />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                assignee={members.find(
                  (member) => member.user_id === task.assignee_id
                )}
                onClick={() =>
                  onTaskSelect(
                    task,
                    members.find(
                      (member) => member.user_id === task.assignee_id
                    )
                  )
                }
              />
            ))}
          </div>
        )}
        {infiniteEnabled && hasMore && !loadMoreError ? (
          <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />
        ) : null}
      </div>
    </section>
  );
}
