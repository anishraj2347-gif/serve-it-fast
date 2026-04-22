import { createFileRoute } from "@tanstack/react-router";
import { RevenuePanel } from "@/components/dashboard/RevenuePanel";
import { PageHero } from "@/components/dashboard/PageHero";
import { PageShell } from "@/components/dashboard/PageShell";

export const Route = createFileRoute("/revenue")({
  component: RevenuePage,
  head: () => ({
    meta: [
      { title: "The Books · Revenue · Bella Cucina" },
      {
        name: "description",
        content:
          "The daily ledger — today's takings, the week's trend, and the category mix telling you where the kitchen is really earning.",
      },
      { property: "og:title", content: "The Books · Revenue · Bella Cucina" },
      {
        property: "og:description",
        content:
          "Daily takings, weekly trend, and where the money is really being made.",
      },
    ],
  }),
});

function RevenuePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Section IV · Ledger"
        title="The Books"
        lede="Where the takings land, plate by plate. A daily ledger written as the orders close."
        meta="Today · Week · Category mix"
      />
      <div className="mx-auto max-w-[1400px] px-6 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <RevenuePanel />
        </div>
      </div>
    </PageShell>
  );
}
