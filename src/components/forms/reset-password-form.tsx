'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/src/components/ui/button';
import { PasswordInput } from '@/src/components/ui/password-input';
import { PasswordChecklistReset } from '@/src/components/ui/password-checklist';
import { ApiError, updatePasswordWithRecoveryToken } from '@/src/lib/api/auth';
import {
  clearStoredRecoveryAccessToken,
  parseRecoveryLink,
  readStoredRecoveryAccessToken,
  storeRecoveryAccessToken,
  stripAuthParamsFromUrl,
} from '@/src/lib/auth/recovery-link';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/src/lib/validations/reset-password-schema';

const SUCCESS_MESSAGE =
  'Your password has been updated successfully. You can now log in';
const INVALID_LINK_MESSAGE = 'Invalid or expired reset link.';

export function ResetPasswordForm() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectIn, setRedirectIn] = useState(3);

  useEffect(() => {
    const fromLink = parseRecoveryLink();
    if (fromLink.type === 'recovery' && fromLink.accessToken) {
      storeRecoveryAccessToken(fromLink.accessToken);
      stripAuthParamsFromUrl();
      setAccessToken(fromLink.accessToken);
      setIsReady(true);
      return;
    }

    const stored = readStoredRecoveryAccessToken();
    if (stored && !fromLink.error) {
      setAccessToken(stored);
    } else {
      setAccessToken(null);
    }
    setIsReady(true);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  useEffect(() => {
    if (!isSuccess) return;

    const interval = window.setInterval(() => {
      setRedirectIn((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          router.push('/login');
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isSuccess, router]);

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!accessToken) {
      setApiError(INVALID_LINK_MESSAGE);
      return;
    }

    setApiError(null);
    try {
      await updatePasswordWithRecoveryToken(accessToken, values.password);
      clearStoredRecoveryAccessToken();
      setIsSuccess(true);
      setRedirectIn(3);
    } catch (err) {
      setApiError(
        err instanceof ApiError
          ? err.message
          : 'We could not update your password. Please try again.'
      );
    }
  }

  if (!isReady) {
    return (
      <div className="flex min-h-[280px] w-full max-w-[342px] items-center justify-center rounded-[8px] bg-white p-8 shadow-[0px_24px_48px_-12px_#041B3C0F] sm:max-w-[448px]">
        <p className="text-sm text-slate-500">Checking reset link...</p>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="flex w-full max-w-[342px] flex-col items-center rounded-[8px] bg-white px-6 py-10 text-center shadow-[0px_24px_48px_-12px_#041B3C0F] sm:max-w-[448px] sm:px-8">
        <h1 className="font-sans text-[24px] leading-8 font-semibold text-slate-900 sm:text-[32px] sm:leading-[40px] sm:tracking-[-0.8px]">
          Reset password
        </h1>
        <p role="alert" className="mt-4 text-[14px] leading-[22px] font-medium text-error">
          {INVALID_LINK_MESSAGE}
        </p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex w-full max-w-[342px] flex-col items-center rounded-[8px] bg-white px-6 py-10 text-center shadow-[0px_24px_48px_-12px_#041B3C0F] sm:max-w-[448px] sm:px-8">
        <p
          role="status"
          className="font-sans text-[14px] leading-[22px] font-medium text-[#005235]"
        >
          {SUCCESS_MESSAGE}
        </p>
        <p className="mt-3 text-[12px] leading-[19.5px] text-slate-500">
          Redirecting to log in in {redirectIn}...
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[342px] flex-col rounded-[8px] bg-white px-[24px] pt-[32px] pb-[48px] shadow-[0px_24px_48px_-12px_#041B3C0F] sm:max-w-[512px] sm:px-[32px]">
      <div className="mb-6 flex flex-col items-center text-center sm:mb-8 sm:items-start sm:text-left">
        <h1 className="font-sans text-[24px] font-semibold leading-[30px] tracking-[-0.6px] text-[#041B3C]">
          Create a New Password
        </h1>
        <p className="mt-[21px] font-sans text-[14px] font-normal leading-[20px] text-[#434654]">
          Create a new, strong password to secure your workstation
          <br className="hidden sm:inline" /> access.
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

        <PasswordInput
          label="New Password"
          placeholder="••••••••"
          showToggleIcon
          error={errors.password?.message}
          labelClassName="text-[#4F5F7B] sm:text-[#434654]"
          className="bg-[#F1F3FF] border border-[#C3C6D64D] rounded-[2px] py-[13px] px-[16px] placeholder:text-[#737685] placeholder:text-[16px] placeholder:leading-none text-[16px] text-[#041B3C]"
          {...register('password')}
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="••••••••"
          showToggleIcon={false}
          error={errors.confirmPassword?.message}
          labelClassName="text-[#4F5F7B] sm:text-[#434654]"
          className="bg-[#F1F3FF] border border-[#C3C6D64D] rounded-[2px] py-[13px] px-[16px] placeholder:text-[#737685] placeholder:text-[16px] placeholder:leading-none text-[16px] text-[#041B3C]"
          {...register('confirmPassword')}
        />

        <PasswordChecklistReset password={password ?? ''} />

        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingText="Updating password..."
          disabled={isSubmitting || !accessToken}
          className="bg-btn-gradient-forgot mt-2 rounded-[2px] py-[14px] text-center font-sans text-[16px] font-semibold leading-[24px] text-white shadow-[0px_4px_6px_-4px_#0000001A,0px_10px_15px_-3px_#0000001A] hover:opacity-95"
        >
          Update Password
        </Button>
      </form>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="inline-flex items-center gap-2 font-sans text-[14px] font-medium leading-[20px] text-[#003D9B]"
        >
          <Image
            src="/icons/arrow.svg"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4"
          />
          Back to log in
        </button>
      </div>
    </div>
  );
}
