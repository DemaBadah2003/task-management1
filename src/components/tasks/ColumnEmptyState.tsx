import CalendarX from '@/src/components/icons/CalendarX';

export default function ColumnEmptyState() {
  return (
    <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 md:min-h-[420px]">
      <CalendarX className="size-6 text-slate-300" />
      <span className="text-[10px] font-semibold tracking-widest text-slate-300 uppercase">
        No Tasks
      </span>
    </div>
  );
}
