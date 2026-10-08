import { TASK_STATUSES } from '@/src/constants/task-statuses';
import type { Task, TaskStatusKey } from '@/src/types/task';
import BoardColumn from './BoardColumn';

interface TasksBoardProps {
  // جاهز للربط لاحقاً: { todo: [...], in_progress: [...] }
  tasksByStatus?: Partial<Record<TaskStatusKey, Task[]>>;
}

export default function TasksBoard({ tasksByStatus = {} }: TasksBoardProps) {
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:snap-none">
      {TASK_STATUSES.map((status) => (
        <BoardColumn
          key={status.key}
          status={status}
          tasks={tasksByStatus[status.key] ?? []}
        />
      ))}
    </div>
  );
}
