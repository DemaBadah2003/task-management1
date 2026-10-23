'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TASK_STATUSES } from '@/src/constants/task-statuses';
import { useAccessToken } from '@/src/hooks/useAccessToken';
import { useMediaQuery } from '@/src/hooks/useMediaQuery';
import { useCreateTaskModal } from '@/src/context/CreateTaskModalContext';
import { ApiError } from '@/src/lib/api/members';
import { PAGE_SIZE } from '@/src/lib/pagination';
import { fetchProjectTasksPage } from '@/src/lib/tasks-api';
import useTaskFormEpics from '@/src/hooks/useTaskFormEpics';
import useTaskFormMembers from '@/src/hooks/useTaskFormMembers';
import type { ProjectMember, Task } from '@/src/types/task';
import BoardColumn from './BoardColumn';
import TaskDetailsModal from './TaskDetailsModal';
import TasksListView from './TasksListView';

interface SelectedTask {
  projectId: string;
  taskId: string;
  assignee?: { name: string | null; avatarUrl: string | null };
}

interface BoardPageState {
  key: string;
  tasks: Task[];
  totalCount: number | null;
  nextOffset: number;
  lastPageCount: number;
  exhausted: boolean;
  loadingMore: boolean;
  initialError: string | null;
  loadMoreError: string | null;
}

type TaskView = 'board' | 'list';

export default function TasksBoard({
  projectId,
  searchTerm,
}: {
  projectId: string;
  searchTerm: string;
}) {
  const { token, loading: tokenLoading } = useAccessToken();
  const { members } = useTaskFormMembers(projectId);
  const { epics } = useTaskFormEpics(projectId);
  const { lastCreatedTask } = useCreateTaskModal();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [view, setView] = useState<TaskView>('board');
  const [initialAttempt, setInitialAttempt] = useState(0);
  const [boardPage, setBoardPage] = useState<BoardPageState | null>(null);
  const [selectedTask, setSelectedTask] = useState<SelectedTask | null>(null);
  const inFlightRequest = useRef<string | null>(null);
  const mobileSentinelRef = useRef<HTMLDivElement | null>(null);
  const boardKey = `${projectId}:${searchTerm}:${token ? 'authenticated' : 'anonymous'}:${initialAttempt}`;
  const currentPage = boardPage?.key === boardKey ? boardPage : null;
  const showBoard = isMobile || view === 'board';
  const boardLoading = tokenLoading || (!currentPage && Boolean(token));
  const boardError =
    !tokenLoading && !token
      ? 'Your session has expired. Please sign in again.'
      : (currentPage?.initialError ?? null);
  const loadedTasks = currentPage?.tasks ?? [];
  const createdTask =
    !searchTerm && lastCreatedTask?.project_id === projectId
      ? lastCreatedTask
      : null;
  const isCreatedTaskLoaded = createdTask
    ? loadedTasks.some((task) => task.id === createdTask.id)
    : false;
  const boardTasks =
    createdTask && !isCreatedTaskLoaded
      ? [...loadedTasks, createdTask]
      : loadedTasks;
  const totalCount =
    currentPage?.totalCount === null || currentPage?.totalCount === undefined
      ? null
      : currentPage.totalCount + (createdTask && !isCreatedTaskLoaded ? 1 : 0);
  const hasMore = Boolean(
    currentPage &&
    !currentPage.exhausted &&
    (currentPage.totalCount === null
      ? currentPage.lastPageCount >= PAGE_SIZE
      : currentPage.nextOffset < currentPage.totalCount)
  );

  useEffect(() => {
    if (!tokenLoading && !token) router.replace('/login');
  }, [router, token, tokenLoading]);

  useEffect(() => {
    if (!showBoard || tokenLoading || !token) return;
    if (currentPage) return;

    const controller = new AbortController();
    let isActive = true;
    fetchProjectTasksPage(projectId, token, {
      limit: PAGE_SIZE,
      offset: 0,
      title: searchTerm,
      signal: controller.signal,
    })
      .then((result) => {
        if (!isActive) return;
        const tasks = result.tasks.filter(
          (task) => task.project_id === projectId
        );
        setBoardPage({
          key: boardKey,
          tasks,
          totalCount: result.totalCount,
          nextOffset: result.tasks.length,
          lastPageCount: result.tasks.length,
          exhausted:
            result.tasks.length === 0 ||
            (result.totalCount !== null &&
              result.tasks.length >= result.totalCount),
          loadingMore: false,
          initialError: null,
          loadMoreError: null,
        });
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          router.replace('/login');
        }
        setBoardPage({
          key: boardKey,
          tasks: [],
          totalCount: null,
          nextOffset: 0,
          lastPageCount: 0,
          exhausted: true,
          loadingMore: false,
          initialError:
            error instanceof Error
              ? error.message
              : 'Failed to load project tasks',
          loadMoreError: null,
        });
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [
    boardKey,
    currentPage,
    projectId,
    router,
    searchTerm,
    showBoard,
    token,
    tokenLoading,
  ]);

  const loadMore = useCallback(async () => {
    const activePage = boardPage?.key === boardKey ? boardPage : null;
    if (!activePage || !token || activePage.loadingMore || !hasMore) return;

    const offset = activePage.nextOffset;
    const requestKey = `${boardKey}:${offset}`;
    if (inFlightRequest.current === requestKey) return;
    inFlightRequest.current = requestKey;
    setBoardPage((current) =>
      current?.key === boardKey
        ? { ...current, loadingMore: true, loadMoreError: null }
        : current
    );

    try {
      const result = await fetchProjectTasksPage(projectId, token, {
        limit: PAGE_SIZE,
        offset,
        title: searchTerm,
      });
      const freshTasks = result.tasks.filter(
        (task) =>
          task.project_id === projectId &&
          task.id !== createdTask?.id &&
          !activePage.tasks.some((loadedTask) => loadedTask.id === task.id)
      );
      setBoardPage((current) => {
        if (!current || current.key !== boardKey) return current;
        const duplicateFree = freshTasks.filter(
          (task) =>
            !current.tasks.some((loadedTask) => loadedTask.id === task.id)
        );
        return {
          ...current,
          tasks: [...current.tasks, ...duplicateFree],
          totalCount: result.totalCount ?? current.totalCount,
          nextOffset: offset + result.tasks.length,
          lastPageCount: result.tasks.length,
          exhausted:
            result.tasks.length === 0 ||
            duplicateFree.length === 0 ||
            (result.totalCount !== null &&
              offset + result.tasks.length >= result.totalCount),
          loadingMore: false,
          loadMoreError: null,
        };
      });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace('/login');
      }
      setBoardPage((current) =>
        current?.key === boardKey
          ? {
              ...current,
              loadingMore: false,
              loadMoreError:
                error instanceof Error
                  ? error.message
                  : 'Failed to load more tasks',
            }
          : current
      );
    } finally {
      if (inFlightRequest.current === requestKey) {
        inFlightRequest.current = null;
      }
    }
  }, [
    boardKey,
    boardPage,
    createdTask,
    hasMore,
    projectId,
    router,
    searchTerm,
    token,
  ]);

  const openTaskDetails = useCallback(
    (task: Task, member?: ProjectMember) => {
      setSelectedTask({
        projectId,
        taskId: task.id,
        assignee: member
          ? {
              name: member.full_name ?? member.email ?? null,
              avatarUrl: member.avatar_url ?? null,
            }
          : undefined,
      });
    },
    [projectId]
  );
  const closeTaskDetails = useCallback(() => setSelectedTask(null), []);
  const retryBoard = useCallback(() => {
    setInitialAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    if (
      !isMobile ||
      !showBoard ||
      boardLoading ||
      currentPage?.loadingMore ||
      !hasMore ||
      currentPage?.loadMoreError ||
      !mobileSentinelRef.current
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: '240px' }
    );
    observer.observe(mobileSentinelRef.current);
    return () => observer.disconnect();
  }, [
    boardLoading,
    boardTasks.length,
    currentPage?.loadMoreError,
    currentPage?.loadingMore,
    hasMore,
    isMobile,
    loadMore,
    showBoard,
  ]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Task view"
          className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 md:flex"
        >
          {(['board', 'list'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={view === option}
              onClick={() => setView(option)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize ${view === option ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {option === 'board' ? 'Board' : 'List'}
            </button>
          ))}
        </div>
        {totalCount !== null && showBoard ? (
          <p className="text-xs text-slate-500">
            {totalCount} {totalCount === 1 ? 'task' : 'tasks'}
          </p>
        ) : null}
      </div>

      {showBoard ? (
        <>
          {boardError ? (
            <div
              role="alert"
              className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-red-100 bg-white p-5 text-center"
            >
              <p className="text-sm text-red-700">{boardError}</p>
              {token ? (
                <button
                  type="button"
                  onClick={retryBoard}
                  className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-100"
                >
                  Retry
                </button>
              ) : null}
            </div>
          ) : (
            <div
              role="region"
              aria-label="Project tasks board"
              className="flex w-full min-w-0 flex-col gap-4 md:flex-row md:gap-4 md:overflow-x-auto md:overflow-y-hidden"
            >
              {TASK_STATUSES.map((status) => (
                <BoardColumn
                  key={status.key}
                  status={status}
                  tasks={boardTasks.filter(
                    (task) => task.status === status.key
                  )}
                  loading={boardLoading}
                  infiniteEnabled={!isMobile}
                  hasMore={hasMore}
                  loadMoreError={Boolean(currentPage?.loadMoreError)}
                  onLoadMore={loadMore}
                  members={members}
                  onTaskSelect={openTaskDetails}
                />
              ))}
            </div>
          )}
          {isMobile && hasMore && !currentPage?.loadMoreError ? (
            <div
              ref={mobileSentinelRef}
              aria-hidden="true"
              className="h-1 w-full"
            />
          ) : null}
          {boardLoading && loadedTasks.length > 0 ? (
            <p
              role="status"
              className="py-2 text-center text-xs text-slate-500"
            >
              Loading tasks…
            </p>
          ) : null}
          {currentPage?.loadingMore ? (
            <p
              role="status"
              className="py-2 text-center text-xs text-slate-500"
            >
              Loading more tasks…
            </p>
          ) : null}
          {currentPage?.loadMoreError ? (
            <div
              role="alert"
              className="flex items-center justify-center gap-3 py-2"
            >
              <p className="text-xs text-red-700">Failed to load more tasks.</p>
              <button
                type="button"
                onClick={loadMore}
                className="text-xs font-semibold text-blue-900 underline"
              >
                Retry
              </button>
            </div>
          ) : null}
          {!boardLoading && !boardError && boardTasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No tasks found.
            </p>
          ) : null}
        </>
      ) : (
        <TasksListView
          key={`${projectId}:${searchTerm}`}
          projectId={projectId}
          searchTerm={searchTerm}
          accessToken={token}
          tokenLoading={tokenLoading}
          members={members}
          statuses={TASK_STATUSES}
          onTaskSelect={openTaskDetails}
        />
      )}

      {selectedTask?.projectId === projectId ? (
        <TaskDetailsModal
          key={`${selectedTask.projectId}:${selectedTask.taskId}`}
          projectId={selectedTask.projectId}
          taskId={selectedTask.taskId}
          assignee={selectedTask.assignee}
          projectMembers={members.map((member) => ({
            id: member.user_id,
            name: member.full_name ?? member.email ?? null,
            email: member.email ?? null,
            avatarUrl: member.avatar_url ?? null,
          }))}
          projectEpics={epics}
          onClose={closeTaskDetails}
        />
      ) : null}
    </div>
  );
}
