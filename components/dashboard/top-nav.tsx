"use client";

/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Top navigation bar for the dashboard. It handles:
 *  - Mobile sidebar toggle (hamburger icon that opens/closes the sidebar on small screens)
 *  - Workspace name display (from Clerk's `useOrganization`)
 *  - Theme toggle (light/dark/system via next-themes)
 *  - User avatar dropdown (profile, sign out, organization switcher)
 *
 * Uses Clerk's `<UserButton />` for the avatar dropdown — it's fully customizable
 * and handles session management, profile, and sign-out out of the box.
 */
import { useOrganization } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  onToggleSidebar: () => void;
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const { organization } = useOrganization();
  const { setTheme, resolvedTheme } = useTheme();

  function cycleTheme() {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Workspace name */}
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded border border-border/50 bg-muted text-[10px] font-bold text-muted-foreground">
          {organization?.name?.[0] ?? "S"}
        </div>
        <span className="text-[13px] font-medium text-foreground/80">
          {organization?.name ?? "SupportIQ"}
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          aria-label="Toggle theme"
          className="h-8 w-8 text-muted-foreground/60 hover:text-foreground"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* User avatar */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-7 w-7 rounded-full ring-1 ring-border/50",
            },
          }}
        />
      </div>
    </header>
  );
}
