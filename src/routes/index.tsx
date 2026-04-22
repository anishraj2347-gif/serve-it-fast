import { createFileRoute, Link } from "@tanstack/react-router";
import { useDashboard } from "@/store/useDashboard";
import { currency, formatDuration } from "@/lib/format";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/dashboard/PageShell";
import {
  ArrowUpRight,
  Flame,
  ListChecks,
  Sparkles,
  BarChart3,
  Wallet,
  UtensilsCrossed,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Overview · Bella Cucina" },
      {
        name: "description",
        content:
          "Restaurant operations overview — live orders, today's revenue, demand forecast, and quick links to every section.",
      },
      { property: "og:title", content: "Overview · Bella Cucina" },
      {
        property: "og:description",
        content:
          "Real-time operations dashboard for restaurant teams.",
      },
    ],
  }),
});

const SECTIONS = [
  {
    to: "/orders" as const,
    title: "Orders",
    description: "Live ticket board with drag-to-advance status updates",
    icon: ListChecks,
  },
  {
    to: "/forecast" as const,
    title: "Forecast",
    description: "Predicted peak windows derived from 7 days of order data",
    icon: Sparkles,
  },
  {
    to: "/performance" as const,
    title: "Performance",
    description: "Prep time, delivery, acceptance and hourly volume",
    icon: BarChart3,
  },
  {
    to: "/revenue" as const,
    title: "Revenue",
    description: "Daily takings, weekly trend and category breakdown",
    icon: Wallet,
  },
  {
    to: "/menu" as const,
    title: "Menu",
    description: "Manage dishes, prices, prep times and availability",
    icon: UtensilsCrossed,
  },
];

function Home() {
  const orders = useDashboard((s) => s.orders);
  const menu = useDashboard((s) => s.menu);
  const hourly = useDashboard((s) => s.hourly);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stats = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const yesterday = startOfDay.getTime() - 24 * 60 * 60 * 1000;

    const todays = orders.filter(
      (o) => o.createdAt >= startOfDay.getTime() && o.status !== "cancelled",
    );
    const yesterdays = orders.filter(
      (o) =>
        o.createdAt >= yesterday &&
        o.createdAt < startOfDay.getTime() &&
        o.status !== "cancelled",
    );

    const live = orders.filter(
      (o) => o.status === "new" || o.status === "preparing",
    ).length;
    const revenue = todays.reduce((acc, o) => acc + o.totalAmount, 0);
    const yesterdayRev = yesterdays.reduce((a, o) => a + o.totalAmount, 0);
    const revDelta = yesterdayRev
      ? Math.round(((revenue - yesterdayRev) / yesterdayRev) * 100)
      : 0;

    let prepSum = 0,
      prepN = 0;
    for (const o of orders) {
      if (o.prepStartTime && o.readyTime) {
        prepSum += (o.readyTime - o.prepStartTime) / 1000;
        prepN++;
      }
    }
    const avgPrep = prepN ? prepSum / prepN : 0;

    const today = hourly[hourly.length - 1]?.date;
    const todaysHourly = hourly.filter((x) => x.date === today);
    const max = todaysHourly.length
      ? Math.max(...todaysHourly.map((x) => x.orderCount))
      : 0;
    const cur =
      todaysHourly.find((x) => x.hour === new Date().getHours())?.orderCount ?? 0;
    const isRush = max > 0 && cur >= max * 0.85;

    return {
      live,
      todays: todays.length,
      revenue,
      revDelta,
      avgPrep,
      menuCount: menu.length,
      isRush,
    };
  }, [orders, menu, hourly]);

  return (
    <PageShell>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Operations · Today
              </div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Welcome back.
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                Here's how Bella Cucina is performing right now — live orders,
                today's revenue, and a quick read on tomorrow's expected rush.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Open orders
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                to="/forecast"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
              >
                View forecast
              </Link>
            </div>
          </div>

          {stats.isRush && (
            <div className="mt-6 flex items-center gap-2.5 rounded-lg border border-status-delayed/20 bg-status-delayed-soft/50 px-4 py-3 text-sm">
              <Flame className="size-4 shrink-0 text-status-delayed" />
              <span className="font-semibold text-status-delayed">
                Rush in progress.
              </span>
              <span className="text-foreground/85">
                {stats.live} live tickets — keep all stations staffed and
                pre-fire popular items.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* KPI grid */}
      <section className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <KpiCard
            label="Live orders"
            value={mounted ? stats.live : "—"}
            hint="New + preparing"
            accent
          />
          <KpiCard
            label="Today's orders"
            value={mounted ? stats.todays : "—"}
            hint="Excluding cancellations"
          />
          <KpiCard
            label="Today's revenue"
            value={mounted ? currency(stats.revenue) : "—"}
            hint={
              mounted ? (
                <DeltaBadge delta={stats.revDelta} label="vs yesterday" />
              ) : (
                "vs yesterday"
              )
            }
          />
          <KpiCard
            label="Avg prep time"
            value={mounted ? formatDuration(stats.avgPrep) : "—"}
            hint="Across all orders"
          />
        </div>
      </section>

      {/* Sections grid */}
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Jump into a workspace
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Five focused sections covering the full operations workflow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.to}
                to={s.to}
                className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" strokeWidth={2.25} />
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-4 shadow-xs ${
        accent ? "border-primary/20 ring-1 ring-primary/5" : "border-border"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider ${
          accent ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {accent && (
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
          </span>
        )}
        {label}
      </div>
      <div
        className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground"
        suppressHydrationWarning
      >
        {value}
      </div>
      {hint && (
        <div
          className="mt-1 text-xs text-muted-foreground"
          suppressHydrationWarning
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function DeltaBadge({ delta, label }: { delta: number; label: string }) {
  const positive = delta >= 0;
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
          positive
            ? "bg-status-ready-soft text-status-ready"
            : "bg-status-delayed-soft text-status-delayed"
        }`}
      >
        {positive ? (
          <TrendingUp className="size-3" />
        ) : (
          <TrendingDown className="size-3" />
        )}
        {Math.abs(delta)}%
      </span>
      <span>{label}</span>
    </span>
  );
}
