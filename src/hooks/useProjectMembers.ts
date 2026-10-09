"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccessToken } from "@/src/hooks/useAccessToken";
import { fetchProjectMembersView } from "@/src/lib/members-api";
import type { ProjectMember } from "@/src/types/member";

export type MembersStatus = "loading" | "error" | "success";

export default function useProjectMembers(projectId: string) {
  const { token, loading: tokenLoading } = useAccessToken();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [status, setStatus] = useState<MembersStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (tokenLoading) return;

    if (!token) {
      setError("Your session has expired. Please log in again.");
      setStatus("error");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    fetchProjectMembersView(projectId, token, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setMembers(data);
        setStatus("success");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Something went wrong");
        setStatus("error");
      });

    return () => controller.abort();
  }, [projectId, token, tokenLoading, reloadKey]);

  return { members, status, error, retry };
}