'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/src/lib/api/members';
import { getProjectEpicDetails } from '@/src/lib/api/epics';
import { getSessionToken } from '@/src/lib/api/user';
import type { Epic, EpicUser } from '@/src/types/epic';

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

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

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const currentResult =
    result?.projectId === projectId &&
    result.epicId === epicId &&
    result.attempt === attempt
      ? result
      : null;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#041B3C66] p-0 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Epic details"
        className="max-h-[min(90dvh,900px)] w-full max-w-[720px] overflow-y-auto rounded-t-xl bg-white shadow-[0px_24px_48px_#041B3C33] sm:rounded-md"
      >
        <div className="px-4 pt-3 sm:px-6 sm:pt-4">
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
                <section aria-label="Epic information" className="space-y-3">
                  <h2
                    id="epic-details-title"
                    className="min-h-9 rounded-md border border-[#D7E2FF] px-2.5 py-1.5 text-sm leading-5 font-semibold break-words whitespace-pre-wrap text-[#041B3C]"
                  >
                    {currentResult.epic.title}
                  </h2>
                  <p className="min-h-[88px] whitespace-pre-wrap break-words rounded-md border border-[#D7E2FF] px-2.5 py-2 text-xs leading-5 text-[#434654]">
                    {currentResult.epic.description?.trim() ||
                      'No description provided'}
                  </p>
                </section>

                <section
                  aria-label="Epic details"
                  className="grid gap-x-4 gap-y-3 sm:grid-cols-2"
                >
                  <PersonDetails
                    label="Assignee"
                    user={currentResult.epic.assignee}
                    emptyLabel="Unassigned"
                  />
                  <ReadOnlyField
                    label="Deadline"
                    value={
                      currentResult.epic.deadline
                        ? formatCreatedAt(currentResult.epic.deadline)
                        : '—'
                    }
                  />
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
                      Epic Tasks
                    </h3>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-[10px] leading-4 font-semibold text-[#003D9B]"
                    >
                      <span aria-hidden="true" className="text-sm leading-none">
                        +
                      </span>
                      Add New Task
                    </button>
                  </div>
                  <div className="flex min-h-[112px] flex-col items-center justify-center rounded-md border border-dashed border-[#D7E2FF] bg-[#F1F3FF] px-4 py-4 text-center">
                    <span
                      aria-hidden="true"
                      className="mb-2 flex size-7 items-center justify-center rounded-md bg-[#D7E2FF] text-[#003D9B]"
                    >
                      <svg viewBox="0 0 16 16" className="size-4" fill="none">
                        <path
                          d="M5 4.5h6M5 7.5h6M5 10.5h6M3 2.5h10v11H3z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <p className="text-[10px] leading-4 font-medium text-[#041B3C]">
                      No tasks have been added to this epic yet
                    </p>
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
