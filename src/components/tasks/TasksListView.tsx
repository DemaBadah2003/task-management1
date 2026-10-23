'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/src/lib/api/members';
import { PAGE_SIZE, getPageItems } from '@/src/lib/pagination';
import { fetchProjectTasksPage } from '@/src/lib/tasks-api';
import type { ProjectMember, Task, TaskStatusConfig } from '@/src/types/task';

interface TasksListViewProps {
  projectId: string;
  searchTerm: string;
  accessToken: string | null;
  tokenLoading: boolean;
  members: ProjectMember[];
  statuses: TaskStatusConfig[];
  onTaskSelect: (task: Task, member?: ProjectMember) => void;
}

function statusName(status: TaskStatusConfig | undefined, value: string) {
  const label = status?.label ?? value.replace(/[_-]+/g, ' ');
  return label.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function memberName(member: ProjectMember | undefined) {
  const name = member?.full_name?.trim();
  if (name) return name.split(/\s+/).slice(0, 2).join(' ');
  return member?.email?.split('@')[0]?.replace(/[._-]+/g, ' ') || 'Unassigned';
}

function dueDateLabel(value: string | null) {
  if (!value) return '—';
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value
  );
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export default function TasksListView({
  projectId,
  searchTerm,
  accessToken,
  tokenLoading,
  members,
  statuses,
  onTaskSelect,
}: TasksListViewProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageResult, setPageResult] = useState<{
    key: string;
    tasks: Task[];
    totalCount: number | null;
  } | null>(null);
  const [requestError, setRequestError] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${projectId}:${searchTerm}:${page}:${attempt}`;

  useEffect(() => {
    if (!tokenLoading && !accessToken) {
      router.replace('/login');
    }
  }, [accessToken, router, tokenLoading]);

  useEffect(() => {
    if (tokenLoading || !accessToken) return;

    const controller = new AbortController();
    let isActive = true;

    fetchProjectTasksPage(projectId, accessToken, {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      title: searchTerm,
      signal: controller.signal,
    })
      .then((result) => {
        if (!isActive) return;
        setPageResult({
          key: requestKey,
          tasks: result.tasks.filter((task) => task.project_id === projectId),
          totalCount: result.totalCount,
        });
      })
      .catch((requestError: unknown) => {
        if (!isActive || controller.signal.aborted) return;
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Failed to load project tasks';
        setRequestError({ key: requestKey, message });
        if (requestError instanceof ApiError && requestError.status === 401) {
          router.replace('/login');
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [accessToken, attempt, page, projectId, requestKey, router, tokenLoading]);

  const currentResult = pageResult?.key === requestKey ? pageResult : null;
  const tasks = currentResult?.tasks ?? [];
  const totalCount = currentResult?.totalCount ?? null;
  const currentError =
    !tokenLoading && !accessToken
      ? 'Your session has expired. Please sign in again.'
      : requestError?.key === requestKey
        ? requestError.message
        : null;
  const loading =
    tokenLoading || (!currentResult && !currentError && Boolean(accessToken));

  const hasNextPage =
    totalCount === null
      ? tasks.length === PAGE_SIZE
      : page * PAGE_SIZE < totalCount;
  const totalPages =
    totalCount === null ? null : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <section aria-label="Project tasks list" className="min-w-0">
      {loading || tokenLoading ? (
        <div role="status" aria-busy="true" className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-lg border border-slate-100 bg-white"
            />
          ))}
          <span className="sr-only">Loading tasks...</span>
        </div>
      ) : currentError ? (
        <div
          role="alert"
          className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-red-100 bg-white p-5 text-center"
        >
          <p className="text-sm text-red-700">{currentError}</p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-100"
          >
            Retry
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 bg-white text-sm text-slate-500">
          <p>{page > 1 ? 'No tasks found on this page.' : 'No tasks found.'}</p>
          {page > 1 ? (
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Previous
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[minmax(0,1fr)_140px_180px_140px] gap-4 border-b border-slate-200 px-4 py-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            <span>Task</span>
            <span>Status</span>
            <span>Assignee</span>
            <span>Due date</span>
          </div>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-b-lg border-x border-b border-slate-100 bg-white">
            {tasks.map((task) => {
              const member = members.find(
                (candidate) => candidate.user_id === task.assignee_id
              );
              const status = statuses.find(
                (candidate) => candidate.key === task.status
              );

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onTaskSelect(task, member)}
                  aria-label={`Open task details: ${task.title}`}
                  className="focus-visible:outline-inset grid w-full grid-cols-[minmax(0,1fr)_140px_180px_140px] items-center gap-4 px-4 py-3 text-left text-xs text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <span className="min-w-0 truncate font-semibold text-slate-900">
                    {task.title}
                  </span>
                  <span className="min-w-0 truncate">
                    {statusName(status, task.status)}
                  </span>
                  <span className="min-w-0 truncate">{memberName(member)}</span>
                  <span className="min-w-0 truncate">
                    {dueDateLabel(task.due_date)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {totalCount === null
                ? `Page ${page}`
                : `${totalCount} ${totalCount === 1 ? 'task' : 'tasks'}`}
            </p>
            <nav aria-label="Task pages" className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page === 1 || loading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="h-9 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              {totalPages !== null &&
                getPageItems(page, totalPages).map((item, index) =>
                  typeof item === 'string' ? (
                    <span
                      key={`${item}-${index}`}
                      aria-hidden="true"
                      className="px-1 text-slate-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      aria-current={item === page ? 'page' : undefined}
                      disabled={loading}
                      onClick={() => setPage(item)}
                      className={`size-9 rounded-md border text-xs font-semibold ${item === page ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                type="button"
                disabled={!hasNextPage || loading}
                onClick={() => setPage((value) => value + 1)}
                className="h-9 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          </div>
        </>
      )}
    </section>
  );
}
