'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/src/context/user-context';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  hasActiveProject?: boolean;
}

export function MobileNavigation({
  isOpen,
  onClose,
  hasActiveProject = true,
}: MobileNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isLoggingOut } = useUser();

  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  const navTextStyle: React.CSSProperties = {
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0px',
    verticalAlign: 'middle',
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };


  const projectSubLinks = [
    {
      name: 'Epics',
      href: '/project/epics',
      icon: (
        <Image
          src="/icons/Epics.svg"
          alt="Epics"
          width={18}
          height={18}
          className="h-4.5 w-4.5 shrink-0"
        />
      ),
    },
    {
      name: 'Tasks',
      href: '/project/tasks',
      icon: (
        <Image
          src="/icons/Tasks.svg"
          alt="Tasks"
          width={18}
          height={18}
          className="h-4.5 w-4.5 shrink-0"
        />
      ),
    },
    {
      name: 'Members',
      href: '/project/members',
      icon: (
        <Image
          src="/icons/Members.svg"
          alt="Members"
          width={18}
          height={18}
          className="h-4.5 w-4.5 shrink-0"
        />
      ),
    },
    {
      name: 'Details',
      href: '/project/details',
      icon: (
        <Image
          src="/icons/Details.svg"
          alt="Details"
          width={18}
          height={18}
          className="h-4.5 w-4.5 shrink-0"
        />
      ),
    },
  ];

  return (
    <>
      {/* 1. Mobile Drawer / Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#041B3C]/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          <div className="relative z-10 flex h-full w-[280px] max-w-[85vw] flex-col justify-between bg-[#F1F3FF] px-5 pt-3 pb-5 shadow-2xl transition-transform duration-300">
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E8EDFF] pb-4">
                <Link
                  href="/project"
                  onClick={onClose}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/icons/iconstaskly.svg"
                    alt="Taskly Logo"
                    width={22}
                    height={24}
                    className="h-6 w-auto"
                  />
                  <span className="text-[18px] font-bold tracking-[0.1em] text-[#041B3C]">
                    TASKLY
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close navigation menu"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#041B3C] transition-colors hover:bg-[#E8EDFF]"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation Links inside Mobile Drawer */}
              <nav className="flex flex-col gap-1.5">
                <Link
                  href="/project"
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    pathname === '/project'
                      ? 'border border-[#E8EDFF] bg-white shadow-2xs'
                      : 'hover:bg-white/60'
                  }`}
                >
                  <Image
                    src="/icons/Project.svg"
                    alt="Projects"
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0"
                  />
                  <span style={navTextStyle} className="text-[#041B3C]">
                    Projects
                  </span>
                </Link>

                <Link
                  href="/statistics"
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    pathname === '/statistics'
                      ? 'border border-[#E8EDFF] bg-white shadow-2xs'
                      : 'hover:bg-white/60'
                  }`}
                >
                  <Image
                    src="/icons/My Statistics.svg"
                    alt="My Statistics"
                    width={18}
                    height={18}
                    className="h-4.5 w-4.5 shrink-0"
                  />
                  <span style={navTextStyle} className="text-[#041B3C]">
                    My Statistics
                  </span>
                </Link>
              </nav>

              {/* Divider between the nav links and the Active Project accordion */}
              {hasActiveProject && (
                <div className="-mt-3 border-t border-[#E8EDFF]" />
              )}

              {/* Active Project Accordion */}
              {hasActiveProject && (
                <div className="flex flex-col overflow-hidden rounded-[12px] border border-[#E8EDFF]">
                  <button
                    type="button"
                    onClick={() => setIsAccordionOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between bg-[#D7E2FF] p-3 text-left transition-colors hover:bg-[#C9DAFF]"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Image
                        src="/icons/folder.svg"
                        alt="Active Project"
                        width={18}
                        height={18}
                        className="h-4.5 w-4.5 shrink-0"
                      />
                      <span className="truncate text-[14px] leading-[20px] font-semibold text-[#041B3C]">
                        Active Project Na...
                      </span>
                    </div>
                    <svg
                      className={`h-4 w-4 text-[#041B3C] transition-transform ${
                        isAccordionOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Sub-links: text stays the SAME weight/color whether selected or
                     not — only the background pill indicates selection */}
                  {isAccordionOpen && (
                    <div className="flex flex-col gap-[4px] bg-white p-[8px]">
                      {projectSubLinks.map((link) => {
                        const isSelected = pathname === link.href;
                        return (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={onClose}
                            className={`flex h-[40px] items-center gap-[12px] rounded-[40px] px-[16px] py-[10px] text-[14px] leading-[20px] font-medium text-[#041B3C] transition-colors ${
                              isSelected
                                ? 'bg-[#F1F3FF]'
                                : 'hover:bg-[#F1F3FF]/60'
                            }`}
                          >
                            {link.icon}
                            <span>{link.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Logout Button in Drawer */}
            <div className="mt-auto border-t border-[#E8EDFF] pt-4">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-semibold text-[#BA1A1A] transition-colors hover:bg-[#FFDAD6]/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <svg
                    className="h-4.5 w-4.5 animate-spin shrink-0 text-[#BA1A1A]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <Image
                    src="/icons/logout.svg"
                    alt="Logout"
                    width={18}
                    height={18}
                    className="h-4.5 w-4.5"
                  />
                )}
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Mobile Bottom Navigation Bar */}
      <nav className="fixed right-0 bottom-0 left-0 z-40 flex h-[64px] w-full items-center justify-around border-t border-[#E8EDFF] bg-[#F1F3FF] px-2 shadow-lg md:hidden">
        {hasActiveProject ? (
          <>
            <Link
              href="/project/epics"
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
                pathname === '/project/epics'
                  ? 'text-[#003D9B]'
                  : 'text-[#4F5F7B]'
              }`}
            >
              <Image
                src="/icons/Epics.svg"
                alt="Epics"
                width={18}
                height={18}
                className="h-4.5 w-4.5"
              />
              <span>Epics</span>
            </Link>

            <Link
              href="/project/tasks"
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
                pathname === '/project/tasks'
                  ? 'text-[#003D9B]'
                  : 'text-[#4F5F7B]'
              }`}
            >
              <Image
                src="/icons/Tasks.svg"
                alt="Tasks"
                width={18}
                height={18}
                className="h-4.5 w-4.5"
              />
              <span>Tasks</span>
            </Link>

            <Link
              href="/project"
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                pathname === '/project' ? 'text-[#003D9B]' : 'text-[#041B3C]'
              }`}
            >
              <Image
                src="/icons/Project.svg"
                alt="Projects"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span>Projects</span>
            </Link>

            <Link
              href="/project/members"
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
                pathname === '/project/members'
                  ? 'text-[#003D9B]'
                  : 'text-[#4F5F7B]'
              }`}
            >
              <Image
                src="/icons/Members.svg"
                alt="Members"
                width={18}
                height={18}
                className="h-4.5 w-4.5"
              />
              <span>Members</span>
            </Link>

            <Link
              href="/project/details"
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
                pathname === '/project/details'
                  ? 'text-[#003D9B]'
                  : 'text-[#4F5F7B]'
              }`}
            >
              <Image
                src="/icons/Details.svg"
                alt="Details"
                width={18}
                height={18}
                className="h-4.5 w-4.5"
              />
              <span>Details</span>
            </Link>
          </>
        ) : (
          <Link
            href="/project"
            className="flex flex-col items-center gap-1 text-[11px] font-bold text-[#003D9B]"
          >
            <Image
              src="/icons/Project.svg"
              alt="Projects"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span>Projects</span>
          </Link>
        )}
      </nav>
    </>
  );
}
