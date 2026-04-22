import { createFileRoute } from "@tanstack/react-router";
import { AIPredictionPanel } from "@/components/dashboard/AIPredictionPanel";
import { PageHero } from "@/components/dashboard/PageHero";
import { PageShell } from "@/components/dashboard/PageShell";

export const Route = createFileRoute("/forecast")({
  component: ForecastPage,
  head: () => ({
    meta: [
      { title: "The Oracle · Forecast · Bella Cucina" },
      {
        name: "description",
        content:
          "A heuristic demand forecast for tomorrow's service — peak window, confidence, and a chef's prep note derived from the last seven days.",
      },
      { property: "og:title", content: "The Oracle · Forecast · Bella Cucina" },
      {
        property: "og:description",
        content:
          "Tomorrow's expected rush window, learned from the last seven days of service.",
      },
    ],
  }),
});

function ForecastPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Section II · Tomorrow"
        title="The Oracle"
        lede="A reading of the last seven days, pressed into a single forecast for tomorrow's pass."
        meta="Updated each visit · 7-day rolling pattern · 3-hour peak window"
      />
      <div className="mx-auto max-w-[1400px] px-6 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <AIPredictionPanel />
        </div>
      </div>
    </PageShell>
  );
}
