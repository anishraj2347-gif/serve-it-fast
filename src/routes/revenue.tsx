import { createFileRoute } from "@tanstack/react-router";
import { RevenuePanel } from "@/components/dashboard/RevenuePanel";
import { PageHero } from "@/components/dashboard/PageHero";
import { PageShell } from "@/components/dashboard/PageShell";

export const Route = createFileRoute("/revenue")({
  component: RevenuePage,
  head: () => ({
    meta: [
      { title: "Revenue · Bella Cucina" },
      {
        name: "description",
        content:
          "Revenue analytics — today's takings, weekly trend, and category-level breakdown showing where the kitchen is really earning.",
      },
      { property: "og:title", content: "Revenue · Bella Cucina" },
      {
        property: "og:description",
        content:
          "Daily takings, weekly trend, and category breakdown.",
      },
    ],
  }),
});

function RevenuePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Financial overview"
        title="Revenue"
        lede="Where today's takings land and what's driving them. The category breakdown highlights which sections of the menu are pulling their weight."
        meta="Today · This week · Category mix"
      />
      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <RevenuePanel />
        </div>
      </div>
    </PageShell>
  );
}
