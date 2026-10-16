'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TASK_STATUSES } from '@/src/constants/task-statuses';
import { useAccessToken } from '@/src/hooks/useAccessToken';
import useTaskFormMembers from '@/src/hooks/useTaskFormMembers';
import BoardColumn from './BoardColumn';

export default function TasksBoard({ projectId }: { projectId: string }) {
  const { token, loading } = useAccessToken();
  const { members } = useTaskFormMembers(projectId);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, router, token]);

  return (
    <div
      role="region"
      aria-label="Project tasks board"
      className="flex w-full min-w-0 flex-col gap-4 pb-4 md:flex-row md:gap-4 md:overflow-x-auto md:overflow-y-hidden"
    >
      {TASK_STATUSES.map((status) => (
        <BoardColumn
          key={status.key}
          projectId={projectId}
          accessToken={token}
          tokenLoading={loading}
          status={status}
          members={members}
        />
      ))}
    </div>
  );
}
