"use client";

/**
 * SupportIQ Dashboard Sidebar - Premium AI Rebrand
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Bot,
  BarChart3,
  MessageSquare,
  Users,
  Settings,
  CreditCard,
  Puzzle,
  FlaskConical,
  LayoutDashboard,
  Zap,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Assistants", href: "/dashboard/bots", icon: Bot },
  { label: "Playground", href: "/dashboard/playground", icon: FlaskConical },
  { label: "Conversations", href: "/dashboard/conversations", icon: MessageSquare },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Lead Capture", href: "/dashboard/leads", icon: Users },
];

const secondaryNavItems: NavItem[] = [
  { label: "Integrations", href: "/dashboard/integrations", icon: Puzzle },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Console", href: "/dashboard/settings", icon: Settings },
];

function SidebarNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300",
        isActive
          ? "bg-primary text-white shadow-glow"
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <item.icon className={cn(
        "h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110",
        isActive ? "text-white" : "text-primary/60 group-hover:text-primary"
      )} />
      <span className="truncate tracking-tight font-mono uppercase text-[11px]">{item.label}</span>
      {isActive && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="flex h-full flex-col gap-8 overflow-y-auto px-6 py-8 bg-background border-r border-white/5"
      aria-label="Main navigation"
    >
      {/* Sidebar Logo */}
      <Link href="/" className="px-4 mb-4 group">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ai-gradient shadow-glow group-hover:scale-105 transition-transform">
             <Zap className="h-5 w-5 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter text-foreground uppercase">SupportIQ</span>
            <span className="text-[9px] font-mono font-bold text-primary/60 tracking-widest">AI_CORE_V2</span>
          </div>
        </div>
      </Link>

      <div className="space-y-10">
        <div>
          <div className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 font-mono">
            Intelligence
          </div>
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                isActive={isActive(item.href)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 font-mono">
            System
          </div>
          <div className="flex flex-col gap-1.5">
            {secondaryNavItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                isActive={isActive(item.href)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Premium Badge */}
      <div className="mt-auto px-2">
         <div className="rounded-2xl bg-ai-gradient p-5 shadow-glow relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
               <h4 className="text-white text-xs font-black uppercase tracking-wider mb-2 font-mono">Enterprise Node</h4>
               <p className="text-white/70 text-[10px] mb-4 leading-tight font-medium">99.9% AI Availability. <br/>Unlimited tokens active.</p>
               <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-white animate-pulse" />
               </div>
            </div>
         </div>
      </div>
    </nav>
  );
}
