"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccessToken } from "@/src/hooks/useAccessToken";
import { fetchProjectEpics } from "@/src/lib/tasks-api";
import type { ProjectEpic } from "@/src/types/task";
interface EpicsResult {
  key: string;
  epics: ProjectEpic[];
  error: string | null;
}

export default function useTaskFormEpics(projectId: string) {
  const { token, loading: tokenLoading } = useAccessToken();
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<EpicsResult | null>(null);
  const requestKey = `${projectId}:${reloadKey}:${token ? "authenticated" : "anonymous"}`;

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (tokenLoading || !token) return;
    const controller = new AbortController();

    fetchProjectEpics(projectId, token, controller.signal)
      .then((epics) => {
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, epics, error: null });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setResult({
            key: requestKey,
            epics: [],
            error: err.message ?? "Failed to load project epics.",
          });
        }
      });

    return () => controller.abort();
  }, [projectId, requestKey, token, tokenLoading]);

  const currentResult = result?.key === requestKey ? result : null;
  const previousProjectResult =
    token && result?.key.startsWith(`${projectId}:`) ? result : null;

  return {
    epics: currentResult?.epics ?? previousProjectResult?.epics ?? [],
    isLoading: tokenLoading || Boolean(token && !currentResult),
    error: tokenLoading
      ? null
      : !token
        ? "Your session has expired. Please log in again."
        : (currentResult?.error ?? null),
    retry,
  };
}