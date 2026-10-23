import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { LoginForm } from '@/src/components/forms/login-form';
import { getSafeInternalRedirect } from '@/src/lib/auth/safe-redirect';

export const metadata: Metadata = {
  title: 'Log In · Taskly',
  description: 'Log in to your Taskly account.',
};

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectValue = Array.isArray(params.redirect)
    ? params.redirect[0]
    : params.redirect;
  const redirectTo = getSafeInternalRedirect(redirectValue);

  return (
    <div className="bg-background flex min-h-screen flex-col px-6 py-6 sm:px-8 md:px-12">
      {/* Brand Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center gap-2 py-2">
        <Link href="/" className="flex items-center gap-2 focus:outline-none">
          <Image
            src="/icons/iconstaskly.svg"
            alt="Taskly Logo"
            width={22}
            height={24}
            className="h-6 w-auto"
            priority
          />
          <span className="text-[18px] font-bold tracking-[0.1em] text-slate-900">
            TASKLY
          </span>
        </Link>
      </header>

      {/* Main Content Card */}
      <main className="flex flex-1 items-center justify-center py-6 sm:py-12">
        <div className="w-full max-w-[480px]">
          <LoginForm redirectTo={redirectTo} />
        </div>
      </main>
    </div>
  );
}
