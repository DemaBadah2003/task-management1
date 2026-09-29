'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectMember } from '@/src/types/member';
import { fetchProjectMembers, ApiError } from '@/src/lib/api/members';
import { getSessionToken } from '@/src/lib/api/user';

export type MembersStatus = 'loading' | 'success' | 'error';

export function useProjectMembers(projectId: string) {
  const router = useRouter();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [status, setStatus] = useState<MembersStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    (async () => {
      try {
        const token = await getSessionToken();
        if (!token) {
          router.replace('/login');
          return;
        }
        const result = await fetchProjectMembers(projectId, token, controller.signal);
        
        // استخراج المصفوفة بشكل آمن سواء عادت مباشرة أو داخل كائن
        const membersData = Array.isArray(result) 
          ? result 
          : (result as any)?.members || (result as any)?.data || [];
          
        setMembers(membersData);
        setStatus('success');
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace('/login');
          return;
        }
        setStatus('error');
      }
    })();

    return () => controller.abort();
  }, [projectId, attempt, router]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { members, status, retry };
}