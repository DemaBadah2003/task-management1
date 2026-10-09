'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProjectEpics } from '@/src/lib/api/epics';
import { ApiError } from '@/src/lib/api/members';
import { PAGE_SIZE } from '@/src/lib/pagination';
import { getSessionToken } from '@/src/lib/api/user';
import type { Epic } from '@/src/types/epic';

type PageResult = {
  projectId: string;
  page: number;
  searchTerm: string;
  revision: number;
  status: 'success' | 'error';
  epics: Epic[];
  totalCount: number | null;
};

export function useProjectEpics(
  projectId: string,
  isMobile: boolean,
  searchTerm = '',
) {
  const router = useRouter();
  const normalizedSearch = searchTerm.trim();
  const [navigation, setNavigation] = useState({
    projectId,
    page: 1,
    searchTerm: normalizedSearch,
  });
  const currentPage =
    navigation.projectId === projectId &&
    navigation.searchTerm === normalizedSearch
      ? navigation.page
      : 1;
  const [result, setResult] = useState<PageResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [moreLoading, setMoreLoading] = useState(false);
  const [moreError, setMoreError] = useState(false);
  const [endReached, setEndReached] = useState(false);
  const moreRequestInFlight = useRef(false);
  const moreController = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setMoreLoading(false);
    setMoreError(false);
    setEndReached(false);
    const token = getSessionToken();

    if (!token) {
      router.replace('/login');
      return () => controller.abort();
    }

    // ✱ نسخة ثابتة من نوع string عشان TypeScript يعرف إنها مش null داخل loadPage
    const sessionToken: string = token;

    let isActive = true;

    async function loadPage() {
      try {
        const response = await getProjectEpics(
          projectId,
          sessionToken,
          (currentPage - 1) * PAGE_SIZE,
          PAGE_SIZE,
          controller.signal,
          normalizedSearch,
        );
        if (!isActive) return;
        setResult({
          projectId,
          page: currentPage,
          searchTerm: normalizedSearch,
          revision: retryCount,
          status: 'success',
          epics: response.epics,
          totalCount: response.totalCount,
        });
      } catch (error) {
        if (!isActive || controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          router.replace('/login');
          return;
        }
        console.error(
          `Failed to load epics page ${currentPage} for project ${projectId}:`,
          error,
        );
        setResult({
          projectId,
          page: currentPage,
          searchTerm: normalizedSearch,
          revision: retryCount,
          status: 'error',
          epics: [],
          totalCount: null,
        });
      }
    }

    const startTimeout = window.setTimeout(() => {
      void loadPage();
    }, 0);
    return () => {
      isActive = false;
      window.clearTimeout(startTimeout);
      controller.abort();
      moreController.current?.abort();
      moreController.current = null;
      moreRequestInFlight.current = false;
    };
  }, [currentPage, normalizedSearch, projectId, retryCount, router]);

  const pageResult =
    result?.projectId === projectId &&
    result.page === currentPage &&
    result.searchTerm === normalizedSearch &&
    result.revision === retryCount
      ? result
      : null;

  const setPage = useCallback(
    (page: number) => {
      if (page < 1) return;
      setNavigation({ projectId, page, searchTerm: normalizedSearch });
      setMoreError(false);
    },
    [normalizedSearch, projectId],
  );

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1);
    setMoreError(false);
  }, []);

  const loadMore = useCallback(async () => {
    const currentResult =
      result?.projectId === projectId &&
      result.page === currentPage &&
      result.searchTerm === normalizedSearch &&
      result.revision === retryCount
        ? result
        : null;
    if (
      !isMobile ||
      !currentResult ||
      currentResult.status !== 'success' ||
      moreRequestInFlight.current
    ) {
      return;
    }

    const hasMore =
      currentResult.totalCount === null
        ? currentResult.epics.length >= PAGE_SIZE
        : currentResult.epics.length < currentResult.totalCount;
    if (!hasMore) return;

    const token = getSessionToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    const controller = new AbortController();
    moreController.current = controller;
    moreRequestInFlight.current = true;
    setMoreLoading(true);
    setMoreError(false);

    try {
      const response = await getProjectEpics(
        projectId,
        token,
        currentResult.epics.length,
        PAGE_SIZE,
        controller.signal,
        normalizedSearch,
      );
      setResult((previous) => {
        if (
          !previous ||
          previous.projectId !== projectId ||
          previous.page !== currentPage ||
          previous.searchTerm !== normalizedSearch ||
          previous.status !== 'success'
        ) {
          return previous;
        }

        const loadedIds = new Set(previous.epics.map((epic) => epic.id));
        const newEpics = response.epics.filter(
          (epic) => !loadedIds.has(epic.id),
        );

        return {
          ...previous,
          epics: [...previous.epics, ...newEpics],
          totalCount: response.totalCount ?? previous.totalCount,
        };
      });
      if (response.epics.length === 0) setEndReached(true);
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && error.status === 401) {
        router.replace('/login');
        return;
      }
      console.error(`Failed to load more epics for project ${projectId}:`, error);
      setMoreError(true);
    } finally {
      if (moreController.current === controller) {
        moreController.current = null;
        moreRequestInFlight.current = false;
        setMoreLoading(false);
      }
    }
  }, [
    currentPage,
    isMobile,
    normalizedSearch,
    projectId,
    result,
    retryCount,
    router,
  ]);

  const epics = pageResult?.epics ?? [];
  const totalCount = pageResult?.totalCount ?? null;
  const hasMore =
    !endReached &&
    (totalCount === null
      ? epics.length >= PAGE_SIZE
      : epics.length < totalCount);
  const totalPages =
    totalCount === null
      ? currentPage + (epics.length >= PAGE_SIZE ? 1 : 0)
      : Math.ceil(totalCount / PAGE_SIZE);
  const offset = (currentPage - 1) * PAGE_SIZE;

  return {
    epics,
    searchTerm: normalizedSearch,
    currentPage,
    offset,
    totalCount,
    totalPages,
    hasMore,
    loading: !pageResult,
    error: pageResult?.status === 'error',
    moreLoading,
    moreError,
    setPage,
    retry,
    loadMore,
  } as const;
}