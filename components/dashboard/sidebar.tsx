"use client";

/**
 * SupportIQ Dashboard Sidebar - Premium AI Blue
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
  { label: "Leads", href: "/dashboard/leads", icon: Users },
];

const secondaryNavItems: NavItem[] = [
  { label: "Integrations", href: "/dashboard/integrations", icon: Puzzle },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function SidebarNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200",
        isActive
          ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <item.icon className={cn(
        "h-4 w-4 shrink-0 transition-colors",
        isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-100"
      )} />
      <span className="truncate">{item.label}</span>
      {isActive && (
        <div className="ml-auto h-1 w-1 rounded-full bg-blue-600 dark:bg-blue-400" />
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
      className="flex h-full flex-col gap-8 overflow-y-auto px-6 py-10 bg-white border-r border-slate-200 dark:bg-[#020617] dark:border-slate-800"
      aria-label="Main navigation"
    >
      {/* Brand */}
      <Link href="/" className="px-4 group mb-4">
        <div className="flex items-center gap-2.5">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-glow group-hover:scale-105 transition-transform">
              <Zap className="h-4 w-4 text-white fill-white" />
           </div>
           <span className="text-lg font-bold tracking-tighter text-slate-900 dark:text-white">SupportIQ</span>
        </div>
      </Link>

      <div className="space-y-10">
        <div>
          <div className="mb-4 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Navigation
          </div>
          <div className="flex flex-col gap-1">
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
          <div className="mb-4 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            System
          </div>
          <div className="flex flex-col gap-1">
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

      <div className="mt-auto px-4">
         <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Standard Node</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">System stable. AI metrics verified for production.</p>
         </div>
      </div>
    </nav>
  );
}
