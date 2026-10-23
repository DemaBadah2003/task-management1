import type { TaskDetails } from '@/src/lib/tasks-api';

const HEADING_CLASS =
  'mb-1.5 text-xs leading-[18px] font-bold tracking-[0.5px] text-[#434654] uppercase';

export default function TaskDetailsContent({ task }: { task: TaskDetails }) {
  return (
    <main className="task-details-content flex min-h-0 min-w-0 flex-1 flex-col gap-2.5 p-0 md:min-h-0 md:[scrollbar-width:none] md:gap-6 md:overflow-y-hidden md:px-8 md:pt-14 md:pb-8 md:[&::-webkit-scrollbar]:hidden">
      <div className="border-b border-[#E5EAF5] pb-3">
        <h3 className={HEADING_CLASS}>Title</h3>
        <h2
          id="task-details-title"
          className="min-h-9 rounded-lg border border-[#D7E2FF] bg-white px-2.5 py-2 text-xs leading-4 font-semibold break-words text-[#041B3C]"
        >
          {task.title}
        </h2>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <h3 className={HEADING_CLASS}>Description</h3>
        <p className="min-h-0 flex-1 rounded-lg border border-[#D7E2FF] bg-white p-3 text-sm leading-[21px] font-normal tracking-normal break-words whitespace-pre-wrap text-[#041B3C]">
          {task.description?.trim() || 'No description provided.'}
        </p>
      </div>
    </main>
  );
}
