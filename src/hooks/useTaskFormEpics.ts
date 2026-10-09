"use client";

import { useEffect, useState } from "react";
import { useAccessToken } from "@/src/hooks/useAccessToken";
import { fetchProjectEpics } from "@/src/lib/tasks-api";
import type { ProjectEpic } from "@/src/types/task";

export default function useTaskFormEpics(projectId: string) {
  const { token, loading: tokenLoading } = useAccessToken();
  const [epics, setEpics] = useState<ProjectEpic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tokenLoading) return;
    if (!token) {
      setIsLoading(false);
      setError("Your session has expired. Please log in again.");
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchProjectEpics(projectId, token, controller.signal)
      .then(setEpics)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [projectId, token, tokenLoading]);

  return { epics, isLoading, error };
}