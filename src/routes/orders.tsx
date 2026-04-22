import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { PageHero } from "@/components/dashboard/PageHero";
import { PageShell } from "@/components/dashboard/PageShell";
import { useDashboard } from "@/store/useDashboard";
import { useMemo } from "react";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({
    meta: [
      { title: "Orders · Bella Cucina" },
      {
        name: "description",
        content:
          "Live order ticket board — new, preparing, ready, delivered. Drag tickets between columns to advance status during service.",
      },
      { property: "og:title", content: "Orders · Bella Cucina" },
      {
        property: "og:description",
        content:
          "Live order ticket board for restaurant operations — drag to advance status.",
      },
    ],
  }),
});

function OrdersPage() {
  const orders = useDashboard((s) => s.orders);

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
        lede="Every ticket the kitchen sees. Drag a card between columns to advance its status, or use the action buttons on incoming orders."
        meta={meta}
      />
      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        <KanbanBoard />
      </div>
    </PageShell>
  );
}
