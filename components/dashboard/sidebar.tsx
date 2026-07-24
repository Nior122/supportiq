"use client";

/**
 * WHY THIS FILE EXISTS
 * -------------------
 * The persistent navigation sidebar for the dashboard. It uses the App Router's
 * `usePathname()` to highlight the active route. The sidebar is responsive: on
 * mobile it slides in as an overlay (controlled by the parent `<DashboardShell>`);
 * on desktop it's a fixed-width column.
 *
 * Every nav item maps 1:1 to a route in `app/(dashboard)/`. Adding a page = adding
 * a `NavItem` here and a route directory — the surface area is intentionally small
 * to prevent nav/route drift.
 *
 * The sidebar collapses on narrow screens and expands on hover via Tailwind group
 * hover — no JS needed for the expand/collapse interaction, just CSS.
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
  Home,
  FlaskConical,
  LayoutDashboard,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bots", href: "/dashboard/bots", icon: Bot },
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
        "group flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <item.icon className={cn(
        "h-4 w-4 shrink-0 transition-colors",
        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
      )} />
      <span className="truncate">{item.label}</span>
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
      className="flex h-full flex-col gap-6 overflow-y-auto px-4 py-6"
      aria-label="Main navigation"
    >
      <div>
        <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
          Main
        </div>
        <div className="flex flex-col gap-0.5">
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
        <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
          Account
        </div>
        <div className="flex flex-col gap-0.5">
          {secondaryNavItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
