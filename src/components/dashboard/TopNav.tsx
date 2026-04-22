import { Link } from "@tanstack/react-router";
import { useDashboard } from "@/store/useDashboard";
import { useNow } from "@/hooks/useNow";
import { currency } from "@/lib/format";
import { useEffect, useMemo, useState } from "react";

const NAV = [
  { to: "/", label: "Home", numeral: "00" },
  { to: "/orders", label: "The Pass", numeral: "01" },
  { to: "/forecast", label: "Forecast", numeral: "02" },
  { to: "/performance", label: "Performance", numeral: "03" },
  { to: "/revenue", label: "The Books", numeral: "04" },
  { to: "/menu", label: "Bill of Fare", numeral: "05" },
] as const;

export function TopNav() {
  const restaurantName = useDashboard((s) => s.restaurantName);
  const orders = useDashboard((s) => s.orders);
  const now = useNow(15_000);
  // Mount flag — render time/date only after hydration to avoid locale mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stats = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todays = orders.filter(
      (o) => o.createdAt >= startOfDay.getTime() && o.status !== "cancelled",
    );
    const live = orders.filter(
      (o) => o.status === "new" || o.status === "preparing",
    ).length;
    const revenue = todays.reduce((acc, o) => acc + o.totalAmount, 0);
    return { live, revenue };
  }, [orders, now]);

  const time = mounted
    ? new Date(now).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "--:--";
  const date = mounted
    ? new Date(now).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <header className="sticky top-0 z-30 border-b-2 border-foreground bg-paper/90 backdrop-blur">
      {/* Masthead strip */}
      <div className="border-b border-border/70">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:px-8">
          <span>Vol. IX · No. 042</span>
          <span className="hidden truncate sm:inline" suppressHydrationWarning>
            {date}
          </span>
          <span className="flex items-center gap-3 tabular-nums">
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              {stats.live} live · {currency(stats.revenue)}
            </span>
            <span suppressHydrationWarning>{time}</span>
          </span>
        </div>
      </div>

      {/* Brand + nav */}
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-sm bg-foreground text-background shadow-paper">
            <span className="font-display text-xl font-bold leading-none">B</span>
          </div>
          <div className="leading-none">
            <div className="font-display text-2xl font-bold tracking-tight">
              {restaurantName}
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Service Desk · est. MMXXV
            </div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-px overflow-hidden rounded-sm border border-foreground/80 bg-card">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              className="group flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors hover:bg-paper data-[status=active]:bg-foreground data-[status=active]:text-background"
            >
              <span className="font-mono text-[9px] uppercase tracking-widest opacity-60 group-data-[status=active]:opacity-90">
                {item.numeral}
              </span>
              <span className="font-display tracking-tight">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
