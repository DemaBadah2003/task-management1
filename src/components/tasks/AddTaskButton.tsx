import Plus from '@/src/components/icons/Plus';
import PlusCircle from '@/src/components/icons/PlusCircle';

interface AddTaskButtonProps {
  variant?: 'column' | 'full';
}

// UI only: لا يوجد onClick عمداً (سيتم تنفيذ الوظيفة في مهمة منفصلة)
export default function AddTaskButton({
  variant = 'column',
}: AddTaskButtonProps) {
  if (variant === 'full') {
    return (
      <button
        type="button"
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
      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white text-[11px] font-semibold tracking-wider text-slate-400 uppercase"
    >
      <PlusCircle className="size-4" />
      Add New Task
    </button>
  );
}
