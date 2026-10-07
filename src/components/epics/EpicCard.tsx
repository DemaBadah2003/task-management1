import CalendarDaysfrom '@/src/components/icons/CalendarDays';
import type { Epic } from '@/src/types/epic';

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }); // 22 Oct 2025
}

export default function EpicCard({ epic }: { epic: Epic }) {
  const assignee = epic.assignee?.name ?? 'Unassigned';

  return (
    <article className="flex flex-col justify-between rounded-lg border-l-4 border-[#003D9B] bg-white p-4 shadow-[0px_1px_2px_0px_#0000000D]">
      <div className="flex flex-col gap-3">
        <span className="w-fit rounded-sm bg-[#D7E2FF] px-2 text-[10px] leading-[15px] font-bold tracking-[0.5px] text-[#003D9B]">
          {epic.code ?? `EPIC-${epic.id.slice(0, 3).toUpperCase()}`}
        </span>

        <h2 className="text-xl leading-7 font-semibold text-[#041B3C]">
          {epic.title}
        </h2>

        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#003D9B] text-xs font-bold text-white">
            {initials(assignee)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs leading-4 font-medium text-[#434654]">
              Assignee
            </span>
            <span className="text-sm leading-5 font-semibold text-[#041B3C]">
              {assignee}
            </span>
          </div>
        </div>
      </div>

      <footer className="mt-6 flex items-center justify-between border-t border-[#E5E7EB] pt-4 text-[11px] leading-[16.5px]">
        <span className="flex items-center gap-1.5 text-[#434654]">
          <UserPen size={12} />
          <span className="font-normal">Created by:</span>
          <span className="font-semibold">{epic.creator?.name ?? '—'}</span>
        </span>
        <span className="flex items-center gap-1.5 font-normal text-[#434654CC]">
          <CalendarDays size={12} />
          {formatDate(epic.created_at)}
        </span>
      </footer>
    </article>
  );
}
