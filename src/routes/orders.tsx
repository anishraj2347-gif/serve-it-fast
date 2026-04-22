import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { OrdersBarView } from "@/components/dashboard/OrdersBarView";
import { OrdersTableView } from "@/components/dashboard/OrdersTableView";
import { PageHero } from "@/components/dashboard/PageHero";
import { PageShell } from "@/components/dashboard/PageShell";
import { useDashboard } from "@/store/useDashboard";
import { useMemo, useState } from "react";
import { LayoutGrid, BarChart3, Table as TableIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({
    meta: [
      { title: "Orders · Bella Cucina" },
      {
        name: "description",
        content:
          "Live order ticket board — switch between grid, bar chart, and table views to manage service.",
      },
      { property: "og:title", content: "Orders · Bella Cucina" },
      {
        property: "og:description",
        content:
          "Live order ticket board for restaurant operations — grid, bar, and table views.",
      },
    ],
  }),
});

type ViewMode = "grid" | "bar" | "table";

const VIEWS: Array<{ key: ViewMode; label: string; icon: typeof LayoutGrid }> = [
  { key: "grid", label: "Grid", icon: LayoutGrid },
  { key: "bar", label: "Bar", icon: BarChart3 },
  { key: "table", label: "Table", icon: TableIcon },
];

function OrdersPage() {
  const orders = useDashboard((s) => s.orders);
  const [view, setView] = useState<ViewMode>("grid");

  const counts = useMemo(() => {
    return orders.reduce(
      (acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [orders]);

  const meta = `New ${counts.new ?? 0} · Preparing ${counts.preparing ?? 0} · Ready ${counts.ready ?? 0} · Delivered ${counts.delivered ?? 0}`;

  return (
    <PageShell>
      <PageHero
        eyebrow="Live service"
        title="Orders"
        lede="Every ticket the kitchen sees. Switch between grid, bar, and table views to manage service the way you prefer."
        meta={meta}
      />
      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        {/* View switcher */}
        <div className="mb-5 flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {orders.length} active ticket{orders.length === 1 ? "" : "s"}
          </div>
          <div className="inline-flex rounded-lg border border-border bg-card p-1 shadow-xs">
            {VIEWS.map((v) => {
              const Icon = v.icon;
              const active = view === v.key;
              return (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={active}
                >
                  <Icon className="size-3.5" />
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        {view === "grid" && <KanbanBoard />}
        {view === "bar" && <OrdersBarView orders={orders} />}
        {view === "table" && <OrdersTableView orders={orders} />}
      </div>
    </PageShell>
  );
}
