import { useDashboard } from "@/store/useDashboard";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { currency } from "@/lib/format";
import { PanelShell } from "./PanelShell";

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function RevenuePanel() {
  const orders = useDashboard((s) => s.orders);

  const { today, week, byCategory, byDay } = useMemo(() => {
    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    let today = 0,
      week = 0;
    const cats: Record<string, number> = {};
    const days: Record<string, number> = {};

    for (const o of orders) {
      if (o.status === "cancelled") continue;
      if (o.createdAt >= startOfDay.getTime()) today += o.totalAmount;
      if (o.createdAt >= weekAgo) week += o.totalAmount;
      for (const it of o.items) {
        const c = it.category || "Other";
        cats[c] = (cats[c] || 0) + it.price * it.qty;
      }
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString([], { weekday: "short" });
      days[key] = (days[key] || 0) + o.totalAmount;
    }

    const order7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString([], { weekday: "short" });
      order7.push({ day: key, revenue: Math.round((days[key] || 0) * 100) / 100 });
    }

    const byCategory = Object.entries(cats).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));
    return { today, week, byCategory, byDay: order7 };
  }, [orders]);

  return (
    <PanelShell eyebrow="Section III" title="The Books" hint="Daily ledger & category mix">
      <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border">
        <RevCard label="Today" value={currency(today)} accent />
        <RevCard label="This week" value={currency(week)} />
      </div>

      <div className="mb-5">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Revenue · last 7 days
        </div>
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDay} margin={{ top: 5, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="day"
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
                formatter={(v: number) => currency(v)}
              />
              <Bar dataKey="revenue" fill="var(--color-primary)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Mix by category
        </div>
        <div className="flex items-center gap-4">
          <div className="h-[120px] w-[120px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={32}
                  outerRadius={56}
                  paddingAngle={2}
                  stroke="var(--color-card)"
                  strokeWidth={2}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => currency(v)}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-foreground)",
                    borderRadius: 2,
                    fontSize: 12,
                    fontFamily: "JetBrains Mono",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="min-w-0 flex-1 space-y-1.5">
            {byCategory.map((c, i) => (
              <li
                key={c.name}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-sm"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="truncate text-foreground/90">{c.name}</span>
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {currency(c.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PanelShell>
  );
}

function RevCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`p-3 ${accent ? "bg-foreground text-background" : "bg-card"}`}>
      <div
        className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
          accent ? "text-background/70" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold tabular-nums">
        {value}
      </div>
    </div>
  );
}
