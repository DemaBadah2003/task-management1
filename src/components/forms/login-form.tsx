'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { PasswordInput } from '@/src/components/ui/password-input';
import { loginApi, ApiError } from '@/src/lib/api/auth';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
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
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setApiError(null);
    try {
      await loginApi(
        { email: values.email, password: values.password },
        Boolean(values.rememberMe)
      );
      // Success flow per TM-04: redirect to /project
      router.push('/project');
    } catch (err) {
      setApiError(
        err instanceof ApiError ? err.message : 'Invalid email or password.'
      );
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-between rounded-[8px] border border-[#E8EDFF] bg-white p-6 shadow-[0px_24px_48px_rgba(4,27,60,0.06)] sm:h-[586px] sm:w-[480px] sm:max-w-[480px] sm:p-[48px]">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
        <h1 className="sm:text-headline-lg text-2xl leading-8 font-semibold tracking-tight text-slate-900 sm:leading-[36px]">
          Welcome Back
        </h1>
        <p className="mt-1 max-w-[260px] text-center align-middle font-sans text-[14px] leading-5 font-normal tracking-normal text-slate-500 sm:max-w-none">
          Please enter your details to access your workspace
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
          label="EMAIL"
          type="email"
          placeholder={
            isMobile ? 'curator@workspace.com' : 'yourname@company.com'
          }
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Password field, with the short "Forgot?" link pinned next to the
            PASSWORD label on mobile only — matches the mobile Figma frame */}
        <div className="relative">
          <PasswordInput
            label="PASSWORD"
            placeholder={isMobile ? '••••••••' : 'Enter your password'}
            showToggleIcon={true}
            error={errors.password?.message}
            {...register('password')}
          />
          <Link
            href="#"
            onClick={(e) => e.preventDefault()}
            className="absolute top-0 right-0 inline text-xs leading-4 font-semibold text-[#003D9B] hover:underline sm:hidden"
          >
            Forgot?
          </Link>
        </div>

        {/* Remember Me & Forgot Password row — "Forgot Password?" sits
            opposite "Remember Me" on desktop only; on mobile it's already
            covered by the short "Forgot?" link above */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#C3C6D6] text-[#003D9B] focus:ring-[#003D9B]"
              {...register('rememberMe')}
            />
            <span className="text-body-md leading-5 font-medium text-slate-500">
              Remember Me
            </span>
          </label>

          <Link
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hidden align-middle font-sans text-sm leading-5 font-medium tracking-normal text-[#003D9B] hover:underline sm:inline"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="mt-2">
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="bg-btn-gradient text-center align-middle font-sans text-base leading-6 font-semibold tracking-normal text-white hover:opacity-95"
          >
            Log In
          </Button>
        </div>

        <p className="mt-6 text-center text-sm leading-5 text-[#4F5F7B]">
          Don&apos;t have an account?{' '}
          <Link
            href="/sign-up"
            className="font-sans text-sm leading-5 font-semibold tracking-normal text-[#003D9B] transition-colors hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
