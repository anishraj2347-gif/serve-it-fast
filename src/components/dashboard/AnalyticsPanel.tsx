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
} from "recharts";
import { formatDuration, formatHourLabel } from "@/lib/format";
import { Timer, Truck, ShoppingBag, ThumbsUp, XCircle } from "lucide-react";
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
    <PanelShell eyebrow="Section II" title="Performance" hint="Service throughput">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border">
        <Kpi icon={<Timer className="size-3" />} label="Avg prep" value={formatDuration(avgPrep)} />
        <Kpi icon={<Truck className="size-3" />} label="Avg deliver" value={formatDuration(avgDelivery)} />
        <Kpi
          icon={<ThumbsUp className="size-3" />}
          label="Acceptance"
          value={`${acceptanceRate}%`}
          tone="good"
        />
        <Kpi
          icon={<XCircle className="size-3" />}
          label="Cancellation"
          value={`${cancellationRate}%`}
          tone={cancellationRate > 15 ? "bad" : undefined}
        />
        <Kpi
          icon={<ShoppingBag className="size-3" />}
          label="Total orders"
          value={String(total)}
          className="col-span-2"
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-baseline justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Today's flow
          </div>
          <div className="font-display text-xs italic text-muted-foreground">
            hourly volume
          </div>
        </div>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 5, right: 8, bottom: 0, left: -22 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)", fontFamily: "JetBrains Mono" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)", fontFamily: "JetBrains Mono" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-foreground)",
                  borderRadius: 2,
                  fontSize: 12,
                  fontFamily: "JetBrains Mono",
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: "var(--color-primary)", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
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
    <div className={`bg-card p-3 ${className ?? ""}`}>
      <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`mt-1 font-display text-xl font-semibold tabular-nums ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}
