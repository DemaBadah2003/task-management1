'use client';

import { useRouter } from 'next/navigation';

interface TaskDetailsErrorProps {
  status: 'not-found' | 'error' | 'auth-error';
  onRetry: () => void;
}

const MESSAGES = {
  'not-found': 'Task not found',
  'auth-error': 'Your session has expired. Please sign in again.',
  error: 'Failed to load task details',
} as const;

const BUTTON_CLASS =
  'mt-4 rounded-[2px] bg-[#003D9B] px-4 py-2 text-xs font-bold text-white hover:bg-[#002F78]';

export default function TaskDetailsError({
  status,
  onRetry,
}: TaskDetailsErrorProps) {
  const router = useRouter();

  return (
    <div
      role={status === 'not-found' ? 'status' : 'alert'}
      className="flex min-h-64 flex-1 flex-col items-center justify-center px-0 py-8 text-center md:col-span-2 md:min-h-[390px] md:px-5 md:py-10"
    >
      <p className="text-sm font-semibold text-[#041B3C]">{MESSAGES[status]}</p>
      {status === 'error' ? (
        <button type="button" onClick={onRetry} className={BUTTON_CLASS}>
          Retry
        </button>
      ) : status === 'auth-error' ? (
        <button
          type="button"
          onClick={() => router.replace('/login')}
          className={BUTTON_CLASS}
        >
          Sign in
        </button>
      ) : null}
    </div>
  );
}
