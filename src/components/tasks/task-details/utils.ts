import { TASK_STATUSES } from '@/src/constants/task-statuses';

export function initials(name: string) {
  const parts = name
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (parts.length > 1) {
    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
  return parts[0]?.slice(0, 2).toUpperCase() || '?';
}

export function displayName(value: string | null | undefined) {
  if (!value?.trim()) return null;
  const name = value.includes('@')
    ? value.slice(0, value.indexOf('@')).replace(/[._-]+/g, ' ')
    : value;
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(' ');
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const dateParts = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|$)/);
  if (dateParts) {
    const [, year, month, day] = dateParts;
    const calendarDate = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day))
    );
    if (
      calendarDate.getUTCFullYear() !== Number(year) ||
      calendarDate.getUTCMonth() !== Number(month) - 1 ||
      calendarDate.getUTCDate() !== Number(day)
    ) {
      return '—';
    }
  }
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
  const normalizedValue =
    !dateOnly && !hasTimezone && /^\d{4}-\d{2}-\d{2}T/.test(value)
      ? `${value}Z`
      : value;
  const date = new Date(dateOnly ? `${value}T00:00:00.000Z` : normalizedValue);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function statusConfig(value: string) {
  const normalized = value.toUpperCase().replace(/-/g, '_');
  const key =
    normalized === 'TODO'
      ? 'TO_DO'
      : normalized === 'READY_FOR_PROD'
        ? 'READY_FOR_PRODUCTION'
        : normalized;
  return TASK_STATUSES.find((item) => item.key === key);
}

export function statusLabel(value: string) {
  const config = statusConfig(value);
  const label = config?.label ?? value.replace(/[_-]+/g, ' ');
  return label
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\bQa\b/g, 'QA');
}