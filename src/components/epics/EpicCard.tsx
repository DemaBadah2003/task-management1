import Image from 'next/image';
import CalendarDays from '@/src/components/icons/CalendarDays';
import UserPen from '@/src/components/icons/UserPen';
import type { Epic } from '@/src/types/epic';

function initials(name: string | undefined) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function EpicCard({
  epic,
  onSelect,
}: {
  epic: Epic;
  onSelect?: (epicId: string) => void;
}) {
  const assignee = epic.assignee?.name;
  const avatarUrl = epic.assignee?.avatar_url;

  return (
    <article
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? () => onSelect(epic.id) : undefined}
      onKeyDown={(event) => {
        if (onSelect && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onSelect(epic.id);
        }
      }}
      aria-label={onSelect ? `View details for ${epic.title}` : undefined}
      className={`flex min-w-0 flex-col justify-between rounded-lg border-l-4 border-[#003D9B] bg-white p-4 text-left shadow-[0px_1px_2px_0px_#0000000D] ${
        onSelect
          ? 'cursor-pointer transition-shadow hover:shadow-[0px_4px_12px_#041B3C1A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003D9B]'
          : ''
      }`}
    >
      <div className="flex flex-col gap-3">
        <span className="w-fit rounded-sm bg-[#D7E2FF] px-2 text-[10px] leading-[15px] font-bold tracking-[0.5px] text-[#003D9B]">
          {epic.epic_id}
        </span>

        <h2 className="break-words text-xl leading-7 font-semibold text-[#041B3C]">
          {epic.title}
        </h2>

        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={32}
              height={32}
              unoptimized
              className="size-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#003D9B] text-xs font-bold text-white"
            >
              {initials(assignee)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs leading-4 font-medium text-[#434654]">
              Assignee
            </span>
            <span className="text-sm leading-5 font-semibold text-[#041B3C]">
              {assignee ?? 'Unassigned'}
            </span>
          </div>
        </div>
      </div>

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[#E5E7EB] pt-3 text-[11px] leading-[16.5px]">
        <span className="flex min-w-0 items-center gap-1.5 text-[#434654]">
          <UserPen size={12} />
          <span className="font-normal">Created by:</span>
          <span className="font-semibold">{epic.created_by?.name ?? '—'}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 font-normal text-[#434654CC]">
          <CalendarDays size={12} />
          {formatDate(epic.deadline)}
        </span>
      </footer>
    </article>
  );
}
