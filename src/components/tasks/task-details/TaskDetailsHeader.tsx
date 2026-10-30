import type { RefObject } from 'react';
import type { TaskDetails } from '@/src/lib/tasks-api';
import { TASK_STATUSES } from '@/src/constants/task-statuses';
import MetadataField from './MetadataField';
import { statusLabel } from './utils';
import type { TaskDetailsUpdateHandler } from './types';

interface TaskDetailsHeaderProps {
  task: TaskDetails | null;
  savingStatus: boolean;
  onUpdate: TaskDetailsUpdateHandler;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}

export default function TaskDetailsHeader({
  task,
  savingStatus,
  onUpdate,
  closeButtonRef,
  onClose,
}: TaskDetailsHeaderProps) {
  return (
    <header className="relative z-20 h-12 shrink-0 md:absolute md:inset-x-0 md:top-0 md:h-0">
      <div className="flex h-12 items-center justify-between gap-3 px-0 md:absolute md:top-4 md:left-8 md:h-auto md:justify-start">
        <span className="rounded-sm bg-[#E8EEFF] px-2 py-1 text-[10px] leading-3 font-bold text-[#003D9B]">
          TASK
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close task details"
          className="flex size-8 shrink-0 items-center justify-center rounded text-xl leading-none text-[#737685] hover:bg-[#F1F3FF] focus-visible:outline-2 focus-visible:outline-[#003D9B] md:hidden"
        >
          ×
        </button>
      </div>
      {task ? (
        <div className="absolute top-8 right-8 hidden w-[276px] md:block">
          <MetadataField label="Status">
            <select
              aria-label="Task status"
              value={task.status}
              disabled={savingStatus}
              aria-busy={savingStatus}
              onChange={(event) => {
                const status = TASK_STATUSES.find(
                  (item) => item.key === event.target.value
                );
                if (status) void onUpdate({ status: status.key });
              }}
              className="min-w-0 flex-1 bg-transparent text-xs font-medium text-[#041B3C] outline-none disabled:opacity-60"
            >
              {TASK_STATUSES.map((status) => (
                <option key={status.key} value={status.key}>
                  {statusLabel(status.key)}
                </option>
              ))}
            </select>
            {savingStatus ? (
              <span role="status" className="text-[10px] text-[#737685]">
                Saving...
              </span>
            ) : null}
          </MetadataField>
        </div>
      ) : null}
    </header>
  );
}
