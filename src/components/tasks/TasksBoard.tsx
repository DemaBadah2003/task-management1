'use client';

import { useEffect, useMemo, useState } from 'react';
import { TASK_STATUSES } from '@/src/constants/task-statuses';
import { useCreateTaskModal } from '@/src/context/CreateTaskModalContext';
import type { Task, TaskStatus } from '@/src/types/task';
import BoardColumn from './BoardColumn';

interface TasksBoardProps {
  // لاحقاً: مهام الـ GET تُمرَّر هنا
  initialTasks?: Task[];
}

export default function TasksBoard({ initialTasks = [] }: TasksBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { lastCreatedTask } = useCreateTaskModal();

  // عند نجاح الإنشاء: أضف المهمة للوحة بدون Refresh
  useEffect(() => {
    if (!lastCreatedTask) return;
    setTasks((prev) =>
      prev.some((t) => t.id === lastCreatedTask.id)
        ? prev
        : [...prev, lastCreatedTask]
    );
  }, [lastCreatedTask]);

  const tasksByStatus = useMemo(() => {
    const grouped: Partial<Record<TaskStatus, Task[]>> = {};
    for (const task of tasks) {
      (grouped[task.status] ??= []).push(task);
    }
    return grouped;
  }, [tasks]);

  return (
    <div className="flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:snap-none">
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
