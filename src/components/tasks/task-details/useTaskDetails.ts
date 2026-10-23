import { useEffect, useState } from 'react';
import { useAccessToken } from '@/src/hooks/useAccessToken';
import { ApiError } from '@/src/lib/api/members';
import { fetchProjectTaskDetails } from '@/src/lib/tasks-api';
import type { TaskDetailsState } from './types';

export function useTaskDetails(projectId: string, taskId: string) {
  const { token, loading: tokenLoading } = useAccessToken();
  const [attempt, setAttempt] = useState(0);
  const [requestState, setRequestState] = useState<TaskDetailsState | null>(
    null
  );
  const requestKey = `${projectId}:${taskId}:${attempt}`;

  useEffect(() => {
    if (!projectId || !taskId || tokenLoading || !token) return;

    const controller = new AbortController();
    let isActive = true;
    fetchProjectTaskDetails(projectId, taskId, token, controller.signal)
      .then((task) => {
        if (!isActive) return;
        setRequestState(
          task
            ? { key: requestKey, status: 'success', task }
            : { key: requestKey, status: 'not-found' }
        );
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          setRequestState({ key: requestKey, status: 'auth-error' });
          return;
        }
        console.error(
          `Failed to load task details for task ${taskId} in project ${projectId}:`,
          error
        );
        setRequestState({ key: requestKey, status: 'error' });
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [attempt, projectId, requestKey, taskId, token, tokenLoading]);

  const currentState: TaskDetailsState = tokenLoading
    ? { key: requestKey, status: 'loading' }
    : !token
      ? { key: requestKey, status: 'auth-error' }
      : requestState?.key === requestKey
        ? requestState
        : { key: requestKey, status: 'loading' };

  const retry = () => setAttempt((value) => value + 1);

  return { currentState, retry };
}