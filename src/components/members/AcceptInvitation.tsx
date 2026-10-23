'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAccessToken } from '@/src/hooks/useAccessToken';
import { acceptProjectInvitation, ApiError } from '@/src/lib/members-api';

export default function AcceptInvitation({
  token: invitationToken,
}: {
  token: string;
}) {
  const router = useRouter();
  const { token: accessToken, loading: tokenLoading } = useAccessToken();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestInFlight = useRef(false);
  const invitationUrl = `/invite?token=${encodeURIComponent(invitationToken)}`;

  useEffect(() => {
    if (tokenLoading || accessToken || !invitationToken) return;
    router.replace(`/login?redirect=${encodeURIComponent(invitationUrl)}`);
  }, [accessToken, invitationToken, invitationUrl, router, tokenLoading]);

  async function handleAccept() {
    if (requestInFlight.current || !accessToken || !invitationToken) return;

    requestInFlight.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const projectId = await acceptProjectInvitation(
        invitationToken,
        accessToken
      );
      toast.success('Invitation accepted successfully.');
      router.replace(
        projectId
          ? `/project/${encodeURIComponent(projectId)}/tasks`
          : '/project'
      );
    } catch (requestError: unknown) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        router.replace(`/login?redirect=${encodeURIComponent(invitationUrl)}`);
        return;
      }
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong while accepting the invitation. Please try again.'
      );
    } finally {
      requestInFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#E7EDFF_0%,#F9F9FF_56%,#F9F9FF_100%)] px-6 py-12">
      <div className="flex w-full max-w-[448px] flex-col items-center">
        <Link href="/" className="mb-8 flex items-center gap-2 text-[#003D9B]">
          <Image
            src="/icons/iconstaskly.svg"
            alt=""
            width={20}
            height={22}
            priority
          />
          <span className="text-sm font-bold tracking-[0.1em] text-[#041B3C]">
            TASKLY
          </span>
        </Link>

        <section className="w-full border-t-2 border-[#003D9B] bg-white px-6 py-7 shadow-[0_12px_32px_#041B3C12] sm:px-8">
          {!invitationToken ? (
            <div className="text-center">
              <p className="mb-5 text-sm leading-5 text-[#434654]">
                This invitation link is invalid. Please contact the project
                admin to request a new invitation.
              </p>
              <Link
                href="/project"
                className="inline-flex h-10 items-center justify-center rounded-[2px] bg-[#003D9B] px-5 text-sm font-semibold text-white hover:bg-[#002F78]"
              >
                Back to Taskly
              </Link>
            </div>
          ) : tokenLoading || !accessToken ? (
            <div
              role="status"
              aria-busy="true"
              className="flex min-h-32 items-center justify-center"
            >
              <span className="size-6 animate-spin rounded-full border-2 border-[#D7E2FF] border-t-[#003D9B]" />
              <span className="sr-only">Checking your session...</span>
            </div>
          ) : (
            <div className="text-center">
              <span className="mb-3 inline-block rounded-full bg-[#E8EEFF] px-2 py-1 text-[9px] leading-3 font-bold tracking-[0.5px] text-[#003D9B] uppercase">
                Project invitation
              </span>
              <h1 className="text-lg leading-6 font-semibold text-[#041B3C]">
                You&apos;ve been invited to join a new project
              </h1>
              {error ? (
                <p
                  role="alert"
                  className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-left text-sm leading-5 text-red-800"
                >
                  {error}
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleAccept}
                disabled={submitting}
                className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[2px] bg-[#003D9B] px-4 text-xs font-semibold text-white hover:bg-[#002F78] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                ) : null}
                {submitting ? 'Accepting…' : 'Accept Invitation'}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
