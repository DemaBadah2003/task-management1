"use client";

import React, { useState } from "react";
import { UserProvider } from "@/src/context/user-context";
import { Navbar } from "@/src/components/layout/Navbar";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { MobileNavigation } from "@/src/components/layout/MobileNavigation";

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <UserProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#F9F9FF]">
        {/* Desktop Sidebar (hidden on mobile/tablet screens < 768px) */}
        <div className="hidden md:flex shrink-0 h-full">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          />
        </div>

        {/* Main View Area (Header + Scrollable Page Content) */}
        <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
          {/* Top Navbar */}
          <Navbar
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          {/* Page Content Viewport */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
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
    </UserProvider>
  );
}
