import { useDashboard } from "@/store/useDashboard";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { formatDuration, formatHourLabel } from "@/lib/format";
import {
  Timer,
  Truck,
  ShoppingBag,
  ThumbsUp,
  XCircle,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { PanelShell } from "./PanelShell";

export function AnalyticsPanel() {
  const orders = useDashboard((s) => s.orders);
  const hourly = useDashboard((s) => s.hourly);

  const { avgPrep, avgDelivery, total, acceptanceRate, cancellationRate } =
    useMemo(() => {
      let prepSum = 0,
        prepN = 0,
        delSum = 0,
        delN = 0;
      let accepted = 0,
        cancelled = 0,
        decided = 0;
      for (const o of orders) {
        if (o.prepStartTime && o.readyTime) {
          prepSum += (o.readyTime - o.prepStartTime) / 1000;
          prepN++;
        }
        if (o.readyTime && o.deliveredTime) {
          delSum += (o.deliveredTime - o.readyTime) / 1000;
          delN++;
        }
        if (o.status === "cancelled") {
          cancelled++;
          decided++;
        } else if (o.status !== "new") {
          accepted++;
          decided++;
        }
      }
      return {
        avgPrep: prepN ? prepSum / prepN : 0,
        avgDelivery: delN ? delSum / delN : 0,
        total: orders.length,
        acceptanceRate: decided ? Math.round((accepted / decided) * 100) : 0,
        cancellationRate: decided ? Math.round((cancelled / decided) * 100) : 0,
      };
    }, [orders]);

  const trend = useMemo(() => {
    const today = hourly[hourly.length - 1]?.date;
    return hourly
      .filter((h) => h.date === today)
      .map((h) => ({ label: formatHourLabel(h.hour), orders: h.orderCount }));
  }, [hourly]);

  return (
    <PanelShell
      title="Service performance"
      description="Throughput, timing, and acceptance"
      icon={<BarChart3 className="size-4" strokeWidth={2.25} />}
    >
      <div className="grid grid-cols-2 gap-3">
        <Kpi icon={<Timer className="size-3.5" />} label="Avg prep" value={formatDuration(avgPrep)} />
        <Kpi icon={<Truck className="size-3.5" />} label="Avg deliver" value={formatDuration(avgDelivery)} />
        <Kpi
          icon={<ThumbsUp className="size-3.5" />}
          label="Acceptance"
          value={`${acceptanceRate}%`}
          tone="good"
        />
        <Kpi
          icon={<XCircle className="size-3.5" />}
          label="Cancellation"
          value={`${cancellationRate}%`}
          tone={cancellationRate > 15 ? "bad" : undefined}
        />
        <Kpi
          icon={<ShoppingBag className="size-3.5" />}
          label="Total orders"
          value={String(total)}
          className="col-span-2"
        />
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-3.5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Today's volume</h3>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            orders per hour
          </span>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 5, right: 8, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "var(--shadow-md)",
                }}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#areaFill)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "var(--color-primary)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PanelShell>
  );
}

function Kpi({
  icon,
  label,
  value,
  className,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
  tone?: "good" | "bad";
}) {
  const toneClass =
    tone === "good"
      ? "text-status-ready"
      : tone === "bad"
        ? "text-status-delayed"
        : "text-foreground";
  return (
    <div className={`rounded-lg border border-border bg-surface-2/40 p-3 ${className ?? ""}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`mt-1 text-xl font-semibold tabular-nums tracking-tight ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}

// Keep LineChart import to avoid TS6133 unused warning if recharts re-exports change.
void LineChart;
