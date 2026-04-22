import { Link } from "@tanstack/react-router";
import { CalendarDays, CalendarRange, CalendarClock } from "lucide-react";

const TABS = [
  { to: "/revenue/week", label: "This week", icon: CalendarClock },
  { to: "/revenue/mtd", label: "Month to date", icon: CalendarDays },
  { to: "/revenue/ytd", label: "Year to date", icon: CalendarRange },
] as const;

/** Sub-navigation for the Revenue section — switches between time-window pages. */
export function RevenueSubNav() {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1400px] items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-0.5 rounded-lg border border-border bg-surface-2/60 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className="group flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:shadow-xs"
              >
                <Icon className="size-3.5" strokeWidth={2.25} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
