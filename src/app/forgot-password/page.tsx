import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { ForgotPasswordForm } from '@/src/components/forms/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot Password · Taskly',
  description: 'Request a password reset link for your Taskly account.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F0F1F5] px-6 py-6 sm:px-8 md:px-12">
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

      <main className="flex flex-1 items-center justify-center py-6 sm:py-12">
        <ForgotPasswordForm />
      </main>
    </div>
  );
}
