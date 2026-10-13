'use client';

import Image from 'next/image';
import AddTaskIcon from '@/public/addTask.svg';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ApiError, fetchProjectMembers } from '@/src/lib/api/members';
import { getProjectEpicDetails, updateEpicField } from '@/src/lib/api/epics';
import { useCreateTaskModal } from '@/src/context/CreateTaskModalContext';
import { getSessionToken } from '@/src/lib/api/user';
import { fetchEpicTasks } from '@/src/lib/tasks-api';
import type { Epic, EpicUser } from '@/src/types/epic';
import type { ProjectMember } from '@/src/types/member';
import type { Task } from '@/src/types/task';

interface EpicDetailsModalProps {
  projectId: string;
  epicId: string;
  onClose: () => void;
}

interface EpicDetailsResult {
  projectId: string;
  epicId: string;
  attempt: number;
  epic: Epic | null;
  error: string | null;
}

function initials(user?: EpicUser | null) {
  return (
    user?.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '?'
  );
}

function formatCreatedAt(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function toEpicUser(member: ProjectMember | null | undefined): EpicUser | null {
  if (!member) return null;

  return {
    sub: member.id,
    name: member.name,
    email: member.email,
    avatar_url: member.avatarUrl,
  };
}

function getAssigneeId(user?: EpicUser | null): string | null {
  if (!user) return null;
  return user.sub || user.email || user.name || null;
}

function PersonDetails({
  label,
  user,
  emptyLabel,
}: {
  label: string;
  user?: EpicUser | null;
  emptyLabel?: string;
}) {
  const avatarUrl = user?.avatar_url;

  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[9px] leading-3 font-bold tracking-[0.6px] text-[#737685] uppercase">
        {label}
      </p>
      <div className="flex h-9 min-w-0 items-center gap-2 rounded-md border border-[#D7E2FF] bg-white px-2">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            aria-hidden="true"
            width={20}
            height={20}
            unoptimized
            className="size-5 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#D7E2FF] text-[8px] font-bold text-[#003D9B]"
          >
            {initials(user)}
          </span>
        )}
        <span className="min-w-0 truncate text-xs leading-4 font-medium text-[#041B3C]">
          {user?.name || emptyLabel || '—'}
        </span>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[9px] leading-3 font-bold tracking-[0.6px] text-[#737685] uppercase">
        {label}
      </p>
      <div className="flex min-h-9 items-center gap-2 rounded-md border border-[#D7E2FF] bg-white px-2.5 py-1.5 text-xs leading-4 text-[#041B3C]">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="size-3.5 shrink-0 text-[#737685]"
          fill="none"
        >
          <rect
            x="2.25"
            y="3.5"
            width="11.5"
            height="10"
            rx="1.25"
            stroke="currentColor"
          />
          <path
            d="M5 2v3M11 2v3M2.5 6.5h11"
            stroke="currentColor"
            strokeLinecap="round"
          />
        </svg>
        <span className="min-w-0 truncate">{value}</span>
      </div>
    </div>
  );
}

function ModalLoading() {
  return (
    <div aria-busy="true" aria-label="Loading epic details" className="space-y-4">
      <div className="flex justify-between">
        <div className="h-3 w-20 animate-pulse rounded bg-[#E5EBFF]" />
        <div className="h-3 w-20 animate-pulse rounded bg-[#E5EBFF]" />
      </div>
      <div className="h-9 animate-pulse rounded-md bg-[#E5EBFF]" />
      <div className="h-20 animate-pulse rounded-md bg-[#E5EBFF]" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-[52px] animate-pulse rounded-md bg-[#E5EBFF]"
          />
        ))}
      </div>
      <div className="h-28 animate-pulse rounded-lg bg-[#E5EBFF]" />
    </div>
  );
}

export function EpicDetailsModal({
  projectId,
  epicId,
  onClose,
}: EpicDetailsModalProps) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<EpicDetailsResult | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [epicTasks, setEpicTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [titleValue, setTitleValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [deadlineValue, setDeadlineValue] = useState('');
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const { openCreateTask, lastCreatedTask } = useCreateTaskModal();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const initializedEpicKeyRef = useRef<string | null>(null);

  useEffect(() => {
    previousFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    const token = getSessionToken();

    async function loadDetails() {
      if (!token) {
        setResult({
          projectId,
          epicId,
          attempt,
          epic: null,
          error: 'Your session is unavailable. Please sign in again.',
        });
        return;
      }

      try {
        const epic = await getProjectEpicDetails(
          projectId,
          epicId,
          token,
          controller.signal,
        );
        if (!isActive) return;
        setResult({ projectId, epicId, attempt, epic, error: null });
      } catch (error) {
        if (!isActive || controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          setResult({
            projectId,
            epicId,
            attempt,
            epic: null,
            error: 'Your session has expired. Please sign in again.',
          });
          return;
        }
        console.error(
          `Failed to load details for epic ${epicId} in project ${projectId}:`,
          error,
        );
        setResult({
          projectId,
          epicId,
          attempt,
          epic: null,
          error: 'Failed to load epic details. Please try again.',
        });
      }
    }

    void loadDetails();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [attempt, epicId, projectId]);

  const currentResult =
    result?.projectId === projectId &&
    result.epicId === epicId &&
    result.attempt === attempt
      ? result
      : null;
  const currentEpic = currentResult?.epic ?? null;
  const currentEpicKey = currentResult
    ? `${projectId}:${epicId}:${currentResult.attempt}`
    : null;

  useEffect(() => {
    if (
      !currentEpic ||
      !currentEpicKey ||
      initializedEpicKeyRef.current === currentEpicKey
    ) {
      return;
    }

    initializedEpicKeyRef.current = currentEpicKey;
    setTitleValue(currentEpic.title ?? '');
    setDescriptionValue(currentEpic.description ?? '');
    setDeadlineValue(currentEpic.deadline?.slice(0, 10) ?? '');
    setAssigneeOpen(false);
  }, [currentEpic, currentEpicKey]);

  useEffect(() => {
    if (!projectId) return;

    const controller = new AbortController();
    let isActive = true;

    async function loadMembers() {
      const token = getSessionToken();
      if (!token) return;

      setMembersLoading(true);
      setMembersError(null);

      try {
        const members = await fetchProjectMembers(
          projectId,
          token,
          controller.signal,
        );
        if (!isActive) return;
        setProjectMembers(members);
      } catch (error) {
        if (!isActive || controller.signal.aborted) return;
        console.error('Failed to load project members', error);
        setMembersError('Failed to load project members.');
      } finally {
        if (isActive) {
          setMembersLoading(false);
        }
      }
    }

    void loadMembers();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [projectId]);

  useEffect(() => {
    if (!currentEpicKey) return;

    const controller = new AbortController();
    let isActive = true;

    async function loadTasks() {
      setEpicTasks([]);
      setTasksLoading(false);
      setTasksError(null);
      const token = getSessionToken();
      if (!token) {
        setTasksError('Your session is unavailable. Please sign in again.');
        return;
      }

      setTasksLoading(true);
      setTasksError(null);

      try {
        const tasks = await fetchEpicTasks(
          projectId,
          epicId,
          token,
          controller.signal,
        );
        if (isActive) setEpicTasks(tasks);
      } catch (error) {
        if (!isActive || controller.signal.aborted) return;
        console.error(`Failed to load tasks for epic ${epicId}:`, error);
        setTasksError('Failed to load epic tasks.');
      } finally {
        if (isActive) setTasksLoading(false);
      }
    }

    void loadTasks();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [currentEpicKey, epicId, projectId]);

  useEffect(() => {
    if (
      lastCreatedTask?.project_id !== projectId ||
      lastCreatedTask.epic_id !== epicId
    ) {
      return;
    }

    setEpicTasks((previousTasks) =>
      previousTasks.some((task) => task.id === lastCreatedTask.id)
        ? previousTasks
        : [...previousTasks, lastCreatedTask],
    );
  }, [epicId, lastCreatedTask, projectId]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  const handleTitleBlur = useCallback(async () => {
    if (!currentResult?.epic) return;

    const previousValue = currentResult.epic.title ?? '';
    const nextValue = titleValue.trim();

    if (nextValue === previousValue) {
      setTitleValue(previousValue);
      return;
    }

    if (!nextValue) {
      setTitleValue(previousValue);
      toast.error('Epic title is required.');
      return;
    }

    const token = getSessionToken();
    if (!token) {
      setTitleValue(previousValue);
      toast.error('Your session is unavailable. Please sign in again.');
      return;
    }

    try {
      await updateEpicField(projectId, epicId, token, { title: nextValue });
      setTitleValue(nextValue);
      setResult((prev) =>
        prev && prev.epic
          ? { ...prev, epic: { ...prev.epic, title: nextValue } }
          : prev,
      );
      toast.success('Epic title updated');
    } catch (error) {
      setTitleValue(previousValue);
      setResult((prev) =>
        prev && prev.epic
          ? { ...prev, epic: { ...prev.epic, title: previousValue } }
          : prev,
      );
      const message =
        error instanceof ApiError && error.message
          ? error.message
          : 'Failed to update epic title.';
      toast.error(message);
    }
  }, [currentResult, epicId, projectId, titleValue]);

  const handleDescriptionBlur = useCallback(async () => {
    if (!currentResult?.epic) return;

    const previousValue = currentResult.epic.description?.trim()
      ? currentResult.epic.description
      : null;
    const normalizedValue = descriptionValue.trim()
      ? descriptionValue
      : null;

    if (normalizedValue === previousValue) {
      setDescriptionValue(previousValue ?? '');
      return;
    }

    const token = getSessionToken();
    if (!token) {
      setDescriptionValue(previousValue ?? '');
      toast.error('Your session is unavailable. Please sign in again.');
      return;
    }

    try {
      await updateEpicField(projectId, epicId, token, {
        description: normalizedValue,
      });
      setDescriptionValue(normalizedValue ?? '');
      setResult((prev) =>
        prev && prev.epic
          ? { ...prev, epic: { ...prev.epic, description: normalizedValue } }
          : prev,
      );
      toast.success('Epic description updated');
    } catch (error) {
      setDescriptionValue(previousValue ?? '');
      setResult((prev) =>
        prev && prev.epic
          ? { ...prev, epic: { ...prev.epic, description: previousValue } }
          : prev,
      );
      const message =
        error instanceof ApiError && error.message
          ? error.message
          : 'Failed to update epic description.';
      toast.error(message);
    }
  }, [currentResult, descriptionValue, epicId, projectId]);

  const handleDeadlineChange = useCallback(async (nextValue: string) => {
    if (!currentResult?.epic) return;

    const previousValue = currentResult.epic.deadline?.slice(0, 10) ?? null;
    const normalizedValue = nextValue || null;

    if (normalizedValue === previousValue) {
      setDeadlineValue(previousValue ?? '');
      return;
    }

    setDeadlineValue(normalizedValue ?? '');
    const token = getSessionToken();
    if (!token) {
      setDeadlineValue(previousValue ?? '');
      toast.error('Your session is unavailable. Please sign in again.');
      return;
    }

    try {
      await updateEpicField(projectId, epicId, token, {
        deadline: normalizedValue,
      });
      setResult((prev) =>
        prev && prev.epic
          ? { ...prev, epic: { ...prev.epic, deadline: normalizedValue } }
          : prev,
      );
      setDeadlineValue(normalizedValue ?? '');
      toast.success('Epic deadline updated');
    } catch (error) {
      setDeadlineValue(previousValue ?? '');
      setResult((prev) =>
        prev && prev.epic
          ? { ...prev, epic: { ...prev.epic, deadline: previousValue } }
          : prev,
      );
      const message =
        error instanceof ApiError && error.message
          ? error.message
          : 'Failed to update epic deadline.';
      toast.error(message);
    }
  }, [currentResult, epicId, projectId]);

  const handleAssigneeSelect = useCallback(
    async (memberId: string | null) => {
      if (!currentResult?.epic) return;

      const previousAssignee = currentResult.epic.assignee ?? null;
      const previousAssigneeId = getAssigneeId(previousAssignee);

      if (memberId === previousAssigneeId) {
        setAssigneeOpen(false);
        return;
      }

      const token = getSessionToken();
      if (!token) {
        toast.error('Your session is unavailable. Please sign in again.');
        return;
      }

      const nextMember = memberId
        ? projectMembers.find((member) => member.id === memberId) ?? null
        : null;

      setResult((prev) =>
        prev && prev.epic
          ? {
              ...prev,
              epic: {
                ...prev.epic,
                assignee: toEpicUser(nextMember),
              },
            }
          : prev,
      );

      try {
        await updateEpicField(projectId, epicId, token, {
          assignee_id: memberId,
        });
        setResult((prev) =>
          prev && prev.epic
            ? {
                ...prev,
                epic: {
                  ...prev.epic,
                  assignee: toEpicUser(nextMember),
                },
              }
            : prev,
        );
        toast.success('Epic assignee updated');
      } catch (error) {
        setResult((prev) =>
          prev && prev.epic
            ? { ...prev, epic: { ...prev.epic, assignee: previousAssignee } }
            : prev,
        );
        const message =
          error instanceof ApiError && error.message
            ? error.message
            : 'Failed to update epic assignee.';
        toast.error(message);
      } finally {
        setAssigneeOpen(false);
      }
    },
    [currentResult, epicId, projectId, projectMembers],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const assigneeValue = currentEpic?.assignee ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#041B3C66] p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Epic details"
        className="max-h-[min(90dvh,921px)] w-full max-w-[672px] overflow-y-auto rounded-t-xl bg-white shadow-[0px_24px_48px_#041B3C33] sm:rounded-md"
      >
        <div className="px-4 pt-3 sm:px-6 sm:pt-4">
          <div
            aria-hidden="true"
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#E5EAF5] sm:hidden"
          />
          <header className="mb-2 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="size-3.5 shrink-0 text-[#003D9B]"
                fill="none"
              >
                <path
                  d="m8 1.5 5.5 3.25v6.5L8 14.5l-5.5-3.25v-6.5L8 1.5Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="m2.75 4.9 5.25 3.2 5.25-3.2M8 8.1v6"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
              <span className="truncate text-[10px] leading-4 font-bold text-[#003D9B]">
                {currentResult?.epic?.epic_id ?? 'EPIC'}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden items-center gap-1 text-[10px] font-medium text-[#434654] sm:inline-flex">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="size-3"
                  fill="none"
                >
                  <path
                    d="M6.25 9.75 9.75 6.25M5.5 11.5H4a2.5 2.5 0 0 1 0-5h2m4 0h2a2.5 2.5 0 0 1 0 5h-2"
                    stroke="currentColor"
                    strokeLinecap="round"
                  />
                </svg>
                Copy link
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close epic details"
                className="flex size-6 shrink-0 items-center justify-center rounded text-lg leading-none text-[#737685] hover:bg-[#F1F3FF] focus-visible:outline-2 focus-visible:outline-[#003D9B]"
              >
                ×
              </button>
            </div>
          </header>

          <div className="pb-4 sm:pb-5">
            {!currentResult ? (
              <ModalLoading />
            ) : currentResult.error ? (
              <div
                role="alert"
                className="flex min-h-56 flex-col items-center justify-center text-center"
              >
                <p className="text-sm font-semibold text-[#041B3C]">
                  {currentResult.error}
                </p>
                <button
                  type="button"
                  onClick={retry}
                  className="mt-4 rounded-[2px] bg-[#003D9B] px-4 py-2 text-sm font-bold text-white"
                >
                  Retry
                </button>
              </div>
            ) : currentResult.epic ? (
              <div className="space-y-4">
                <section aria-label="Epic information" className="space-y-4">
                  <input
                    value={titleValue}
                    onChange={(event) => setTitleValue(event.target.value)}
                    onBlur={handleTitleBlur}
                    required
                    aria-label="Epic title"
                    className="min-h-9 w-full rounded-md border border-[#D7E2FF] bg-white px-2.5 py-1.5 text-sm leading-5 font-semibold text-[#041B3C] outline-none ring-0 focus:border-[#003D9B]"
                  />
                  <textarea
                    value={descriptionValue}
                    onChange={(event) => setDescriptionValue(event.target.value)}
                    onBlur={handleDescriptionBlur}
                    placeholder="No description provided"
                    aria-label="Epic description"
                    className="min-h-[106px] w-full resize-none whitespace-pre-wrap break-words rounded-md border border-[#D7E2FF] bg-white px-2.5 py-2 text-xs leading-5 text-[#434654] outline-none focus:border-[#003D9B]"
                  />
                </section>

                <section
                  aria-label="Epic details"
                  className="grid gap-x-4 gap-y-3 sm:grid-cols-2"
                >
                  <div className="min-w-0">
                    <p className="mb-1.5 text-[9px] leading-3 font-bold tracking-[0.6px] text-[#737685] uppercase">
                      Assignee
                    </p>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setAssigneeOpen((value) => !value)}
                        className="flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-[#D7E2FF] bg-white px-2 text-left"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {assigneeValue?.avatar_url ? (
                            <Image
                              src={assigneeValue.avatar_url}
                              alt=""
                              aria-hidden="true"
                              width={20}
                              height={20}
                              unoptimized
                              className="size-5 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#D7E2FF] text-[8px] font-bold text-[#003D9B]"
                            >
                              {initials(assigneeValue)}
                            </span>
                          )}
                          <span className="min-w-0 truncate text-xs leading-4 font-medium text-[#041B3C]">
                            {assigneeValue?.name || 'Unassigned'}
                          </span>
                        </span>
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 16 16"
                          className={`size-3.5 shrink-0 text-[#737685] transition-transform ${assigneeOpen ? 'rotate-180' : ''}`}
                          fill="none"
                        >
                          <path
                            d="m4 6 4 4 4-4"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      {assigneeOpen ? (
                        <div className="absolute z-20 mt-1 w-full rounded-md border border-[#D7E2FF] bg-white p-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => void handleAssigneeSelect(null)}
                            className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs font-medium text-[#041B3C] hover:bg-[#F1F3FF]"
                          >
                            <span className="flex size-5 items-center justify-center rounded-full bg-[#D7E2FF] text-[8px] font-bold text-[#003D9B]">
                              ?
                            </span>
                            <span>Unassigned</span>
                          </button>

                          {membersLoading ? (
                            <div className="px-2 py-3 text-xs text-[#737685]">
                              Loading members...
                            </div>
                          ) : membersError ? (
                            <div className="px-2 py-3 text-xs text-[#B42318]">
                              {membersError}
                            </div>
                          ) : (
                            projectMembers.map((member) => (
                              <button
                                key={member.id}
                                type="button"
                                onClick={() => void handleAssigneeSelect(member.id)}
                                className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs font-medium text-[#041B3C] hover:bg-[#F1F3FF]"
                              >
                                {member.avatarUrl ? (
                                  <Image
                                    src={member.avatarUrl}
                                    alt=""
                                    aria-hidden="true"
                                    width={20}
                                    height={20}
                                    unoptimized
                                    className="size-5 shrink-0 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#D7E2FF] text-[8px] font-bold text-[#003D9B]">
                                    {initials({
                                      name: member.name,
                                      sub: member.id,
                                      avatar_url: member.avatarUrl,
                                    })}
                                  </span>
                                )}
                                <span className="min-w-0 truncate">{member.name}</span>
                              </button>
                            ))
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className="mb-1.5 block text-[9px] leading-3 font-bold tracking-[0.6px] text-[#737685] uppercase">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={deadlineValue}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        void handleDeadlineChange(nextValue);
                      }}
                      aria-label="Epic deadline"
                      className="h-9 w-full rounded-md border border-[#D7E2FF] bg-white px-2.5 py-1.5 text-xs text-[#041B3C] outline-none focus:border-[#003D9B]"
                    />
                  </div>

                  <PersonDetails
                    label="Created by"
                    user={currentResult.epic.created_by}
                  />
                  <ReadOnlyField
                    label="Created at"
                    value={formatCreatedAt(currentResult.epic.created_at)}
                  />
                </section>

                <section aria-labelledby="epic-tasks-title">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <h3
                      id="epic-tasks-title"
                      className="text-xs leading-5 font-bold text-[#041B3C]"
                    >
                      Tasks
                    </h3>
                    <button
                      type="button"
                      onClick={() => openCreateTask({ epicId })}
                      className="flex items-center gap-1 text-[10px] leading-4 font-semibold text-[#003D9B]"
                    >
                      <span aria-hidden="true" className="text-sm leading-none">
                        +
                      </span>
                      Add Task
                    </button>
                  </div>
                  {tasksLoading ? (
                    <div
                      role="status"
                      className="flex min-h-24 items-center justify-center text-xs text-[#737685]"
                    >
                      Loading tasks...
                    </div>
                  ) : tasksError ? (
                    <p
                      role="alert"
                      className="py-4 text-center text-xs text-[#B42318]"
                    >
                      {tasksError}
                    </p>
                  ) : epicTasks.length > 0 ? (
                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                      {epicTasks.map((task) => {
                        const member = projectMembers.find(
                          (projectMember) => projectMember.id === task.assignee_id,
                        );

                        return (
                          <article
                            key={task.id}
                            className="rounded-md border border-[#E5EAF5] bg-white px-3 py-2.5"
                          >
                            <h4 className="text-[10px] leading-4 font-semibold text-[#041B3C]">
                              {task.title}
                            </h4>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-1.5">
                                {member?.avatarUrl ? (
                                  <Image
                                    src={member.avatarUrl}
                                    alt=""
                                    aria-hidden="true"
                                    width={16}
                                    height={16}
                                    unoptimized
                                    className="size-4 shrink-0 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#D7E2FF] text-[7px] font-bold text-[#003D9B]">
                                    {member
                                      ? initials({
                                          name: member.name,
                                          sub: member.id,
                                        })
                                      : '?'}
                                  </span>
                                )}
                                <span className="truncate text-[9px] leading-3 text-[#737685]">
                                  {member?.name || 'Unassigned'}
                                </span>
                              </div>
                              {task.due_date ? (
                                <div className="shrink-0 text-right">
                                  <p className="text-[7px] leading-3 font-semibold text-[#737685] uppercase">
                                    Due date
                                  </p>
                                  <p className="text-[8px] leading-3 font-medium text-[#434654]">
                                    {formatCreatedAt(task.due_date)}
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex min-h-[112px] flex-col items-center justify-center rounded-md border border-dashed border-[#D7E2FF] bg-[#F1F3FF] px-4 py-4 text-center">
                      <span
                        aria-hidden="true"
                        className="mb-2 flex size-12 items-center justify-center rounded-xl bg-[#D7E2FF]"
                      >
                        <AddTaskIcon aria-hidden="true" className="h-4 w-[18px]" />
                      </span>
                      <p className="text-[10px] leading-4 font-medium text-[#041B3C]">
                        No tasks have been added to this epic yet
                      </p>
                      <button
                        type="button"
                        onClick={() => openCreateTask({ epicId })}
                        className="mt-2 rounded-[2px] bg-[#003D9B] px-3 py-1.5 text-[9px] leading-3 font-bold text-white"
                      >
                        + Add Task
                      </button>
                    </div>
                  )}
                </section>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
