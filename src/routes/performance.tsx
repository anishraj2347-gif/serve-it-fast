import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
import { AIAnalysisPanel } from "@/components/dashboard/AIAnalysisPanel";
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
          "Service performance metrics with AI-powered insights — ask anything about prep time, delivery, revenue, menu mix or hourly volume.",
      },
      { property: "og:title", content: "Performance · Bella Cucina" },
      {
        property: "og:description",
        content:
          "Operational metrics with on-demand AI analysis — tables, charts and insights.",
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
        lede="Throughput and timing across the kitchen — and an AI analyst that can answer anything you ask about your service."
        meta="Prep · Delivery · Acceptance · AI insights"
      />
      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <AnalyticsPanel />
          </div>
          <div className="lg:col-span-3">
            <AIAnalysisPanel />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
