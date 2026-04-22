import { createFileRoute } from "@tanstack/react-router";
import { AIPredictionPanel } from "@/components/dashboard/AIPredictionPanel";
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
          "Demand forecast for tomorrow's service — peak window, confidence level, and prep recommendations derived from the last seven days.",
      },
      { property: "og:title", content: "Forecast · Bella Cucina" },
      {
        property: "og:description",
        content:
          "Predicted peak window for tomorrow's service, learned from 7 days of order data.",
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
        lede="Tomorrow's expected peak window, predicted from the last seven days of service. Use the prep recommendation to staff and stage accordingly."
        meta="Updates each visit · 7-day rolling pattern · 3-hour peak window"
      />
      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <AIPredictionPanel />
        </div>
      </div>
    </PageShell>
  );
}
