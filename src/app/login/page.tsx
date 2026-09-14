import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { LoginForm } from '@/src/components/forms/login-form';

export const metadata: Metadata = {
  title: 'Log In · Taskly',
  description: 'Log in to your Taskly account.',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F9F9FF] px-6 py-6 sm:px-8 md:px-12">
      {/* Brand Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center gap-2 py-2">
        <Link href="/" className="flex items-center gap-2 focus:outline-none">
          <Image
            src="/icons/iconstaskly.svg"
            alt="Taskly Logo"
            width={22}
            height={24}
            className="h-6 w-auto"
            priority
          />
          <span className="text-[18px] font-bold tracking-[0.1em] text-[#041B3C]">
            TASKLY
          </span>
        </Link>
      </header>

      {/* Main Content Card */}
      <main className="flex flex-1 items-center justify-center py-6 sm:py-12">
        <div className="w-full max-w-[480px]">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}


