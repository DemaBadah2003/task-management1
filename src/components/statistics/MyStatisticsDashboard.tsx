'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TASK_STATUSES } from '@/src/constants/task-statuses';
import { useAccessToken } from '@/src/hooks/useAccessToken';
import { getProjectsApi } from '@/src/lib/api/project';
import { ApiError } from '@/src/lib/api/auth';
import {
  fetchCalendarTaskStats,
  fetchTaskCountsPerProject,
  type CalendarTaskStats,
  type ProjectTaskCount,
} from '@/src/lib/statistics-api';
import type { Project } from '@/src/types/project';
import type { TaskStatus } from '@/src/types/task';

interface KeyedResult<T> {
  key: string;
  value: T | null;
  error: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const STATUS_COLORS: Record<TaskStatus, string> = {
  TO_DO: '#64748b',
  IN_PROGRESS: '#2563eb',
  BLOCKED: '#dc2626',
  IN_REVIEW: '#7c3aed',
  READY_FOR_QA: '#d97706',
  REOPENED: '#e11d48',
  READY_FOR_PRODUCTION: '#0891b2',
  DONE: '#059669',
};

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function currentWeekRange() {
  const today = new Date();
  const start = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return { startDate: dateInputValue(start), endDate: dateInputValue(end) };
}

function rangeLength(startDate: string, endDate: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
  ) {
    return null;
  }
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    dateInputValue(new Date(start)) !== startDate ||
    dateInputValue(new Date(end)) !== endDate ||
    end < start
  ) {
    return null;
  }
  return Math.floor((end - start) / DAY_MS) + 1;
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${value}T12:00:00Z`));
}

function statusName(status: TaskStatus) {
  const label =
    TASK_STATUSES.find((item) => item.key === status)?.label ?? status;
  return label
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\bQa\b/g, 'QA');
}

function statusTotal(stats: CalendarTaskStats | null) {
  if (!stats) return 0;
  return Object.values(stats.totals).reduce(
    (sum, count) => sum + (count ?? 0),
    0
  );
}

function LoadingValue() {
  return (
    <span className="inline-block h-8 w-14 animate-pulse rounded bg-slate-100" />
  );
}

function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 border-y border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="font-semibold underline underline-offset-2"
      >
        Retry
      </button>
    </div>
  );
}

export default function MyStatisticsDashboard() {
  const { token, loading: tokenLoading } = useAccessToken();
  const router = useRouter();
  const [range, setRange] = useState(currentWeekRange);
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('');
  const [projectsResult, setProjectsResult] = useState<KeyedResult<Project[]>>({
    key: '',
    value: null,
    error: null,
  });
  const [calendarResult, setCalendarResult] = useState<
    KeyedResult<CalendarTaskStats>
  >({
    key: '',
    value: null,
    error: null,
  });
  const [projectCountsResult, setProjectCountsResult] = useState<
    KeyedResult<ProjectTaskCount[]>
  >({
    key: '',
    value: null,
    error: null,
  });
  const [retryProjects, setRetryProjects] = useState(0);
  const [retryStats, setRetryStats] = useState(0);
  const [retryProjectCounts, setRetryProjectCounts] = useState(0);

  const daysInRange = rangeLength(range.startDate, range.endDate);
  const rangeError =
    daysInRange === null
      ? 'Choose a valid start and end date.'
      : daysInRange > 7
        ? 'Select no more than 7 calendar days.'
        : null;
  const filterKey = `${range.startDate}:${range.endDate}:${projectId}:${status}:${retryStats}`;
  const projectCountsKey = `${range.startDate}:${range.endDate}:${retryProjectCounts}`;
  const projectListKey = `${token ? 'authenticated' : 'anonymous'}:${retryProjects}`;
  const projects =
    projectsResult.key === projectListKey ? projectsResult.value : null;
  const calendarStats =
    calendarResult.key === filterKey ? calendarResult.value : null;
  const calendarError =
    calendarResult.key === filterKey ? calendarResult.error : null;
  const projectCounts =
    projectCountsResult.key === projectCountsKey
      ? projectCountsResult.value
      : null;
  const projectCountsError =
    projectCountsResult.key === projectCountsKey
      ? projectCountsResult.error
      : null;
  const projectsError =
    projectsResult.key === projectListKey ? projectsResult.error : null;
  const projectsLoading =
    tokenLoading || Boolean(token && !projects && !projectsError);
  const calendarLoading =
    !rangeError &&
    (tokenLoading || Boolean(token && !calendarStats && !calendarError));
  const projectCountsLoading =
    !rangeError &&
    (tokenLoading || Boolean(token && !projectCounts && !projectCountsError));

  const calendarDays = useMemo(() => {
    if (!daysInRange || daysInRange > 7) return [];
    const days: string[] = [];
    const cursor = new Date(`${range.startDate}T00:00:00Z`);
    for (let index = 0; index < daysInRange; index += 1) {
      days.push(dateInputValue(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return days;
  }, [daysInRange, range.startDate]);

  useEffect(() => {
    if (tokenLoading) return;
    if (!token) {
      router.replace('/login');
      return;
    }

    let isActive = true;
    getProjectsApi()
      .then((data) => {
        if (isActive)
          setProjectsResult({ key: projectListKey, value: data, error: null });
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        if (error instanceof ApiError && error.status === 401)
          router.replace('/login');
        setProjectsResult({
          key: projectListKey,
          value: null,
          error:
            error instanceof Error ? error.message : 'Failed to load projects.',
        });
      });

    return () => {
      isActive = false;
    };
  }, [projectListKey, router, token, tokenLoading]);

  useEffect(() => {
    if (tokenLoading || !token || rangeError) return;

    const controller = new AbortController();
    let isActive = true;
    fetchCalendarTaskStats(
      token,
      {
        startDate: range.startDate,
        endDate: range.endDate,
        projectId: projectId || null,
        status: (status || null) as TaskStatus | null,
      },
      controller.signal
    )
      .then((value) => {
        if (isActive) setCalendarResult({ key: filterKey, value, error: null });
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401)
          router.replace('/login');
        setCalendarResult({
          key: filterKey,
          value: null,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to load task statistics.',
        });
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [
    filterKey,
    projectId,
    range.endDate,
    range.startDate,
    rangeError,
    router,
    status,
    token,
    tokenLoading,
  ]);

  useEffect(() => {
    if (tokenLoading || !token || rangeError) return;

    const controller = new AbortController();
    let isActive = true;
    fetchTaskCountsPerProject(
      token,
      range.startDate,
      range.endDate,
      controller.signal
    )
      .then((value) => {
        if (isActive)
          setProjectCountsResult({ key: projectCountsKey, value, error: null });
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401)
          router.replace('/login');
        setProjectCountsResult({
          key: projectCountsKey,
          value: null,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to load project statistics.',
        });
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [
    projectCountsKey,
    range.endDate,
    range.startDate,
    rangeError,
    router,
    token,
    tokenLoading,
  ]);

  const chartEntries = TASK_STATUSES.flatMap(({ key }) => {
    const count = calendarStats?.totals[key] ?? 0;
    return count > 0 ? [{ key, count, color: STATUS_COLORS[key] }] : [];
  });
  const chartTotal = chartEntries.reduce((sum, item) => sum + item.count, 0);
  let chartCursor = 0;
  const chartGradient =
    chartTotal > 0
      ? `conic-gradient(${chartEntries
          .map((item) => {
            const start = chartCursor;
            chartCursor += (item.count / chartTotal) * 100;
            return `${item.color} ${start}% ${chartCursor}%`;
          })
          .join(', ')})`
      : 'conic-gradient(#e2e8f0 0% 100%)';

  const dailyByDay = new Map(
    calendarStats?.daily.map((item) => [item.day, item]) ?? []
  );
  const updateRange = (field: 'startDate' | 'endDate', value: string) => {
    setRange((current) => ({ ...current, [field]: value }));
  };
  const retryCalendar = () => setRetryStats((value) => value + 1);
  const retryProjectsList = () => setRetryProjects((value) => value + 1);
  const retryCounts = () => setRetryProjectCounts((value) => value + 1);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-blue-800 uppercase">
            Personal analytics
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            My Statistics
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Task activity for the selected period
        </p>
      </header>

      <section
        aria-label="Statistics filters"
        className="grid gap-3 border-y border-slate-200 py-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto] lg:items-end"
      >
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
          Start date
          <input
            aria-label="Start date"
            type="date"
            value={range.startDate}
            onChange={(event) => updateRange('startDate', event.target.value)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
          End date
          <input
            aria-label="End date"
            type="date"
            value={range.endDate}
            onChange={(event) => updateRange('endDate', event.target.value)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
          Project
          <select
            aria-label="Project filter"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            disabled={projectsLoading || Boolean(projectsError)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
          >
            <option value="">All Projects</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
          Status
          <select
            aria-label="Status filter"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Statuses</option>
            {TASK_STATUSES.map((item) => (
              <option key={item.key} value={item.key}>
                {statusName(item.key)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            const week = currentWeekRange();
            setRange(week);
            setProjectId('');
            setStatus('');
          }}
          className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          This week
        </button>
        {rangeError ? (
          <p
            role="alert"
            className="text-sm font-medium text-red-700 sm:col-span-2 lg:col-span-5"
          >
            {rangeError}
          </p>
        ) : null}
        {projectsError ? (
          <div className="sm:col-span-2 lg:col-span-5">
            <ErrorPanel message={projectsError} onRetry={retryProjectsList} />
          </div>
        ) : null}
      </section>

      {calendarError ? (
        <ErrorPanel message={calendarError} onRetry={retryCalendar} />
      ) : null}
      <section aria-label="Task summary" className="grid gap-3 sm:grid-cols-3">
        <article className="flex min-h-28 flex-col justify-between border-l-4 border-blue-700 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-xs font-bold tracking-wide text-slate-600 uppercase">
            Total Tasks
          </h2>
          {calendarLoading ? (
            <LoadingValue />
          ) : (
            <p className="text-3xl font-bold text-slate-950">
              {calendarStats?.total_tasks ?? '—'}
            </p>
          )}
        </article>
        <article className="flex min-h-28 flex-col justify-between border-l-4 border-emerald-600 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-xs font-bold tracking-wide text-slate-600 uppercase">
            Completed Tasks
          </h2>
          {calendarLoading ? (
            <LoadingValue />
          ) : (
            <p className="text-3xl font-bold text-slate-950">
              {calendarStats?.done_tasks ?? '—'}
            </p>
          )}
        </article>
        <article className="flex min-h-28 flex-col justify-between border-l-4 border-rose-600 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-xs font-bold tracking-wide text-slate-600 uppercase">
            Overdue Tasks
          </h2>
          {calendarLoading ? (
            <LoadingValue />
          ) : (
            <p className="text-3xl font-bold text-slate-950">
              {calendarStats?.overdue_tasks ?? '—'}
            </p>
          )}
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Weekly Planner
              </h2>
              <p className="text-xs text-slate-500">
                {range.startDate} – {range.endDate}
              </p>
            </div>
            {calendarLoading ? (
              <span role="status" className="text-xs text-slate-500">
                Loading calendar…
              </span>
            ) : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
            {calendarDays.map((day) => {
              const data = dailyByDay.get(day);
              const statuses = Object.entries(data?.statuses ?? {}) as [
                TaskStatus,
                number,
              ][];
              const dayTotal = statuses.reduce(
                (sum, [, count]) => sum + count,
                0
              );
              return (
                <article
                  key={day}
                  className="min-h-32 border border-slate-200 bg-white p-3"
                >
                  <h3 className="border-b border-slate-100 pb-2 text-xs font-bold text-slate-800">
                    {formatDay(day)}
                  </h3>
                  {calendarLoading ? (
                    <div className="mt-3 h-12 animate-pulse rounded bg-slate-100" />
                  ) : dayTotal === 0 ? (
                    <p className="mt-4 text-xs text-slate-400">No Tasks</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {statuses.map(([key, count]) => (
                        <li
                          key={key}
                          className="flex items-center justify-between gap-2 text-[11px]"
                        >
                          <span className="flex min-w-0 items-center gap-1.5 text-slate-600">
                            <span
                              aria-hidden="true"
                              className="size-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: STATUS_COLORS[key] }}
                            />
                            <span className="truncate">{statusName(key)}</span>
                          </span>
                          <span className="font-semibold text-slate-900">
                            {count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <section
          aria-labelledby="status-chart-title"
          className="border-y border-slate-200 py-4 xl:border-y-0 xl:border-l xl:pl-6"
        >
          <h2
            id="status-chart-title"
            className="text-base font-bold text-slate-900"
          >
            Tasks by Status
          </h2>
          {calendarLoading ? (
            <div
              role="status"
              className="mt-5 flex h-48 items-center justify-center"
            >
              <div className="size-36 animate-pulse rounded-full bg-slate-100" />
            </div>
          ) : chartTotal === 0 ? (
            <p className="py-10 text-sm text-slate-500">
              No task data for this period.
            </p>
          ) : (
            <>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-5">
                <div
                  role="img"
                  aria-label={`${chartTotal} tasks by status`}
                  className="relative size-40 shrink-0 rounded-full"
                  style={{ background: chartGradient }}
                >
                  <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-2xl font-bold text-slate-900">
                      {chartTotal}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Total
                    </span>
                  </div>
                </div>
                <ul className="min-w-36 space-y-2">
                  {chartEntries.map((item) => (
                    <li
                      key={item.key}
                      className="flex items-center justify-between gap-4 text-xs"
                    >
                      <span className="flex items-center gap-2 text-slate-600">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {statusName(item.key)}
                      </span>
                      <span className="font-bold text-slate-900">
                        {item.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </section>
      </section>

      <section
        aria-labelledby="projects-stats-title"
        className="border-t border-slate-200 pt-4"
      >
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="projects-stats-title"
            className="text-base font-bold text-slate-900"
          >
            All Projects
          </h2>
          <span className="text-xs text-slate-500">
            Date-range counts; project and status filters are not supported
            here.
          </span>
        </div>
        {projectCountsError ? (
          <ErrorPanel message={projectCountsError} onRetry={retryCounts} />
        ) : null}
        {projectCountsLoading ? (
          <div role="status" aria-busy="true" className="space-y-2">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-11 animate-pulse border-b border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : !projectCountsError && (projectCounts?.length ?? 0) === 0 ? (
          <p className="py-6 text-sm text-slate-500">
            No project tasks found for this date range.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
            {projectCounts?.map((item) => (
              <li
                key={item.project_id}
                className="flex items-center justify-between gap-4 px-3 py-3 text-sm"
              >
                <span className="min-w-0 truncate font-medium text-slate-800">
                  {item.project_name}
                </span>
                <span className="shrink-0 font-bold text-slate-950 tabular-nums">
                  {item.tasks_count} tasks
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="sr-only" aria-live="polite">
        {calendarLoading ? 'Updating statistics' : (calendarError ?? '')}
      </p>
      <span className="sr-only">
        {statusTotal(calendarStats)
          ? `${statusTotal(calendarStats)} tasks represented in status totals`
          : ''}
      </span>
    </div>
  );
}
