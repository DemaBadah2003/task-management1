'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAccessToken } from '@/src/hooks/useAccessToken';
import { ApiError } from '@/src/lib/api/members';
import { inviteProjectMember } from '@/src/lib/members-api';

interface InviteMemberDialogProps {
  projectId: string;
  projectName?: string;
  onClose: () => void;
}

const PROJECT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteMemberDialog({
  projectId,
  projectName,
  onClose,
}: InviteMemberDialogProps) {
  const { token, loading: tokenLoading } = useAccessToken();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    emailInputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !submittingRef.current) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setEmailError('Email is required.');
      return;
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    if (!PROJECT_ID_PATTERN.test(projectId)) {
      setSubmitError('This project ID is invalid.');
      return;
    }
    if (tokenLoading) return;
    if (!token) {
      setSubmitError('Your session has expired. Please sign in again.');
      router.replace('/login');
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setEmailError(null);
    setSubmitError(null);
    setSuccess(false);

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      await inviteProjectMember(normalizedEmail, projectId, token, appUrl);
      setEmail('');
      setSuccess(true);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        setSubmitError('Your session has expired. Please sign in again.');
        router.replace('/login');
      } else {
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.'
        );
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#041B3C66] p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-member-title"
        className="w-full rounded-t-[32px] bg-white px-6 pt-8 pb-8 shadow-[0_24px_48px_#041B3C33] sm:max-w-[480px] sm:rounded-xl sm:p-8"
      >
        <div className="relative mb-6">
          <span className="mb-2 flex size-12 items-center justify-center rounded-lg bg-[#F1F3FF] text-[#003D9B]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
            >
              <circle cx="9" cy="7" r="3.5" fill="currentColor" />
              <path
                d="M2.5 20v-1.5a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5V20h-13Z"
                fill="currentColor"
              />
              <path
                d="M19 8v6m3-3h-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div className="pr-10">
            <h2
              id="invite-member-title"
              className="text-base leading-5 font-bold text-[#041B3C]"
            >
              Invite Team Member
            </h2>
            <p className="mt-1 text-xs leading-[18px] text-[#4F5F7B]">
              Send an invitation to join the{' '}
              {projectName || 'Architectural Studio'}
              <br />
              workspace.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close invite dialog"
            disabled={submitting}
            onClick={onClose}
            className="absolute top-0 right-0 flex size-8 shrink-0 items-center justify-center rounded-md text-lg leading-none text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          {success ? (
            <p
              role="status"
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800"
            >
              Invitation sent successfully.
            </p>
          ) : null}
          {submitError ? (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
            >
              {submitError}
            </p>
          ) : null}

          <div>
            <label
              htmlFor="invite-member-email"
              className="mb-2 block text-[9px] leading-3 font-bold tracking-[0.6px] text-[#434654] uppercase"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                ref={emailInputRef}
                id="invite-member-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                disabled={submitting}
                aria-invalid={Boolean(emailError)}
                aria-describedby={
                  emailError ? 'invite-member-email-error' : undefined
                }
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError(null);
                  setSuccess(false);
                }}
                placeholder="Enter email address"
                className="h-12 w-full rounded-[4px] border border-transparent bg-[#D7E2FF] px-4 py-3.5 pr-12 text-xs text-[#041B3C] outline-none placeholder:text-[#737685] focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 disabled:bg-slate-50"
              />
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-[#434654]"
                fill="none"
              >
                <rect
                  x="2.5"
                  y="4"
                  width="15"
                  height="12"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="m3.5 5 6.5 5 6.5-5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {emailError ? (
              <p
                id="invite-member-email-error"
                className="mt-1.5 text-xs text-red-700"
              >
                {emailError}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-0">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="h-12 min-w-[120px] rounded-md px-6 text-sm font-semibold text-[#434654] hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || tokenLoading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-[#003D9B] px-4 text-sm font-semibold text-white shadow-[0_4px_8px_#003D9B33] hover:bg-[#002F78] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[186px]"
            >
              {submitting ? (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              ) : null}
              {submitting ? 'Sending…' : 'Send invitation'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
