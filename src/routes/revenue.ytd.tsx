import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange } from "lucide-react";
import { RevenuePeriodView } from "@/components/dashboard/RevenuePeriodView";

export const Route = createFileRoute("/revenue/ytd")({
  component: YtdPage,
  head: () => ({
    meta: [
      { title: "Year to date · Revenue · Bella Cucina" },
      {
        name: "description",
        content:
          "Year-to-date revenue with monthly trend, category mix, and the top-selling items across the year so far.",
      },
    ],
  }),
});

function YtdPage() {
  return (
    <RevenuePeriodView
      period="ytd"
      title="Year to date"
      description="From January 1st through today"
      icon={CalendarRange}
      trendLabel="Monthly revenue · this year"
      trendChart="area"
    />
  );
}
