import { createFileRoute, Link } from "@tanstack/react-router";
import { useDashboard } from "@/store/useDashboard";
import { currency } from "@/lib/format";
import { useMemo } from "react";
import { PageShell } from "@/components/dashboard/PageShell";
import { ArrowUpRight, Flame } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Bella Cucina · Service Desk" },
      {
        name: "description",
        content:
          "The editorial operations desk for a modern kitchen — live order pass, AI demand forecast, daily ledger and the carte, all under one masthead.",
      },
      { property: "og:title", content: "Bella Cucina · Service Desk" },
      {
        property: "og:description",
        content:
          "The editorial operations desk for a modern kitchen — live order pass, AI demand forecast, daily ledger and the carte.",
      },
    ],
  }),
});

const SECTIONS = [
  {
    to: "/orders" as const,
    numeral: "I",
    title: "The Pass",
    lede: "A drag-and-drop ticket board for live service. Fire, plate, deliver.",
    accent: "bg-status-new",
  },
  {
    to: "/forecast" as const,
    numeral: "II",
    title: "The Oracle",
    lede: "A heuristic forecast of tomorrow's rush, with chef's prep notes.",
    accent: "bg-status-preparing",
  },
  {
    to: "/performance" as const,
    numeral: "III",
    title: "Performance",
    lede: "Acceptance, prep, delivery — the rhythm of your service in numbers.",
    accent: "bg-status-ready",
  },
  {
    to: "/revenue" as const,
    numeral: "IV",
    title: "The Books",
    lede: "Daily takings, weekly trend, and where the money is really being made.",
    accent: "bg-brass",
  },
  {
    to: "/menu" as const,
    numeral: "V",
    title: "Bill of Fare",
    lede: "Curate the carte. Add, retire, reprice — and 86 a dish in one tap.",
    accent: "bg-primary",
  },
];

function Home() {
  const orders = useDashboard((s) => s.orders);
  const menu = useDashboard((s) => s.menu);
  const hourly = useDashboard((s) => s.hourly);

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
      menuCount: menu.length,
      isRush,
    };
  }, [orders, menu, hourly]);

  return (
    <PageShell>
      {/* Hero — front page of the paper */}
      <section className="border-b-2 border-foreground bg-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-12 sm:px-8 sm:py-20">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            The Daily Service · Front Page
          </div>
          <h1 className="mt-4 font-display text-6xl font-bold leading-[0.92] tracking-tight sm:text-8xl">
            Mise en place,
            <br />
            <span className="italic text-primary">in real time.</span>
          </h1>
          <p className="mt-6 max-w-2xl font-display text-xl italic leading-snug text-muted-foreground sm:text-2xl">
            An editorial operations desk for the modern kitchen — every ticket,
            every dish, every dollar, set in type and updated by the second.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-sm bg-foreground px-6 py-3 font-display text-base font-medium text-background transition-transform hover:-translate-y-0.5"
            >
              Open the Pass
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              to="/forecast"
              className="inline-flex items-center gap-2 rounded-sm border-2 border-foreground bg-transparent px-6 py-3 font-display text-base font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Read the Oracle
            </Link>
          </div>

          {stats.isRush && (
            <div className="mt-8 inline-flex items-center gap-3 rounded-sm border-l-4 border-primary bg-primary/5 px-4 py-3">
              <Flame className="size-4 text-primary" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                Rush · Now
              </span>
              <span className="font-display text-sm italic">
                {stats.live} live tickets — staff up, pre-fire popular plates.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Live ticker — bold stats strip */}
      <section className="border-b-2 border-foreground bg-foreground text-background">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px bg-foreground sm:grid-cols-4">
          <Stat label="Live tickets" value={stats.live} accent />
          <Stat label="Today's orders" value={stats.todays} />
          <Stat label="Today's revenue" value={currency(stats.revenue)} />
          <Stat label="Menu items" value={stats.menuCount} />
        </div>
      </section>

      {/* Sections grid — the table of contents */}
      <section className="mx-auto max-w-[1400px] px-6 py-14 sm:px-8 sm:py-20">
        <div className="mb-8 flex items-end justify-between border-b-2 border-foreground pb-3">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              Today's Edition
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Inside the paper
            </h2>
          </div>
          <p className="hidden font-display text-sm italic text-muted-foreground sm:block">
            five sections · one kitchen
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group relative flex flex-col gap-3 bg-card p-6 transition-colors hover:bg-paper"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Section {s.numeral}
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <div className="flex items-center gap-2.5">
                <span className={`size-2.5 rounded-full ${s.accent}`} />
                <h3 className="font-display text-2xl font-bold tracking-tight">
                  {s.title}
                </h3>
              </div>
              <p className="font-display text-sm italic leading-snug text-muted-foreground">
                {s.lede}
              </p>
              <div className="mt-2 ink-rule h-px" />
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/80">
                Read section →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editor's note */}
      <section className="border-t-2 border-foreground bg-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-14 sm:px-8 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                From the editor
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                A kitchen, set in type.
              </h2>
            </div>
            <div className="space-y-4 font-display text-lg leading-relaxed text-foreground/85 first-letter:float-left first-letter:mr-2 first-letter:font-bold first-letter:text-7xl first-letter:leading-[0.85]">
              <p>
                Every service is a small newspaper — orders arriving like wire copy,
                the pass running like a press, the books closing like a final
                edition. Bella Cucina's Service Desk treats each shift with the
                same care: a masthead at the top, columns that hold the news,
                rules of typography that keep it legible in the rush.
              </p>
              <p className="text-base text-muted-foreground">
                Open any section in the masthead above to begin tonight's service.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="bg-foreground p-5 sm:p-6">
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-background/70">
        {accent && <span className="size-1.5 animate-pulse rounded-full bg-primary" />}
        {label}
      </div>
      <div
        className={`mt-1 font-display text-3xl font-bold tabular-nums sm:text-4xl ${
          accent ? "text-primary" : "text-background"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
