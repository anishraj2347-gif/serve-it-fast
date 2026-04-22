import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { RevenuePeriodView } from "@/components/dashboard/RevenuePeriodView";

export const Route = createFileRoute("/revenue/week")({
  component: WeekPage,
  head: () => ({
    meta: [
      { title: "This week · Revenue · Bella Cucina" },
      {
        name: "description",
        content:
          "Rolling 7-day revenue performance with daily trend, category mix, and top-selling items.",
      },
    ],
  }),
});

function WeekPage() {
  return (
    <RevenuePeriodView
      period="week"
      title="This week"
      description="Rolling 7-day window, today inclusive"
      icon={CalendarClock}
      trendLabel="Daily revenue · last 7 days"
      trendChart="bar"
    />
  );
}
