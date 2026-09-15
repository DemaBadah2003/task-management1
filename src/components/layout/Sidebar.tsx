'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/src/lib/utils';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Accordion state - Opened by default per specification
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  // Floating popup state for collapsed mode
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close floating popup on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsPopupOpen(false);
      }
    }

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  const handleLogout = () => {
    document.cookie =
      'taskly_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('taskly_session');
    sessionStorage.removeItem('taskly_session');
    router.push('/login');
  };

  const projectLinks = [
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

  // Shared typography style matching Figma spec exactly for both "Projects" and "My Statistics"
  const navTextStyle: React.CSSProperties = {
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0px',
    verticalAlign: 'middle',
  };

  return (
    /* Sidebar Shell with exact Figma color background: #F1F3FF */
    <aside
      className={cn(
        'relative flex h-full min-h-screen flex-col justify-between border-r border-black/10 bg-[#F1F3FF] transition-all duration-300 select-none',
        isCollapsed ? 'w-[72px] px-2 py-4' : 'w-[256px] p-4',
        className
      )}
    >
      {/* Top Section: Brand Logo & Navigation */}
      <div className="flex flex-col gap-6">
        {/* Brand Logo Header */}
        <div
          className={cn(
            'flex h-[40px] items-center px-2',
            isCollapsed ? 'justify-center' : 'justify-start gap-2.5'
          )}
        >
          <Image
            src="/icons/iconstaskly.svg"
            alt="Taskly Logo"
            width={24}
            height={26}
            className="h-6 w-auto shrink-0"
            priority
          />
          {!isCollapsed && (
            <span className="text-[18px] font-bold tracking-[0.1em] text-[#041B3C]">
              TASKLY
            </span>
          )}
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {/* Projects Link */}
          <Link
            href="/project"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
              pathname === '/project'
                ? 'border border-[#E8EDFF] bg-white shadow-2xs'
                : 'hover:bg-white/60',
              isCollapsed && 'justify-center px-0'
            )}
            title={isCollapsed ? 'Projects' : undefined}
          >
            <Image
              src="/icons/Project.svg"
              alt="Projects"
              width={20}
              height={20}
              className="h-5 w-5 shrink-0"
            />
            {!isCollapsed && (
              <span style={navTextStyle} className="text-[#041B3C]">
                Projects
              </span>
            )}
          </Link>

          {/* My Statistics Link */}
          <Link
            href="/statistics"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
              pathname === '/statistics'
                ? 'border border-[#E8EDFF] bg-white shadow-2xs'
                : 'hover:bg-white/60',
              isCollapsed && 'justify-center px-0'
            )}
            title={isCollapsed ? 'My Statistics' : undefined}
          >
            <Image
              src="/icons/My Statistics.svg"
              alt="My Statistics"
              width={18}
              height={18}
              className="h-4.5 w-4.5 shrink-0"
            />
            {!isCollapsed && (
              <span style={navTextStyle} className="text-[#041B3C]">
                My Statistics
              </span>
            )}
          </Link>
        </nav>

        {/* Divider + Active Project grouped tightly so the line sits directly above the folder icon */}
        <div className="flex flex-col gap-3">
          <div
            className={cn(
              'border-t border-[#E8EDFF]',
              isCollapsed && 'mx-auto w-8'
            )}
          />

          {/* Section 3: Current Active Project Accordion & Collapsed Floating Popup */}
          {!isCollapsed ? (
            /* EXPANDED MODE: Accordion */
            <div className="flex flex-col overflow-hidden rounded-[12px] border border-[#E8EDFF]">
              {/* Accordion Header (exact Figma background: #D7E2FF) */}
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
                  className={cn(
                    'h-4 w-4 shrink-0 text-[#041B3C] transition-transform duration-200',
                    isAccordionOpen ? 'rotate-180' : 'rotate-0'
                  )}
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

              {/* Sub-links container: text stays the SAME weight (font-medium) whether
                 selected or not — only the background pill (#F1F3FF) indicates selection */}
              {isAccordionOpen && (
                <div className="flex flex-col gap-[4px] bg-white p-[8px]">
                  {projectLinks.map((link) => {
                    const isSelected = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={cn(
                          'flex h-[40px] items-center gap-[12px] rounded-[40px] px-[16px] py-[10px] text-[14px] leading-[20px] font-medium text-[#041B3C] transition-colors',
                          isSelected ? 'bg-[#F1F3FF]' : 'hover:bg-[#F1F3FF]/60'
                        )}
                      >
                        {link.icon}
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* COLLAPSED MODE: Project Icon with Floating Popup Menu */
            <div className="relative flex justify-center" ref={popupRef}>
              <button
                type="button"
                onClick={() => setIsPopupOpen((prev) => !prev)}
                aria-label="Active project links popup"
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl border border-[#E8EDFF] bg-[#D7E2FF] text-[#041B3C] transition-all hover:bg-[#C9DAFF]',
                  isPopupOpen && 'bg-[#C9DAFF] ring-2 ring-[#0052CC]/50'
                )}
                title="Active Project Links"
              >
                <Image
                  src="/icons/folder.svg"
                  alt="Active Project"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              </button>

              {/* Floating Popover Menu: text stays the SAME weight (font-medium) whether
                 selected or not — only the background pill (white) indicates selection */}
              {isPopupOpen && (
                <div className="animate-in fade-in zoom-in-95 absolute top-0 left-[64px] z-50 flex w-[246px] flex-col gap-[4px] rounded-l-[12px] rounded-r-[8px] border border-[#E8EDFF] bg-[#D7E2FF] p-[8px] shadow-xl duration-150">
                  {projectLinks.map((link) => {
                    const isSelected = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsPopupOpen(false)}
                        className={cn(
                          'flex h-[40px] items-center gap-[12px] rounded-[40px] px-[16px] py-[10px] text-[14px] leading-[20px] font-medium text-[#041B3C] transition-colors',
                          isSelected
                            ? 'bg-white shadow-2xs'
                            : 'hover:bg-white/60'
                        )}
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
      </div>

      {/* Bottom Section: Collapse Toggle & Logout Buttons */}
      <div className="mt-auto flex flex-col gap-2 border-t border-[#E8EDFF] pt-4">
        {/* Collapse Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-semibold text-[#4F5F7B] transition-colors hover:bg-[#E8EDFF]/60 hover:text-[#041B3C]',
            isCollapsed && 'justify-center px-0'
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Image
            src="/icons/Collapse.svg"
            alt="Collapse"
            width={12}
            height={20}
            className={cn(
              'h-4.5 w-auto shrink-0 transition-transform duration-300',
              isCollapsed && 'rotate-180'
            )}
          />
          {!isCollapsed && <span>Collapse</span>}
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-semibold text-[#BA1A1A] transition-colors hover:bg-[#FFDAD6]/50',
            isCollapsed && 'justify-center px-0'
          )}
          title={isCollapsed ? 'Log out' : undefined}
        >
          <Image
            src="/icons/logout.svg"
            alt="Logout"
            width={18}
            height={18}
            className="h-4.5 w-4.5 shrink-0"
          />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
