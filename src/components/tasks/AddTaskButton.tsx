'use client';

import Plus from '@/src/components/icons/Plus';
import PlusCircle from '@/src/components/icons/PlusCircle';
import { useCreateTaskModal } from '@/src/context/CreateTaskModalContext';

interface AddTaskButtonProps {
  variant?: 'column' | 'full';
}

export default function AddTaskButton({
  variant = 'column',
}: AddTaskButtonProps) {
  const { openCreateTask } = useCreateTaskModal();

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={() => openCreateTask()}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-900 text-[11px] font-bold tracking-wider text-white uppercase"
      >
        <Plus className="size-3.5" />
        Add New Task
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openCreateTask()}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white text-[11px] font-semibold tracking-wider text-slate-400 uppercase hover:border-slate-400"
    >
      <PlusCircle className="size-4" />
      Add New Task
    </button>
  );
}
