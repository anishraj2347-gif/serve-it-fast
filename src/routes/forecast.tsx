import { createFileRoute } from "@tanstack/react-router";
import { ForecastView } from "@/components/dashboard/ForecastView";
import { PageHero } from "@/components/dashboard/PageHero";
import { PageShell } from "@/components/dashboard/PageShell";

export const Route = createFileRoute("/forecast")({
  component: ForecastPage,
  head: () => ({
    meta: [
      { title: "Forecast · Bella Cucina" },
      {
        name: "description",
        content:
          "AI-powered demand forecast — tomorrow's busiest 2-hour window, hourly demand table, and prep recommendations from 7 days of order data.",
      },
      { property: "og:title", content: "Forecast · Bella Cucina" },
      {
        property: "og:description",
        content:
          "AI-predicted peak window for tomorrow's service with hourly demand charts and tables.",
      },
    ],
  }),
});

function ForecastPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Demand prediction"
        title="Forecast"
        lede="An AI predictor scans 7 days of orders to surface tomorrow's busiest window and a single, actionable prep tip — backed by hourly charts and a full breakdown table."
        meta="AI-powered · 7-day rolling pattern · 2-hour peak window"
      />
      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        <ForecastView />
      </div>
    </PageShell>
  );
}
