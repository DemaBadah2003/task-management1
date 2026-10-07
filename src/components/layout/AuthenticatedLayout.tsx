'use client';

import React, { useState } from 'react';
import { UserProvider } from '@/src/context/user-context';
import { ProjectProvider } from '@/src/context/project-context';
import { Navbar } from '@/src/components/layout/Navbar';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { MobileNavigation } from '@/src/components/layout/MobileNavigation';

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <UserProvider>
      <ProjectProvider>
        <div className="bg-background flex h-screen w-full overflow-hidden">
          {/* Desktop Sidebar (hidden on mobile/tablet screens < 768px) */}
          <div className="hidden h-full shrink-0 md:flex">
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
            />
          </div>

          {/* Main View Area (Header + Scrollable Page Content) */}
          <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
            {/* Top Navbar */}
            <Navbar
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
            />

            {/* Page Content Viewport */}
            <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 pb-24 sm:p-6 md:p-8 md:pb-8">
              {children}
            </main>
          </div>

          {/* Mobile Navigation Drawer & Fixed Bottom Bar */}
          <MobileNavigation
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            onOpen={() => setIsMobileMenuOpen(true)}
          />
        </div>
      </ProjectProvider>
    </UserProvider>
  );
}
