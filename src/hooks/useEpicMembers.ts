'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchProjectMembers } from '@/src/lib/api/members';
import type { ProjectMember } from '@/src/types/member';

export type MembersStatus = 'loading' | 'success' | 'empty' | 'error';

export function useEpicMembers(projectId: string, token: string | null) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [status, setStatus] = useState<MembersStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    setStatus('loading');

    fetchProjectMembers(projectId, token, controller.signal)
      .then((data) => {
        setMembers(data);
        setStatus(data.length === 0 ? 'empty' : 'success');
      })
      .catch((e) => {
        if (e?.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort();
  }, [projectId, token, attempt]);

  return { members, status, retry };
}