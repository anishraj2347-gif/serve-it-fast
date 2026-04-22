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
      { title: "The Pass · Bella Cucina" },
      {
        name: "description",
        content:
          "Live order ticket board — incoming, on the pass, plated, served. Drag tickets between columns to advance status during service.",
      },
      { property: "og:title", content: "The Pass · Bella Cucina" },
      {
        property: "og:description",
        content:
          "Live order ticket board for the kitchen pass — drag to advance, watch for delays.",
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

  const meta = `Incoming ${counts.new ?? 0} · On Pass ${counts.preparing ?? 0} · Plated ${counts.ready ?? 0} · Served ${counts.delivered ?? 0}`;

  return (
    <PageShell>
      <PageHero
        eyebrow="Section I · Live Service"
        title="The Pass"
        lede="Every ticket the kitchen sees, set in type and timed to the second. Drag a ticket between columns to advance its status."
        meta={meta}
      />
      <div className="mx-auto max-w-[1400px] px-6 py-10 sm:px-8">
        <KanbanBoard />
      </div>
    </PageShell>
  );
}
