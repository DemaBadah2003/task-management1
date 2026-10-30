'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TASK_STATUSES } from '@/src/constants/task-statuses';
import { useAccessToken } from '@/src/hooks/useAccessToken';
import { getProjectsApi } from '@/src/lib/api/project';
import { ApiError } from '@/src/lib/api/auth';
import CalendarX from '@/src/components/icons/CalendarX';
import {
  fetchCalendarTaskStats,
  fetchTaskCountsPerProject,
  type CalendarTaskStats,
  type ProjectTaskCount,
  type StatisticsStatus,
} from '@/src/lib/statistics-api';
import type { Project } from '@/src/types/project';
import type { TaskStatus } from '@/src/types/task';

interface KeyedResult<T> {
  key: string;
  value: T | null;
  error: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const STATUS_COLORS: Record<StatisticsStatus, string> = {
  TO_DO: '#737685',
  IN_PROGRESS: '#003D9B',
  ACTIVE: '#003D9B',
  BLOCKED: '#BA1A1A',
  IN_REVIEW: '#7c3aed',
  READY_FOR_QA: '#d97706',
  REOPENED: '#e11d48',
  READY_FOR_PRODUCTION: '#0891b2',
  DONE: '#004E32',
};
// Doughnut chart colors, taken exactly from the Figma design
const CHART_COLORS: Record<StatisticsStatus, string> = {
  TO_DO: '#E8EDFF',
  IN_PROGRESS: '#003D9B',
  ACTIVE: '#003D9B',
  BLOCKED: '#BA1A1A',
  IN_REVIEW: '#0052CC',
  READY_FOR_QA: '#4C7DD6',
  REOPENED: '#BA1A1A',
  READY_FOR_PRODUCTION: '#7FA2E8',
  DONE: '#004E32',
};
// Segment order (clockwise from the top) to match the Figma layout:
// light segment, red, green, then the large blue segment
const CHART_ORDER: StatisticsStatus[] = [
  'TO_DO',
  'REOPENED',
  'BLOCKED',
  'IN_REVIEW',
  'READY_FOR_QA',
  'READY_FOR_PRODUCTION',
  'DONE',
  'ACTIVE',
  'IN_PROGRESS',
];
// Ring size and thickness from Figma (180px, 32.4px border)
const CHART_SIZE = 180;
const CHART_THICKNESS = 32.4;
const STATUS_PILL_STYLES: Record<StatisticsStatus, string> = {
  TO_DO: 'bg-[#7376851A] text-[#737685]',
  IN_PROGRESS: 'border-l-4 border-[#003D9B] bg-[#0052CC33] text-[#003D9B]',
  ACTIVE: 'bg-[#0052CC1A] text-[#003D9B]',
  BLOCKED: 'bg-[#FFDAD61A] text-[#BA1A1A]',
  IN_REVIEW: 'bg-[#003D9B1A] text-[#003D9B]',
  READY_FOR_QA: 'bg-[#003D9B1A] text-[#003D9B]',
  REOPENED: 'bg-[#BA1A1A0D] text-[#BA1A1A]',
  READY_FOR_PRODUCTION: 'bg-[#003D9B1A] text-[#003D9B]',
  DONE: 'bg-[#0068441A] text-[#004E32]',
};

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function currentWeekRange() {
  const today = new Date();
  const start = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
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

function formatRangeLabel(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T12:00:00Z`);
  const end = new Date(`${endDate}T12:00:00Z`);
  const startLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(start);
  const endLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(end);
  return `${startLabel} - ${endLabel}`;
}

function statusName(status: StatisticsStatus) {
  if (status === 'ACTIVE') return 'Active';
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
  const [draftRange, setDraftRange] = useState(range);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSelectingEndDate, setIsSelectingEndDate] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(() => {
    const date = new Date(`${range.startDate}T00:00:00Z`);
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  });
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
  const draftRangeLength = rangeLength(
    draftRange.startDate,
    draftRange.endDate
  );
  const draftRangeError =
    draftRangeLength === null
      ? 'Choose a valid start and end date.'
      : draftRangeLength > 7
        ? 'Select no more than 7 calendar days.'
        : null;
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

  const pickerCells = useMemo(() => {
    const year = pickerMonth.getUTCFullYear();
    const month = pickerMonth.getUTCMonth();
    const leadingDays = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const monthLength = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return Array.from({ length: leadingDays + monthLength }, (_, index) => {
      const day = index - leadingDays + 1;
      if (day < 1) return null;
      return dateInputValue(new Date(Date.UTC(year, month, day)));
    });
  }, [pickerMonth]);

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

  const chartEntries: {
    key: StatisticsStatus;
    count: number;
    color: string;
  }[] = TASK_STATUSES.flatMap(({ key }) => {
    const count = calendarStats?.totals[key] ?? 0;
    return count > 0 ? [{ key, count, color: CHART_COLORS[key] }] : [];
  });
  if ((calendarStats?.totals.ACTIVE ?? 0) > 0) {
    chartEntries.push({
      key: 'ACTIVE',
      count: calendarStats?.totals.ACTIVE ?? 0,
      color: CHART_COLORS.ACTIVE,
    });
  }
  chartEntries.sort(
    (a, b) => CHART_ORDER.indexOf(a.key) - CHART_ORDER.indexOf(b.key)
  );
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
  const retryCalendar = () => setRetryStats((value) => value + 1);
  const retryProjectsList = () => setRetryProjects((value) => value + 1);
  const retryCounts = () => setRetryProjectCounts((value) => value + 1);
  const moveRangeByWeek = (offset: number) => {
    const start = new Date(`${range.startDate}T00:00:00Z`);
    start.setUTCDate(start.getUTCDate() + offset * 7);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    const nextRange = {
      startDate: dateInputValue(start),
      endDate: dateInputValue(end),
    };
    setRange(nextRange);
    setDraftRange(nextRange);
  };
  const selectPickerDay = (day: string) => {
    if (!isSelectingEndDate || day < draftRange.startDate) {
      setDraftRange({ startDate: day, endDate: day });
      setIsSelectingEndDate(true);
      return;
    }
    setDraftRange((current) => ({ ...current, endDate: day }));
    setIsSelectingEndDate(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-240 flex-col gap-4 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[30px] leading-9 font-bold tracking-[-0.75px] text-slate-900">
            Weekly Planner
          </h1>
          <p className="text-base leading-6 font-normal tracking-normal text-slate-500">
            Manage your deadlines and track team velocity.
          </p>
        </div>
      </header>

      <section
        aria-label="Statistics filters"
        className="bg-surface-low flex flex-wrap items-center justify-between gap-3 rounded-lg p-4"
      >
        <div className="relative order-1 flex h-9 w-full min-w-0 flex-1 items-center justify-start gap-1 sm:min-w-70">
          <button
            type="button"
            aria-label="Previous week"
            onClick={() => moveRangeByWeek(-1)}
            className="flex size-6 shrink-0 items-center justify-center text-slate-500 hover:text-blue-800"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="size-4"
              fill="none"
            >
              <path
                d="m10 3-5 5 5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-expanded={isDatePickerOpen}
            aria-label={`Selected date range ${formatRangeLabel(range.startDate, range.endDate)}`}
            onClick={() => {
              setDraftRange(range);
              const start = new Date(`${range.startDate}T00:00:00Z`);
              setPickerMonth(
                new Date(
                  Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)
                )
              );
              setIsSelectingEndDate(false);
              setIsDatePickerOpen((open) => !open);
            }}
            className="flex min-w-0 items-center bg-transparent px-0 py-2 text-sm leading-5 font-bold tracking-normal text-slate-900 hover:bg-transparent"
          >
            <span className="whitespace-nowrap">
              {formatRangeLabel(range.startDate, range.endDate)}
            </span>
          </button>
          <button
            type="button"
            aria-label="Next week"
            onClick={() => moveRangeByWeek(1)}
            className="flex size-6 shrink-0 items-center justify-center text-slate-500 hover:text-blue-800"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="size-4"
              fill="none"
            >
              <path
                d="m6 3 5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {isDatePickerOpen ? (
            <div className="absolute top-full left-0 z-30 mt-2 w-[min(340px,calc(100vw-40px))] rounded-md border border-slate-200 bg-white p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() =>
                    setPickerMonth(
                      (month) =>
                        new Date(
                          Date.UTC(
                            month.getUTCFullYear(),
                            month.getUTCMonth() - 1,
                            1
                          )
                        )
                    )
                  }
                  className="flex size-8 items-center justify-center rounded hover:bg-slate-100"
                >
                  <span aria-hidden="true">‹</span>
                </button>
                <h2 className="text-sm font-bold text-slate-900">
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'UTC',
                  }).format(pickerMonth)}
                </h2>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() =>
                    setPickerMonth(
                      (month) =>
                        new Date(
                          Date.UTC(
                            month.getUTCFullYear(),
                            month.getUTCMonth() + 1,
                            1
                          )
                        )
                    )
                  }
                  className="flex size-8 items-center justify-center rounded hover:bg-slate-100"
                >
                  <span aria-hidden="true">›</span>
                </button>
              </div>
              <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-500">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  (day) => (
                    <span key={day} className="py-1">
                      {day}
                    </span>
                  )
                )}
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center">
                {pickerCells.map((day, index) => {
                  const selected =
                    day !== null &&
                    day >= draftRange.startDate &&
                    day <= draftRange.endDate;
                  return day ? (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectPickerDay(day)}
                      className={`mx-auto flex size-8 items-center justify-center rounded-full text-xs ${selected ? 'bg-blue-800 font-bold text-white' : 'text-slate-700 hover:bg-blue-50'}`}
                    >
                      {Number(day.slice(-2))}
                    </button>
                  ) : (
                    <span key={`blank-${index}`} />
                  );
                })}
              </div>
              <p
                className="mt-3 min-h-4 text-xs text-red-700"
                role={draftRangeError ? 'alert' : undefined}
              >
                {draftRangeError ??
                  (isSelectingEndDate
                    ? 'Choose an end date.'
                    : `${formatRangeLabel(draftRange.startDate, draftRange.endDate)}`)}
              </p>
              <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="rounded px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={Boolean(draftRangeError)}
                  onClick={() => {
                    setRange(draftRange);
                    setIsDatePickerOpen(false);
                  }}
                  className="rounded bg-blue-800 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Apply Range
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="order-2 flex w-full flex-wrap gap-3 sm:ml-auto sm:w-auto sm:flex-nowrap">
          <label className="flex h-9 w-full min-w-0 items-center rounded-[2px] bg-white py-2 pr-10 pl-4 text-xs text-slate-500 shadow-[0px_1px_2px_0px_#0000000D] sm:w-51">
            <span className="sr-only">Project filter</span>
            <select
              aria-label="Project filter"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              disabled={projectsLoading || Boolean(projectsError)}
              className="min-w-0 flex-1 appearance-none bg-transparent text-sm leading-5 font-medium text-slate-900 outline-none disabled:opacity-60"
            >
              <option value="">All Projects</option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 10 5"
              width="8.4"
              height="4.2"
              fill="none"
              className="shrink-0"
            >
              <path
                d="m1 1 4 3 4-3"
                stroke="#6B7280"
                strokeWidth="1.57"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </label>
          <label className="flex h-9 w-full min-w-0 items-center rounded-[2px] bg-white py-2 pr-10 pl-4 text-sm leading-5 text-slate-900 shadow-[0px_1px_2px_0px_#0000000D] sm:w-40">
            <span className="sr-only">Status filter</span>
            <select
              aria-label="Status filter"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="min-w-0 flex-1 appearance-none bg-transparent text-sm leading-5 font-medium text-slate-900 outline-none"
            >
              <option value="">All Statuses</option>
              {TASK_STATUSES.map((item) => (
                <option key={item.key} value={item.key}>
                  {statusName(item.key)}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 10 5"
              width="8.4"
              height="4.2"
              fill="none"
              className="shrink-0"
            >
              <path
                d="m1 1 4 3 4-3"
                stroke="#6B7280"
                strokeWidth="1.57"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </label>
        </div>
        {rangeError ? (
          <p
            role="alert"
            className="text-xs font-medium text-red-700 sm:col-span-2 lg:col-span-3"
          >
            {rangeError}
          </p>
        ) : null}
        {projectsError ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <ErrorPanel message={projectsError} onRetry={retryProjectsList} />
          </div>
        ) : null}
      </section>

      {calendarError ? (
        <ErrorPanel message={calendarError} onRetry={retryCalendar} />
      ) : null}
      <section
        aria-label="Task summary"
        className="grid grid-cols-3 gap-3 lg:gap-6"
      >
        {[
          {
            title: 'Total Tasks',
            value: calendarStats?.total_tasks,
            color: 'text-blue-800',
            valueClass: 'text-2xl text-slate-950',
            tint: 'bg-blue-50',
            icon: 'total',
          },
          {
            title: 'Completed Tasks',
            value: calendarStats?.done_tasks,
            color: 'text-emerald-700',
            valueClass: 'text-2xl text-slate-950',
            tint: 'bg-[#0068441A]',
            icon: 'done',
          },
          {
            title: 'Overdue Tasks',
            value: calendarStats?.overdue_tasks,
            color: 'text-red-700',
            valueClass: 'text-[30px] leading-9 text-error',
            tint: 'bg-red-50',
            icon: 'overdue',
          },
        ].map((item) => (
          <article
            key={item.title}
            className="flex h-26 items-center justify-between gap-2 rounded-lg bg-white p-6 shadow-[0px_1px_2px_0px_#0000000D]"
          >
            <div className="min-w-0">
              <h2 className="truncate text-xs leading-4 font-bold tracking-[0.6px] text-[#041B3C99] uppercase">
                {item.title}
              </h2>
              {calendarLoading ? (
                <LoadingValue />
              ) : (
                <p className={`mt-1 leading-none font-bold ${item.valueClass}`}>
                  {item.value ?? '—'}
                </p>
              )}
            </div>
            <span
              aria-hidden="true"
              className={`flex size-12 shrink-0 items-center justify-center rounded-sm ${item.tint} ${item.color}`}
            >
              {item.icon === 'total' ? (
                <svg viewBox="0 0 20 20" className="size-4.5" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="14"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6 7h8M6 10h8M6 13h5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : item.icon === 'done' ? (
                <svg viewBox="0 0 20 20" className="size-4.5" fill="none">
                  <circle
                    cx="10"
                    cy="10"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="m6.5 10 2.2 2.2 4.8-4.8"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" className="size-4.5" fill="none">
                  <path
                    d="M10 3 18 17H2L10 3Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 8v4M10 14.5h.01"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
          </article>
        ))}
      </section>

      <section aria-label="Weekly task calendar" className="min-w-0">
        <div className="-mt-2 mb-1 flex min-h-4 items-center justify-end">
          {calendarLoading ? (
            <span role="status" className="text-[10px] text-slate-500">
              Loading…
            </span>
          ) : null}
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 xl:gap-2 xl:px-4">
          {calendarDays.map((day) => {
            const data = dailyByDay.get(day);
            const statuses = Object.entries(data?.statuses ?? {}) as [
              StatisticsStatus,
              number,
            ][];
            const dayTotal = statuses.reduce(
              (sum, [, count]) => sum + count,
              0
            );
            const isToday = day === dateInputValue(new Date());
            return (
              <article
                key={day}
                className={`relative flex min-h-16.5 items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2.5 xl:h-105 xl:flex-col xl:items-stretch xl:justify-start xl:px-2.5 xl:py-3 ${isToday ? 'border-blue-700 ring-1 ring-blue-700' : 'border-slate-200'}`}
              >
                <div className="flex min-w-20 items-center gap-2 xl:block xl:w-full">
                  <p className="text-xs leading-4 font-bold tracking-normal text-[#041B3C66] uppercase">
                    {formatDay(day).split(',')[0]}
                  </p>
                  <h3
                    className={`font-bold tracking-normal ${dayTotal > 0 ? 'text-lg leading-7 text-slate-900' : 'text-lg leading-7 text-[#041B3C99]'} lg:mt-1`}
                  >
                    {formatDay(day).split(', ')[1]}
                  </h3>
                </div>
                {isToday ? (
                  <span className="bg-primary absolute -top-2.5 left-1/2 z-10 flex h-4.75 w-14 -translate-x-1/2 items-center justify-center rounded-xl px-2 py-0.5 text-[10px] leading-3.75 font-bold tracking-[1px] text-white uppercase">
                    TODAY
                  </span>
                ) : null}
                <div
                  className={`min-w-0 flex-1 xl:mt-3 xl:flex-1 ${dayTotal === 0 && !calendarLoading ? 'flex items-center justify-center' : ''}`}
                >
                  {calendarLoading ? (
                    <div className="h-5 animate-pulse rounded bg-slate-100" />
                  ) : dayTotal === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 xl:flex-1">
                      <CalendarX className="size-8 text-slate-300" />
                      <p className="text-xs leading-4 font-bold tracking-normal text-[#041B3C66] uppercase">
                        NO TASKS
                      </p>
                    </div>
                  ) : (
                    <ul className="flex flex-wrap justify-end gap-1 lg:flex-col lg:justify-start">
                      {statuses.map(([key, count]) => (
                        <li
                          key={key}
                          className={`flex items-center gap-1 rounded-sm px-1.5 py-1 text-[11px] leading-[16.5px] font-bold tracking-normal uppercase lg:justify-between lg:px-1.5 ${STATUS_PILL_STYLES[key]}`}
                        >
                          <span className="flex min-w-0 items-center gap-1">
                            <span
                              aria-hidden="true"
                              className="size-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: STATUS_COLORS[key] }}
                            />
                            <span className="truncate lg:max-w-20">
                              {statusName(key).toUpperCase()}
                            </span>
                          </span>
                          <span className="text-[11px] leading-[16.5px] font-bold">
                            {count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 lg:gap-10">
        <section
          aria-labelledby="status-chart-title"
          className="min-h-[312px] min-w-0 rounded-lg bg-white p-5 shadow-[0px_1px_2px_0px_#0000000D] md:p-8"
        >
          <h2
            id="status-chart-title"
            className="text-lg leading-7 font-bold text-slate-900"
          >
            Tasks by Status
          </h2>
          {calendarLoading ? (
            <div
              role="status"
              className="mt-3 flex h-40 items-center justify-center"
            >
              <div className="size-32 animate-pulse rounded-full bg-slate-100" />
            </div>
          ) : chartTotal === 0 ? (
            <p className="py-8 text-xs text-slate-500">
              No task data for this period.
            </p>
          ) : (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:justify-start sm:gap-10">
              <div
                role="img"
                aria-label={`${chartTotal} tasks by status`}
                className="relative shrink-0 rounded-full"
                style={{
                  background: chartGradient,
                  width: CHART_SIZE,
                  height: CHART_SIZE,
                }}
              >
                <div
                  className="absolute flex flex-col items-center justify-center rounded-full bg-white"
                  style={{ inset: CHART_THICKNESS }}
                >
                  <span className="text-[32px] leading-10 font-bold text-slate-900">
                    {chartTotal}
                  </span>
                  <span className="text-sm leading-5 font-semibold text-slate-500">
                    Total
                  </span>
                </div>
              </div>
              <ul className="flex w-37 min-w-0 flex-col gap-4">
                {chartEntries.map((item) => (
                  <li key={item.key} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-1 size-3 shrink-0 rounded-full ring-1 ring-slate-200"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 text-sm leading-5">
                        <span className="truncate font-semibold text-slate-700">
                          {statusName(item.key)}
                        </span>
                        <span className="font-bold text-slate-900">
                          {item.count}
                        </span>
                      </div>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#E8EDFF]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(item.count / chartTotal) * 100}%`,
                            backgroundColor:
                              item.key === 'TO_DO' ? '#9AA7D1' : item.color,
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section
          aria-labelledby="projects-stats-title"
          className="min-h-[312px] min-w-0 rounded-lg bg-white p-5 shadow-[0px_1px_2px_0px_#0000000D] md:p-8"
        >
          <div className="mb-6 flex items-center justify-between gap-2">
            <h2
              id="projects-stats-title"
              className="text-lg leading-7 font-bold text-slate-900"
            >
              All Projects
            </h2>
          </div>
          {projectCountsError ? (
            <ErrorPanel message={projectCountsError} onRetry={retryCounts} />
          ) : null}
          {projectCountsLoading ? (
            <div role="status" aria-busy="true" className="space-y-1.5">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-9 animate-pulse border-b border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : !projectCountsError && (projectCounts?.length ?? 0) === 0 ? (
            <p className="py-6 text-xs text-slate-500">
              No project tasks found for this date range.
            </p>
          ) : (
            <ul className="space-y-4">
              {projectCounts?.map((item) => (
                <li
                  key={item.project_id}
                  className="flex items-center justify-between gap-4 text-xs leading-4"
                >
                  <span className="min-w-0 truncate font-bold text-[#041B3CB2]">
                    {item.project_name}
                  </span>
                  <span className="shrink-0 font-bold text-slate-900 tabular-nums">
                    {item.tasks_count} Tasks
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
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
