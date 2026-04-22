import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Flame } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
import { RevenuePanel } from "@/components/dashboard/RevenuePanel";
import { AIPredictionPanel } from "@/components/dashboard/AIPredictionPanel";
import { MenuManager } from "@/components/dashboard/MenuManager";
import { useOrderSimulation } from "@/hooks/useOrderSimulation";
import { useDashboard } from "@/store/useDashboard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Bella Cucina · Service Desk" },
      {
        name: "description",
        content:
          "An editorial restaurant operations dashboard — live order pass, demand forecast, revenue ledger and the daily bill of fare.",
      },
    ],
  }),
});

function Index() {
  useOrderSimulation();
  const orders = useDashboard((s) => s.orders);
  const hourly = useDashboard((s) => s.hourly);

  const isRushHour = useMemo(() => {
    const h = new Date().getHours();
    const todays = hourly.filter(
      (x) => x.date === hourly[hourly.length - 1]?.date,
    );
    if (todays.length === 0) return false;
    const max = Math.max(...todays.map((x) => x.orderCount));
    const cur = todays.find((x) => x.hour === h)?.orderCount ?? 0;
    return cur >= max * 0.85;
  }, [hourly]);

  const liveCount = orders.filter(
    (o) => o.status === "new" || o.status === "preparing",
  ).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-[1400px] space-y-8 px-8 py-8">
        {isRushHour && (
          <div className="flex animate-slide-in items-center gap-3 rounded-sm border-l-4 border-primary bg-primary/5 px-4 py-3">
            <Flame className="size-4 shrink-0 text-primary" />
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                Rush · Now
              </span>
              <span className="font-display text-sm italic">
                {liveCount} live tickets — keep stations staffed and pre-fire
                popular plates.
              </span>
            </div>
          </div>
        )}

        {/* Section masthead — Live board */}
        <section aria-label="Live orders" className="min-w-0">
          <div className="mb-4 flex items-end justify-between border-b-2 border-foreground pb-2">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                Section I · The Pass
              </div>
              <h2 className="font-display text-3xl font-bold leading-none tracking-tight">
                Live Order Board
              </h2>
            </div>
            <p className="hidden font-display text-xs italic text-muted-foreground sm:block">
              drag tickets between columns to advance status
            </p>
          </div>
          <KanbanBoard />
        </section>

        {/* Insights row */}
        <section aria-label="Insights">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <AIPredictionPanel />
            <AnalyticsPanel />
            <RevenuePanel />
          </div>
        </section>

        {/* Menu spans full width below */}
        <section aria-label="Menu management">
          <MenuManager />
        </section>

        <footer className="border-t border-foreground/30 pt-6 text-center">
          <div className="font-display text-sm italic text-muted-foreground">
            Bella Cucina · Service Desk
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            est. MMXXV — Demonstration mode
          </div>
        </footer>
      </main>
    </div>
  );
}
