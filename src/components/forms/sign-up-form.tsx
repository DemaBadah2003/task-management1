'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { PasswordInput } from '@/src/components/ui/password-input';
import { PasswordChecklist } from '@/src/components/ui/password-checklist';
import {
  signUpSchema,
  type SignUpFormValues,
} from '@/src/lib/validations/sign-up-schema';
import { signUp, ApiError } from '@/src/lib/api/auth';
export function SignUpForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      jobTitle: '',
    },
  });

  const password = watch('password');

  // تعديل جزئية الـ Submit لتطابق طريقة الإرسال الآمنة والصحيحة
  async function onSubmit(values: SignUpFormValues) {
    setApiError(null);
    try {
      // الدالة signUp في auth.ts تقوم بالفعل بتحويل البيانات وتجهيز الـ data المطلوب
      await signUp(values);

      // Success flow per TM-03: redirect to /login
      router.push('/login');
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while creating your account. Please try again.'
      );
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[576px] flex-col justify-between rounded-[8px] border border-[#E8EDFF] bg-white p-6 shadow-[0px_24px_48px_rgba(4,27,60,0.06)] sm:h-[838.5px] sm:w-[576px] sm:p-[48px]">
      <div className="mb-6 flex flex-col items-start text-left sm:mb-8 sm:items-center sm:text-center">
        <h1 className="sm:text-headline-lg align-middle font-sans text-2xl leading-8 font-semibold tracking-tight text-slate-900 sm:leading-[36px]">
          Create your workspace
        </h1>
        <p className="text-body-md mt-1 hidden leading-5 text-slate-600 sm:block">
          Join the editorial approach to task management.
        </p>
        <p className="text-body-md mt-1 block leading-5 text-slate-600 sm:hidden">
          Join the curated environment for institutional trust and task
          precision.
        </p>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col justify-between gap-4"
      >
        {apiError && (
          <div
            role="alert"
            className="bg-error-bg border-error/30 text-error rounded-lg border p-3.5 text-xs font-medium"
          >
            {apiError}
          </div>
        )}

        <Input
          label="NAME"
          placeholder={isMobile ? 'Mahmoud Taha' : 'Enter your full name'}
          helperText="3-50 characters, letters only."
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="EMAIL"
          type="email"
          placeholder="yourname@company.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="JOB TITLE"
          placeholder="e.g. Project Manager"
          error={errors.jobTitle?.message}
          {...register('jobTitle')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PasswordInput
            label="PASSWORD"
            placeholder={isMobile ? '#Ys12345678' : 'Password'}
            showToggleIcon={true}
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordInput
            label="CONFIRM PASSWORD"
            placeholder="Repeat your password"
            showToggleIcon={false}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <PasswordChecklist password={password ?? ''} />

        <div className="mt-2">
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="bg-btn-gradient text-center align-middle font-sans text-base leading-6 font-semibold tracking-normal text-white hover:opacity-95"
          >
            Create Account
          </Button>
        </div>

        <p className="mt-2 text-center text-[14px] leading-[20px] text-[#4F5F7B]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#003D9B] transition-colors hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
