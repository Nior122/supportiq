"use client";

/**
 * WHY THIS FILE EXISTS
 * -------------------
 * The dashboard shell wraps all `(dashboard)` pages with the persistent sidebar
 * and top nav bar. It manages the mobile sidebar open/close state via a simple
 * boolean — no context needed because only this component toggles it.
 *
 * Layout:
 *  - On desktop (≥1024px): sidebar is always visible on the left, content fills
 *    the remaining space.
 *  - On mobile (<1024px): sidebar is hidden by default, slides in as an overlay
 *    when the hamburger is tapped, and a backdrop dims the rest of the screen.
 *
 * The sidebar width (240px) matches the `w-60` Tailwind class. If you change
 * one, change the other.
 */
import { useState, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Skip-to-content link — keyboard users can bypass the sidebar. Visually
          hidden until focused. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-md"
      >
        Skip to content
      </a>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — fixed on mobile, static on desktop */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border/40 bg-background
          transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Sidebar"
      >
        {/* Brand mark at top of sidebar */}
        <div className="flex h-14 items-center gap-2 px-6">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary shadow-sm">
            <span className="text-[10px] font-bold text-primary-foreground text-white">S</span>
          </div>
          <span className="text-[14px] font-bold tracking-tight">SupportIQ</span>
        </div>

        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onToggleSidebar={toggleSidebar} />
        <main id="main-content" className="flex-1 overflow-y-auto bg-muted/5 p-8">
          <div className="mx-auto max-w-screen-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
