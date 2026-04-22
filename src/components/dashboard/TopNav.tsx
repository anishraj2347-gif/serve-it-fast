import { Link } from "@tanstack/react-router";
import { useDashboard } from "@/store/useDashboard";
import { useNow } from "@/hooks/useNow";
import { currency } from "@/lib/format";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  ListChecks,
  Sparkles,
  BarChart3,
  Wallet,
  UtensilsCrossed,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ListChecks },
  { to: "/forecast", label: "Forecast", icon: Sparkles },
  { to: "/performance", label: "Performance", icon: BarChart3 },
  { to: "/revenue", label: "Revenue", icon: Wallet },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
] as const;

export function TopNav() {
  const restaurantName = useDashboard((s) => s.restaurantName);
  const orders = useDashboard((s) => s.orders);
  const now = useNow(15_000);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const stats = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const live = orders.filter(
      (o) => o.status === "new" || o.status === "preparing",
    ).length;
    const revenue = orders
      .filter(
        (o) => o.createdAt >= startOfDay.getTime() && o.status !== "cancelled",
      )
      .reduce((acc, o) => acc + o.totalAmount, 0);
    return { live, revenue };
  }, [orders, now]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <span className="text-sm font-bold tracking-tight">B</span>
          </div>
          <div className="leading-none">
            <div className="text-[15px] font-semibold tracking-tight text-foreground">
              {restaurantName}
            </div>
            <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">
              Operations
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 rounded-lg border border-border bg-surface-2/60 p-1 lg:flex">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: true }}
                className="group flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground data-[status=active]:bg-surface data-[status=active]:text-foreground data-[status=active]:shadow-xs"
              >
                <Icon className="size-3.5" strokeWidth={2.25} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Live indicator */}
        <div className="hidden items-center gap-3 md:flex">
          <div
            className="flex items-center gap-2 rounded-md border border-border bg-surface-2/60 px-3 py-1.5"
            suppressHydrationWarning
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-ready opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-status-ready" />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Live
            </span>
            <span className="text-[13px] font-semibold tabular-nums text-foreground">
              {mounted ? stats.live : "—"}
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="text-[13px] font-semibold tabular-nums text-foreground">
              {mounted ? currency(stats.revenue) : "—"}
            </span>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="grid size-9 place-items-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-surface-2 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-4" /> : <MenuIcon className="size-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-surface lg:hidden">
          <nav className="mx-auto flex max-w-[1400px] flex-col gap-0.5 px-3 py-2">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: true }}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground",
                    "data-[status=active]:bg-primary data-[status=active]:text-primary-foreground",
                  )}
                >
                  <Icon className="size-4" strokeWidth={2.25} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
