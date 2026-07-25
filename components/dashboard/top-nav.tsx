"use client";

/**
 * SupportIQ Dashboard TopNav - Premium AI Blue
 */
import { useOrganization } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Moon, Sun, Menu, Home, ZapIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TopNavProps {
  onToggleSidebar: () => void;
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const { organization } = useOrganization();
  const { setTheme, resolvedTheme } = useTheme();

  function cycleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-6 backdrop-blur dark:bg-[#020617]/80 dark:border-slate-800">
      {/* Mobile Hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 lg:hidden text-slate-500"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb Context */}
      <div className="flex items-center gap-2 transition-opacity hover:opacity-80">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 shadow-sm">
           <ZapIcon className="h-3 w-3 text-white fill-white" />
        </div>
        <div className="flex items-center text-sm font-bold text-slate-900 dark:text-white">
          {organization?.name ?? "SupportIQ Console"}
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {/* Global Nav */}
        <Button
          variant="ghost"
          size="icon-sm"
          asChild
          className="text-slate-500 hover:text-blue-600 dark:hover:text-white"
        >
          <Link href="/">
            <Home className="h-4 w-4" />
          </Link>
        </Button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={cycleTheme}
          aria-label="Toggle theme"
          className="text-slate-500 hover:text-blue-600 dark:hover:text-white"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* User context */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 rounded-lg ring-1 ring-slate-200 dark:ring-slate-800",
            },
          }}
        />
      </div>
    </header>
  );
}
