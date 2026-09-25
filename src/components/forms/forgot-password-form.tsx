'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { recoverPassword, ApiError } from '@/src/lib/api/auth';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/src/lib/validations/forgot-password-schema';

const RESEND_COOLDOWN_MS = 5 * 60 * 1000;
const MAX_RESEND_ATTEMPTS = 3;
const STORAGE_KEY = 'forgot_password_resend_state';

interface PersistedResendState {
  email: string;
  resendAttempts: number;
  cooldownEndsAt: number | null;
  showSuccess: boolean;
}

function readPersistedState(): PersistedResendState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedResendState;
  } catch {
    return null;
  }
}

function writePersistedState(state: PersistedResendState) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearPersistedState() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function ForgotPasswordForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  // نرجّع الحالة المحفوظة أول ما الكومبوننت يفتح (بعد refresh أو remount)
  useEffect(() => {
    const saved = readPersistedState();
    if (!saved) return;

    setSentEmail(saved.email);
    setValue('email', saved.email);
    setShowSuccess(saved.showSuccess);
    setResendAttempts(saved.resendAttempts);

    if (saved.cooldownEndsAt && saved.cooldownEndsAt > Date.now()) {
      setCooldownEndsAt(saved.cooldownEndsAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cooldownEndsAt) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      const left = cooldownEndsAt - Date.now();
      setRemainingMs(Math.max(0, left));
      if (left <= 0) {
        setCooldownEndsAt(null);
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [cooldownEndsAt]);

  const startCooldown = useCallback(() => {
    setCooldownEndsAt(Date.now() + RESEND_COOLDOWN_MS);
  }, []);

  async function sendReset(email: string) {
    await recoverPassword(email);
    setShowSuccess(true);
    setApiError(null);
    setSentEmail(email);
    startCooldown();
  }

  async function onSubmit(values: ForgotPasswordFormValues) {
    setApiError(null);
    try {
      await sendReset(values.email);
      // طلب جديد بالكامل (مش resend) -> نصفّر العداد ونبدأ تتبّع جديد
      setResendAttempts(0);
      writePersistedState({
        email: values.email,
        resendAttempts: 0,
        cooldownEndsAt: Date.now() + RESEND_COOLDOWN_MS,
        showSuccess: true,
      });
    } catch (err) {
      setShowSuccess(false);
      setApiError(
        err instanceof ApiError
          ? err.message
          : 'We could not send the reset link. Please try again.'
      );
    }
  }

  const isCoolingDown = remainingMs > 0;
  const resendDisabled =
    isCoolingDown || resendAttempts >= MAX_RESEND_ATTEMPTS || isResending;
  const remainingAttempts = Math.max(0, MAX_RESEND_ATTEMPTS - resendAttempts);

  async function onResend() {
    // حماية مضاعفة: حتى لو صار خلل بصري بالزر، الفنكشن نفسها بترفض تنفذ
    if (resendDisabled) return;

    const email = sentEmail ?? getValues('email');
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setApiError('Please enter a valid email address.');
      return;
    }

    setIsResending(true);
    setApiError(null);
    try {
      await sendReset(parsed.data.email);
      setResendAttempts((count) => {
        const next = count + 1;
        writePersistedState({
          email: parsed.data.email,
          resendAttempts: next,
          cooldownEndsAt:
            next < MAX_RESEND_ATTEMPTS ? Date.now() + RESEND_COOLDOWN_MS : null,
          showSuccess: true,
        });
        return next;
      });
    } catch (err) {
      setApiError(
        err instanceof ApiError
          ? err.message
          : 'We could not send the reset link. Please try again.'
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex w-full max-w-[342px] flex-col items-center sm:max-w-[448px]">
      <div className="flex w-full flex-col rounded-[8px] bg-white px-6 py-8 shadow-[0px_24px_48px_-12px_#041B3C0F] sm:min-h-[374.75px] sm:px-8 sm:py-10">
        <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
          <h1 className="align-middle font-sans text-[24px] leading-8 font-semibold tracking-normal text-slate-900 sm:text-[32px] sm:leading-[40px] sm:tracking-[-0.8px]">
            Forgot password?
          </h1>
          <p className="mt-1 max-w-[260px] align-middle font-sans text-[14px] leading-5 font-normal text-slate-500 sm:max-w-none sm:leading-[22.75px]">
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {apiError && (
            <div
              role="alert"
              className="border-error/30 bg-error-bg text-error rounded-lg border p-3.5 text-xs font-medium"
            >
              {apiError}
            </div>
          )}

          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            labelClassName="text-[#434654]"
            className="rounded-[2px] py-[14px] sm:rounded-[4px] sm:border sm:border-[#C3C6D64D] sm:py-[13px]"
            {...register('email')}
          />

          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingText="Sending reset link..."
            disabled={isSubmitting || showSuccess}
            className="bg-btn-gradient-forgot rounded-[2px] py-[14px] text-center align-middle font-sans text-[14px] leading-5 font-semibold tracking-normal text-white hover:opacity-95 sm:rounded-[4px] sm:text-[16px] sm:leading-6"
          >
            Send Reset Link
          </Button>
        </form>

        <Link
          href="/login"
          className="text-primary mt-6 inline-flex items-center justify-center gap-2 align-middle font-sans text-[14px] leading-[21px] font-medium"
        >
          <Image
            src="/icons/arrow.svg"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4"
          />
          Back to log in
        </Link>
      </div>

      {showSuccess && (
        <div
          role="status"
          className="mt-[24.5px] flex w-full flex-col gap-3 rounded-[4px] bg-[#82F98E]/30 p-4 sm:mt-[25px]"
        >
          <div className="flex items-start gap-3">
            <Image
              src="/icons/IconCheck.svg"
              alt=""
              width={20}
              height={20}
              className="mt-0.5 h-5 w-5 shrink-0"
            />
            <p className="align-middle font-sans text-[12px] leading-[19.5px] font-medium tracking-normal text-[#005235]">
              If an account exists with this email, we&apos;ve sent
              <br />a password reset link.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="align-middle font-sans text-[11px] leading-[16.5px] font-bold tracking-[1.1px] text-[#00523599] uppercase">
              Didn&apos;t receive email?
            </p>
            <button
              type="button"
              onClick={onResend}
              disabled={resendDisabled}
              aria-label={
                resendAttempts >= MAX_RESEND_ATTEMPTS
                  ? 'Resend. No resend attempts remaining.'
                  : `Resend. ${remainingAttempts} resend ${remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining.`
              }
              className="text-center align-middle font-sans text-[11px] leading-[16.5px] font-bold tracking-[1.1px] text-[#003D9B] uppercase disabled:cursor-not-allowed disabled:opacity-100"
            >
              {resendAttempts >= MAX_RESEND_ATTEMPTS
                ? 'Resend'
                : isCoolingDown
                  ? `Resend in ${formatCountdown(remainingMs)}`
                  : isResending
                    ? 'Sending...'
                    : 'Resend'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
