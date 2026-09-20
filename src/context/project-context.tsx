'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { getProjectsApi } from '@/src/lib/api/project';
import type { Project } from '@/src/types/project';

interface ProjectContextType {
  activeProjectId: string | null;
  activeProjectName: string | null;
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  isProjectLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

/**
 * Helper to extract projectId from pathname if inside a project-related route.
 * Matches routes like /project/[id]/epics, /project/[id]/tasks, /project/[id]/members, /project/[id]/edit
 * Excludes fixed routes: /project, /project/add, /project/statistics, etc.
 */
export function extractProjectId(pathname: string): string | null {
  if (!pathname.startsWith('/project/')) return null;

  const parts = pathname.split('/').filter(Boolean); // ['project', '123', 'epics']
  if (parts.length >= 2) {
    const candidateId = parts[1];
    // Exclude static non-id routes under /project/
    const staticRoutes = ['add', 'epics', 'tasks', 'members', 'details', 'edit'];
    if (!staticRoutes.includes(candidateId)) {
      return candidateId;
    }
  }
  return null;
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(false);

  // Extract current projectId from URL route
  const activeProjectId = useMemo(() => extractProjectId(pathname), [pathname]);

  // Fetch or update project info whenever activeProjectId changes
  useEffect(() => {
    let isMounted = true;

    if (!activeProjectId) {
      // Not inside a project route, reset active project
      setActiveProject(null);
      return;
    }

    // If we already have the active project loaded for this ID, no need to re-fetch
    if (activeProject && String(activeProject.id) === String(activeProjectId)) {
      return;
    }

    setIsProjectLoading(true);

    getProjectsApi()
      .then((projects) => {
        if (!isMounted) return;
        const found = projects.find((p) => String(p.id) === String(activeProjectId));
        if (found) {
          setActiveProject(found);
        } else {
          // Fallback if project is not in current list
          setActiveProject({
            id: activeProjectId,
            name: `Project #${activeProjectId}`,
            description: '',
            createdAt: new Date().toISOString(),
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to fetch project details for context:', err);
        setActiveProject({
          id: activeProjectId,
          name: `Project #${activeProjectId}`,
          description: '',
          createdAt: new Date().toISOString(),
        });
      })
      .finally(() => {
        if (isMounted) setIsProjectLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeProjectId, activeProject]);

  const activeProjectName = activeProject?.name || (activeProjectId ? `Project #${activeProjectId}` : null);

  return (
    <ProjectContext.Provider
      value={{
        activeProjectId,
        activeProjectName,
        activeProject,
        setActiveProject,
        isProjectLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useActiveProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useActiveProject must be used within a ProjectProvider');
  }
  return context;
}
