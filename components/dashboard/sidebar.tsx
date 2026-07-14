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
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
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
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <item.icon className="h-4 w-4 shrink-0" />
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
      className="flex h-full flex-col gap-1 overflow-y-auto p-3"
      aria-label="Main navigation"
    >
      <div className="flex flex-col gap-1">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
          />
        ))}
      </div>

      <div className="my-3 h-px bg-border" />

      <div className="flex flex-col gap-1">
        {secondaryNavItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
          />
        ))}
      </div>
    </nav>
  );
}
