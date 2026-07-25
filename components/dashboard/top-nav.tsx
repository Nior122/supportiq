"use client";

/**
 * SupportIQ Dashboard TopNav - Premium AI Rebrand
 */
import { useOrganization } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Moon, Sun, Menu, Home, Sparkles } from "lucide-react";
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
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-white/5 bg-background/60 px-8 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 lg:hidden text-primary"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Workspace Context */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest font-mono">
           <Sparkles className="h-3 w-3" />
           AI_MODE: PRO
        </div>
        
        <div className="h-4 w-[1px] bg-white/10 hidden lg:block" />

        <Link href="/" className="flex items-center gap-3 group transition-all">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ai-gradient shadow-glow text-[12px] font-black text-white font-mono uppercase">
            {organization?.name?.[0] ?? "S"}
          </div>
          <div className="flex flex-col">
             <span className="text-[14px] font-black text-foreground leading-none tracking-tight">
               {organization?.name ?? "SupportIQ Console"}
             </span>
             <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest mt-1">Workspace_Default</span>
          </div>
        </Link>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-6">
        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
           <Button
             variant="ghost"
             size="sm"
             asChild
             className="text-muted-foreground hover:text-primary font-bold uppercase tracking-tighter text-[11px] font-mono"
           >
             <Link href="/">
               <Home className="h-3.5 w-3.5 mr-2" />
               Public_Site
             </Link>
           </Button>
        </div>

        <div className="h-4 w-[1px] bg-white/10" />

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          aria-label="Toggle theme"
          className="h-9 w-9 rounded-xl border border-white/5 bg-white/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* User avatar */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9 rounded-xl ring-2 ring-primary/20 shadow-glow transition-transform hover:scale-105",
            },
          }}
        />
      </div>
    </header>
  );
}
