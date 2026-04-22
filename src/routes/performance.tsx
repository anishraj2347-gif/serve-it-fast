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
          "Service throughput at a glance — average prep, delivery time, acceptance and cancellation rates, and today's hourly order flow.",
      },
      { property: "og:title", content: "Performance · Bella Cucina" },
      {
        property: "og:description",
        content:
          "The rhythm of service in numbers — prep time, delivery, acceptance and the hourly flow.",
      },
    ],
  }),
});

function PerformancePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Section III · The Numbers"
        title="Performance"
        lede="The rhythm of your service, set in figures. Watch for the lulls between rushes — they're where the kitchen earns its quiet."
        meta="Prep · Delivery · Acceptance · Hourly flow"
      />
      <div className="mx-auto max-w-[1400px] px-6 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <AnalyticsPanel />
        </div>
      </div>
    </PageShell>
  );
}
