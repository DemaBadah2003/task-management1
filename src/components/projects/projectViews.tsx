'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProjectsApi } from '@/src/lib/api/project';
import type { Project } from '@/src/types/project';
import { ProjectsList } from '@/src/components/projects/ProjectsList';
import { ProjectsLoadingSkeleton } from '@/src/components/projects/ProjectsLoadingSkeleton';
import { ProjectsErrorState } from '@/src/components/projects/ProjectsErrorState';

// Adjust to your actual login route.
const LOGIN_PATH = '/login';

type ViewState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; projects: Project[] };

export function ProjectsView() {
  const router = useRouter();
  const [state, setState] = useState<ViewState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    getProjectsApi()
      .then((projects) => {
        if (active) setState({ status: 'success', projects });
      })
      .catch((err: unknown) => {
        if (!active) return;

        // 401 -> back to login (the skeleton stays visible while redirecting)
        if ((err as { status?: number } | null)?.status === 401) {
          router.replace(LOGIN_PATH);
          return;
        }

        console.error('Failed to fetch projects:', err);
        setState({ status: 'error' });
      });

    return () => {
      active = false;
    };
  }, [attempt, router]);

  function handleRetry() {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }

  // Never show the empty state or any cards until the request has finished.
  if (state.status === 'loading') return <ProjectsLoadingSkeleton />;
  if (state.status === 'error')
    return <ProjectsErrorState onRetry={handleRetry} />;

  return <ProjectsList projects={state.projects} />;
}
