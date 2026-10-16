'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTaskModal } from '@/src/context/CreateTaskModalContext';
import { ApiError } from '@/src/lib/api/members';
import { fetchProjectTasksByStatus } from '@/src/lib/tasks-api';
import type {
  ProjectMember,
  Task,
  TaskStatusConfig,
} from '@/src/types/task';
import AddTaskButton from './AddTaskButton';
import ColumnEmptyState from './ColumnEmptyState';
import TaskCard from './TaskCard';

interface BoardColumnProps {
  projectId: string;
  accessToken: string | null;
  tokenLoading: boolean;
  status: TaskStatusConfig;
  members: ProjectMember[];
}

type ColumnState = 'loading' | 'success' | 'error';

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
  projectId,
  accessToken,
  tokenLoading,
  status,
  members,
}: BoardColumnProps) {
  const router = useRouter();
  const { lastCreatedTask } = useCreateTaskModal();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columnState, setColumnState] = useState<ColumnState>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (tokenLoading) {
      setColumnState('loading');
      setTasks([]);
      return;
    }

    if (!accessToken) {
      setTasks([]);
      setColumnState('error');
      return;
    }

    const controller = new AbortController();
    let isActive = true;
    setTasks([]);
    setColumnState('loading');

    fetchProjectTasksByStatus(
      projectId,
      status.key,
      accessToken,
      controller.signal,
    )
      .then((results) => {
        if (!isActive) return;
        setTasks(
          results.filter(
            (task) =>
              task.project_id === projectId && task.status === status.key,
          ),
        );
        setColumnState('success');
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return;
        setTasks([]);
        setColumnState('error');
        if (error instanceof ApiError && error.status === 401) {
          router.replace('/login');
          return;
        }
        console.error(
          `Failed to load ${status.key} tasks for project ${projectId}:`,
          error,
        );
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [accessToken, attempt, projectId, router, status.key, tokenLoading]);

  useEffect(() => {
    if (
      columnState !== 'success' ||
      lastCreatedTask?.project_id !== projectId ||
      lastCreatedTask.status !== status.key
    ) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.some((task) => task.id === lastCreatedTask.id)
        ? currentTasks
        : [...currentTasks, lastCreatedTask],
    );
  }, [columnState, lastCreatedTask, projectId, status.key]);

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  const count =
    columnState === 'loading'
      ? '…'
      : columnState === 'error'
        ? '!'
        : tasks.length;

  return (
    <section
      aria-label={`${status.label} tasks`}
      className={`${columnState === 'success' && tasks.length === 0 ? 'hidden md:flex' : 'flex'} w-full min-w-0 flex-col gap-0 md:w-[240px] md:shrink-0 md:gap-3`}
    >
      <header className="hidden min-h-6 items-center gap-2 px-1 md:flex">
        <span className={`size-1.5 shrink-0 rounded-full ${status.dotClass}`} />
        <h2 className="min-w-0 flex-1 text-[10px] font-bold tracking-wider text-slate-600 uppercase">
          {status.label}
        </h2>
        <span
          aria-label={
            columnState === 'success' ? `${tasks.length} tasks` : undefined
          }
          className={`rounded px-1.5 py-0.5 text-[10px] leading-none font-bold ${status.badgeClass}`}
        >
          {count}
        </span>
      </header>

      <div className="hidden md:block">
        <AddTaskButton variant="column" status={status.key} />
      </div>

      <div className="min-w-0">
        {columnState === 'loading' ? (
          <ColumnLoading />
        ) : columnState === 'error' ? (
          <div
            role="alert"
            className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-white px-4 text-center"
          >
            <p className="text-xs text-red-700">
              <span className="md:hidden">{status.label}: </span>
              {accessToken
                ? 'Failed to load tasks for this status.'
                : 'Your session has expired. Please sign in again.'}
            </p>
            <button
              type="button"
              onClick={retry}
              className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100"
            >
              Retry
            </button>
          </div>
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
                assignee={members.find((member) => member.user_id === task.assignee_id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
