'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { useUser } from '@/src/context/user-context';
import { useActiveProject } from '@/src/context/project-context';

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
  const { logout, isLoggingOut } = useUser();
  const { activeProjectId, activeProjectName } = useActiveProject();

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

  const handleLogout = async () => {
    await logout();
  };

  const projectLinks = activeProjectId
    ? [
        {
          name: 'Tasks',
          href: `/project/${activeProjectId}/tasks`,
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
          href: `/project/${activeProjectId}/members`,
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
          name: 'Epics',
          href: `/project/${activeProjectId}/epics`,
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
          name: 'Details',
          href: `/project/${activeProjectId}/edit`,
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
      ]
    : [];

  const navTextStyle: React.CSSProperties = {
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0px',
    verticalAlign: 'middle',
  };

  return (
    <aside
      className={cn(
        'relative flex h-full min-h-screen flex-col justify-between border-r border-black/10 bg-surface-low transition-all duration-300 select-none',
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
            <span className="text-[18px] font-bold tracking-[0.1em] text-slate-900">
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
                ? 'border border-card-border bg-white shadow-2xs'
                : 'hover:bg-white/60',
              isCollapsed && 'justify-center px-0'
            )}
            title={isCollapsed ? 'Projects' : undefined}
          >
            <Image
              src="/icons/project.svg"
              alt="Projects"
              width={20}
              height={20}
              className="h-5 w-5 shrink-0"
            />
            {!isCollapsed && (
              <span style={navTextStyle} className="text-slate-900">
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
                ? 'border border-card-border bg-white shadow-2xs'
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
              <span style={navTextStyle} className="text-slate-900">
                My Statistics
              </span>
            )}
          </Link>
        </nav>

        {/* Divider + Active Project Section (Visible only when inside a project route) */}
        {activeProjectId && (
          <div className="flex flex-col gap-3">
            <div
              className={cn(
                'border-t border-card-border',
                isCollapsed && 'mx-auto w-8'
              )}
            />

            {/* Section 3: Current Active Project Accordion & Collapsed Floating Popup */}
            {!isCollapsed ? (
              /* EXPANDED MODE: Accordion */
              <div className="flex flex-col overflow-hidden rounded-[12px] border border-card-border">
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => setIsAccordionOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between bg-input-bg p-3 text-left transition-colors hover:bg-input-bg-hover"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Image
                      src="/icons/folder.svg"
                      alt="Active Project"
                      width={18}
                      height={18}
                      className="h-4.5 w-4.5 shrink-0"
                    />
                    <span
                      className="truncate text-[14px] leading-[20px] font-semibold text-slate-900"
                      title={activeProjectName || undefined}
                    >
                      {activeProjectName || 'Active Project'}
                    </span>
                  </div>
                  <svg
                    className={cn(
                      'h-4 w-4 shrink-0 text-slate-900 transition-transform duration-200',
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

                {/* Sub-links container */}
                {isAccordionOpen && (
                  <div className="flex flex-col gap-[4px] bg-white p-[8px]">
                    {projectLinks.map((link) => {
                      const isSelected = pathname === link.href;
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          className={cn(
                            'flex h-[40px] items-center gap-[12px] rounded-[40px] px-[16px] py-[10px] text-[14px] leading-[20px] font-medium text-slate-900 transition-colors',
                            isSelected ? 'bg-surface-low' : 'hover:bg-surface-low/60'
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
                    'flex h-11 w-11 items-center justify-center rounded-xl border border-card-border bg-input-bg text-slate-900 transition-all hover:bg-input-bg-hover',
                    isPopupOpen && 'bg-input-bg-hover ring-2 ring-primary-container/50'
                  )}
                  title={activeProjectName || 'Active Project Links'}
                >
                  <Image
                    src="/icons/folder.svg"
                    alt="Active Project"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>

                {/* Floating Popover Menu */}
                {isPopupOpen && (
                  <div className="animate-in fade-in zoom-in-95 absolute top-0 left-[64px] z-50 flex w-[246px] flex-col gap-[4px] rounded-l-[12px] rounded-r-[8px] border border-card-border bg-input-bg p-[8px] shadow-xl duration-150">
                    <div className="px-3 py-1.5 text-xs font-bold text-slate-900 truncate border-b border-card-border/60 mb-1">
                      {activeProjectName}
                    </div>
                    {projectLinks.map((link) => {
                      const isSelected = pathname === link.href;
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setIsPopupOpen(false)}
                          className={cn(
                            'flex h-[40px] items-center gap-[12px] rounded-[40px] px-[16px] py-[10px] text-[14px] leading-[20px] font-medium text-slate-900 transition-colors',
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
        )}
      </div>

      {/* Bottom Section: Collapse Toggle & Logout Buttons */}
      <div className="mt-auto flex flex-col gap-2 border-t border-card-border pt-4">
        {/* Collapse Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-semibold text-slate-600 transition-colors hover:bg-card-border/60 hover:text-slate-900',
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
          disabled={isLoggingOut}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-semibold text-error transition-colors hover:bg-error-bg/50 disabled:cursor-not-allowed disabled:opacity-50',
            isCollapsed && 'justify-center px-0'
          )}
          title={
            isCollapsed
              ? isLoggingOut
                ? 'Logging out...'
                : 'Log out'
              : undefined
          }
        >
          {isLoggingOut ? (
            <svg
              className="h-4.5 w-4.5 shrink-0 animate-spin text-error"
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
              className="h-4.5 w-4.5 shrink-0"
            />
          )}
          {!isCollapsed && (
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          )}
        </button>
      </div>
    </aside>
  );
}
