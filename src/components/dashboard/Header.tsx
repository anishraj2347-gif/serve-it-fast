import { useDashboard } from "@/store/useDashboard";
import { useNow } from "@/hooks/useNow";
import { currency } from "@/lib/format";
import { useMemo } from "react";

export function Header() {
  const restaurantName = useDashboard((s) => s.restaurantName);
  const orders = useDashboard((s) => s.orders);
  const now = useNow(15_000);

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
    return { todays: todays.length, live, revenue };
  }, [orders, now]);

  const time = new Date(now).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Date(now).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 border-b-2 border-foreground bg-paper/85 backdrop-blur-sm">
      {/* Masthead */}
      <div className="border-b border-border/70">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="font-mono">Vol. IX · No. 042</span>
          <span className="hidden sm:inline">{date}</span>
          <span className="font-mono tabular-nums">{time}</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-8 py-5">
        <div className="flex items-end gap-5">
          <div className="grid size-14 place-items-center rounded-sm bg-foreground text-background shadow-paper">
            <span className="font-display text-2xl font-bold leading-none">B</span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold leading-none tracking-tight sm:text-4xl">
                {restaurantName}
              </h1>
              <span className="hidden rounded-full border border-foreground/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest sm:inline-block">
                Service Desk
              </span>
            </div>
            <p className="mt-1.5 text-xs italic text-muted-foreground">
              The daily mise en place — live orders, prep timing &amp; revenue at a glance.
            </p>
          </div>
        </div>

        <div className="flex items-stretch gap-0 divide-x divide-border rounded-sm border border-foreground/80 bg-card/80 shadow-paper">
          <HeaderStat label="Live" value={stats.live} accent />
          <HeaderStat label="Today" value={stats.todays} />
          <HeaderStat label="Revenue" value={currency(stats.revenue)} />
        </div>
      </div>
    </header>
  );
}

function HeaderStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="px-5 py-3">
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {accent && <span className="size-1.5 animate-pulse rounded-full bg-primary" />}
        {label}
      </div>
      <div
        className={`font-display text-2xl font-semibold leading-tight tabular-nums ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
