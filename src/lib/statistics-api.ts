import { TASK_STATUSES } from '@/src/constants/task-statuses';
import { ApiError } from '@/src/lib/api/auth';
import type { TaskStatus } from '@/src/types/task';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type StatisticsStatus = TaskStatus | 'ACTIVE';
export type TaskStatusCounts = Partial<Record<StatisticsStatus, number>>;

export interface DailyTaskStats {
  day: string;
  statuses: TaskStatusCounts;
}

export interface CalendarTaskStats {
  daily: DailyTaskStats[];
  totals: TaskStatusCounts;
  total_tasks: number;
  done_tasks: number;
  overdue_tasks: number;
}

export interface ProjectTaskCount {
  project_id: string;
  project_name: string;
  tasks_count: number;
}

export interface CalendarStatsFilters {
  startDate: string;
  endDate: string;
  projectId: string | null;
  status: TaskStatus | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

function normalizeStatusCounts(value: unknown): TaskStatusCounts {
  if (!isRecord(value)) return {};

  const counts: TaskStatusCounts = {};
  for (const { key } of TASK_STATUSES) {
    if (key in value) counts[key] = asCount(value[key]);
  }
  if ('ACTIVE' in value) counts.ACTIVE = asCount(value.ACTIVE);
  return counts;
}

function normalizeCalendarStats(value: unknown): CalendarTaskStats {
  const result = Array.isArray(value) && value.length === 1 ? value[0] : value;
  if (!isRecord(result)) {
    throw new ApiError('The calendar statistics response was invalid.');
  }

  const daily = Array.isArray(result.daily)
    ? result.daily.flatMap((item): DailyTaskStats[] =>
        isRecord(item) && typeof item.day === 'string'
          ? [{ day: item.day, statuses: normalizeStatusCounts(item.statuses) }]
          : [],
      )
    : [];

  return {
    daily,
    totals: normalizeStatusCounts(result.totals),
    total_tasks: asCount(result.total_tasks),
    done_tasks: asCount(result.done_tasks),
    overdue_tasks: asCount(result.overdue_tasks),
  };
}

function normalizeProjectCounts(value: unknown): ProjectTaskCount[] {
  if (!Array.isArray(value)) {
    throw new ApiError('The project statistics response was invalid.');
  }

  return value.flatMap((item): ProjectTaskCount[] =>
    isRecord(item) &&
    (typeof item.project_id === 'string' || typeof item.project_id === 'number') &&
    typeof item.project_name === 'string'
      ? [
          {
            project_id: String(item.project_id),
            project_name: item.project_name,
            tasks_count: asCount(item.tasks_count),
          },
        ]
      : [],
  );
}

async function postRpc(
  functionName: string,
  accessToken: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<unknown> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new ApiError('Supabase configuration is missing.');
  }

  let response: Response;
  try {
    response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('Network request failed. Please try again.');
  }

  if (!response.ok) {
    let message = 'Failed to load task statistics.';
    try {
      const error = await response.json();
      if (isRecord(error) && typeof error.message === 'string') {
        message = error.message;
      }
    } catch {
      // Keep the fallback for empty or non-JSON API errors.
    }
    throw new ApiError(message, response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError('The statistics response was invalid.', response.status);
  }
}

export async function fetchCalendarTaskStats(
  accessToken: string,
  filters: CalendarStatsFilters,
  signal?: AbortSignal,
): Promise<CalendarTaskStats> {
  const result = await postRpc(
    'get_tasks_calendar_stats',
    accessToken,
    {
      p_start_date: filters.startDate,
      p_end_date: filters.endDate,
      p_project_id: filters.projectId,
      p_status: filters.status,
    },
    signal,
  );
  return normalizeCalendarStats(result);
}

export async function fetchTaskCountsPerProject(
  accessToken: string,
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<ProjectTaskCount[]> {
  const result = await postRpc(
    'get_tasks_count_per_project',
    accessToken,
    {
      p_start_date: startDate,
      p_end_date: endDate,
    },
    signal,
  );
  return normalizeProjectCounts(result);
}
