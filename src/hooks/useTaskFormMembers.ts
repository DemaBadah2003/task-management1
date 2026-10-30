"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccessToken } from "@/src/hooks/useAccessToken";
import { fetchProjectMembers } from "@/src/lib/tasks-api";
import type { ProjectMember } from "@/src/types/task";

interface MembersResult {
  key: string;
  members: ProjectMember[];
  error: string | null;
}

export default function useTaskFormMembers(projectId: string) {
  const { token, loading: tokenLoading } = useAccessToken();
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<MembersResult | null>(null);
  const requestKey = `${projectId}:${reloadKey}:${token ? "authenticated" : "anonymous"}`;

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (tokenLoading || !token) return;
    const controller = new AbortController();

    fetchProjectMembers(projectId, token, controller.signal)
      .then((members) => {
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, members, error: null });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setResult({
            key: requestKey,
            members: [],
            error: err.message ?? "Failed to load project members.",
          });
        }
      });

    return () => controller.abort();
  }, [projectId, requestKey, token, tokenLoading]);

  const currentResult = result?.key === requestKey ? result : null;
  const previousProjectResult =
    token && result?.key.startsWith(`${projectId}:`) ? result : null;

  return {
    members: currentResult?.members ?? previousProjectResult?.members ?? [],
    isLoading: tokenLoading || Boolean(token && !currentResult),
    error: tokenLoading
      ? null
      : !token
        ? "Your session has expired. Please log in again."
        : (currentResult?.error ?? null),
    retry,
  };
}