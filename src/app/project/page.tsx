import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Projects · Taskly',
  description: 'Manage your Taskly projects.',
};

export default function ProjectsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F9F9FF] px-4 py-6 sm:px-8 md:px-12">
      {/* Brand Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 border-b border-[#E8EDFF] pb-4">
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

        <Link
          href="/login"
          className="text-[14px] font-semibold text-[#003D9B] hover:underline"
        >
          Log Out
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center py-12">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-md border border-[#E8EDFF] flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#E6F9F0] flex items-center justify-center text-[#004E32]">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-[24px] font-bold text-[#041B3C]">
            Authenticated & Redirected!
          </h1>
          <p className="text-[14px] text-[#4F5F7B]">
            Welcome to your Tasks Management Projects dashboard.
          </p>
        </div>
      </main>
    </div>
  );
}
