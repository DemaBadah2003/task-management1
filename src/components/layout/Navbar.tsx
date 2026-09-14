'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/src/context/user-context';
import { getInitials } from '@/src/lib/utils';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
}

export function Navbar({ onToggleMobileMenu }: NavbarProps) {
  const { user, loading } = useUser();
  const initials = getInitials(user?.name);

  return (
    <header className="sticky top-0 z-30 flex h-[64px] w-full items-center justify-between border-b border-[#E8EDFF] bg-[#F9F9FF] px-4 py-[12px] sm:px-6">
      {/* Left section: Mobile/Tablet Burger button & Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#041B3C] transition-colors hover:bg-[#E8EDFF]/60 focus:outline-none md:hidden"
        >
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Mobile/Tablet Logo view */}
        <Link
          href="/project"
          className="flex items-center gap-2 focus:outline-none md:hidden"
        >
          <span className="text-[18px] font-bold tracking-[0.1em] text-[#041B3C]">
            TASKLY
          </span>
        </Link>
      </div>

      {/* Right section: Authenticated User Info */}
      <div className="ml-auto flex items-center gap-3">
        {loading ? (
          <div className="flex animate-pulse items-center gap-3">
            <div className="hidden flex-col items-end gap-1 sm:flex">
              <div className="h-4 w-28 rounded bg-[#D7E2FF]/60"></div>
              <div className="h-3 w-20 rounded bg-[#D7E2FF]/40"></div>
            </div>
            <div className="h-9 w-9 rounded-[8px] bg-[#D7E2FF]"></div>
          </div>
        ) : (
          <>
            {/* Full Name & Job Title (Visible on sm+ screens) */}
            <div className="hidden flex-col items-end text-right sm:flex">
              <span className="text-[14px] leading-tight font-bold text-[#041B3C]">
                {user?.name || 'User'}
              </span>
              <span className="mt-0.5 text-[10px] font-bold tracking-[0.05em] text-[#4F5F7B] uppercase sm:text-[11px]">
                {user?.jobTitle || 'MEMBER'}
              </span>
            </div>

            {/* Initials Avatar Badge (Always visible matching Figma) */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#0052CC] text-[14px] font-bold text-white shadow-xs select-none"
              title={user?.name}
            >
              {initials}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
