import { toast } from 'sonner';
import type { FocusEvent } from 'react';
import type { TaskDetails } from '@/src/lib/tasks-api';
import type { TaskDetailsUpdateHandler } from './types';

const HEADING_CLASS =
  'mb-1.5 text-xs leading-[18px] font-bold tracking-[0.5px] text-[#434654] uppercase';

export default function TaskDetailsContent({
  task,
  savingTitle,
  savingDescription,
  onUpdate,
}: {
  task: TaskDetails;
  savingTitle: boolean;
  savingDescription: boolean;
  onUpdate: TaskDetailsUpdateHandler;
}) {
  const saveTitle = (event: FocusEvent<HTMLInputElement>) => {
    const rawValue = event.currentTarget.value;
    if (rawValue === task.title) return;

    const nextValue = rawValue.trim();
    if (!nextValue) {
      event.currentTarget.value = task.title;
      toast.error('Task title is required.');
      return;
    }
    if (nextValue === task.title) {
      event.currentTarget.value = task.title;
      return;
    }
    void onUpdate({ title: nextValue });
  };

  const saveDescription = (event: FocusEvent<HTMLTextAreaElement>) => {
    const rawValue = event.currentTarget.value;
    const nextValue = rawValue.trim() ? rawValue : null;
    const currentValue = task.description?.trim() ? task.description : null;
    if (nextValue === currentValue) {
      event.currentTarget.value = currentValue ?? '';
      return;
    }
    void onUpdate({ description: nextValue });
  };

  return (
    <main className="task-details-content flex min-h-0 min-w-0 flex-1 flex-col gap-2.5 p-0 md:min-h-0 md:[scrollbar-width:none] md:gap-6 md:overflow-y-hidden md:px-8 md:pt-14 md:pb-8 md:[&::-webkit-scrollbar]:hidden">
      <div className="border-b border-[#E5EAF5] pb-3">
        <h3 className={HEADING_CLASS}>Title</h3>
        <input
          key={task.title}
          id="task-details-title"
          aria-label="Task title"
          defaultValue={task.title}
          onBlur={saveTitle}
          disabled={savingTitle}
          aria-busy={savingTitle}
          className="min-h-9 w-full rounded-lg border border-[#D7E2FF] bg-white px-2.5 py-2 text-xs leading-4 font-semibold break-words text-[#041B3C] outline-none focus:border-[#003D9B] disabled:opacity-70"
        />
        {savingTitle ? (
          <span role="status" className="mt-1 block text-xs text-[#737685]">
            Saving title...
          </span>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <h3 className={HEADING_CLASS}>Description</h3>
        <textarea
          key={task.description ?? ''}
          aria-label="Task description"
          defaultValue={task.description?.trim() ? task.description : ''}
          onBlur={saveDescription}
          disabled={savingDescription}
          aria-busy={savingDescription}
          placeholder="No description provided"
          className="min-h-0 flex-1 resize-none rounded-lg border border-[#D7E2FF] bg-white p-3 text-sm leading-[21px] font-normal tracking-normal break-words whitespace-pre-wrap text-[#041B3C] outline-none focus:border-[#003D9B] disabled:opacity-70"
        />
        {savingDescription ? (
          <span role="status" className="mt-1 text-xs text-[#737685]">
            Saving description...
          </span>
        ) : null}
      </div>
    </main>
  );
}
