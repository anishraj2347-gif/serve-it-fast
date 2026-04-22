import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { RevenuePeriodView } from "@/components/dashboard/RevenuePeriodView";

export const Route = createFileRoute("/revenue/mtd")({
  component: MtdPage,
  head: () => ({
    meta: [
      { title: "Month to date · Revenue · Bella Cucina" },
      {
        name: "description",
        content:
          "Month-to-date revenue with daily breakdown, category mix, and top-selling items for the current month.",
      },
    ],
  }),
});

function MtdPage() {
  return (
    <RevenuePeriodView
      period="mtd"
      title="Month to date"
      description="From the 1st of this month through today"
      icon={CalendarDays}
      trendLabel="Daily revenue · this month"
      trendChart="bar"
    />
  );
}
