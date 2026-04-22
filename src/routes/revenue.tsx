import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PageHero } from "@/components/dashboard/PageHero";
import { PageShell } from "@/components/dashboard/PageShell";
import { RevenueSubNav } from "@/components/dashboard/RevenueSubNav";

export const Route = createFileRoute("/revenue")({
  component: RevenueLayout,
  beforeLoad: ({ location }) => {
    if (location.pathname === "/revenue") {
      throw redirect({ to: "/revenue/week" });
    }
  },
  head: () => ({
    meta: [
      { title: "Revenue · Bella Cucina" },
      {
        name: "description",
        content:
          "Revenue analytics — switch between this week, month-to-date, and year-to-date views with category mix, top items, and trends.",
      },
      { property: "og:title", content: "Revenue · Bella Cucina" },
      {
        property: "og:description",
        content: "This week, MTD, and YTD revenue with category and item breakdowns.",
      },
    ],
  }),
});

function RevenueLayout() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Financial overview"
        title="Revenue"
        lede="Three lenses on the same numbers — a rolling week for short-term momentum, month-to-date for the current cycle, and year-to-date for the bigger picture."
        meta="This week · Month to date · Year to date"
      />
      <RevenueSubNav />
      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </PageShell>
  );
}
