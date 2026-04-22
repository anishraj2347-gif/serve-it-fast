import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
import { PageHero } from "@/components/dashboard/PageHero";
import { PageShell } from "@/components/dashboard/PageShell";

export const Route = createFileRoute("/performance")({
  component: PerformancePage,
  head: () => ({
    meta: [
      { title: "Performance · Bella Cucina" },
      {
        name: "description",
        content:
          "Service performance metrics — average prep time, delivery time, acceptance and cancellation rates, plus today's hourly order volume.",
      },
      { property: "og:title", content: "Performance · Bella Cucina" },
      {
        property: "og:description",
        content:
          "Operational metrics — prep time, delivery, acceptance and the hourly order flow.",
      },
    ],
  }),
});

function PerformancePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Operational metrics"
        title="Performance"
        lede="Throughput and timing across the kitchen. Watch the hourly chart for the lulls between rushes — they're where you reset for the next push."
        meta="Prep · Delivery · Acceptance · Hourly volume"
      />
      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <AnalyticsPanel />
        </div>
      </div>
    </PageShell>
  );
}
