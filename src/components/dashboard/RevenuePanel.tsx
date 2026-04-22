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
import { Wallet, TrendingUp, PieChart as PieIcon } from "lucide-react";
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
      const key = d.toLocaleDateString("en-US", { weekday: "short" });
      days[key] = (days[key] || 0) + o.totalAmount;
    }

    const order7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { weekday: "short" });
      order7.push({ day: key, revenue: Math.round((days[key] || 0) * 100) / 100 });
    }

    const byCategory = Object.entries(cats).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));
    return { today, week, byCategory, byDay: order7 };
  }, [orders]);

  const totalCat = byCategory.reduce((a, b) => a + b.value, 0);

  return (
    <PanelShell
      title="Revenue"
      description="Today, this week, and category mix"
      icon={<Wallet className="size-4" strokeWidth={2.25} />}
    >
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Today" value={currency(today)} accent />
        <Stat label="This week" value={currency(week)} />
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-3.5 text-primary" />
            <h3 className="text-sm font-semibold">Last 7 days</h3>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            daily revenue
          </span>
        </div>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDay} margin={{ top: 5, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
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
                cursor={{ fill: "var(--color-accent)" }}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "var(--shadow-md)",
                }}
                formatter={(v) => currency(Number(v))}
              />
              <Bar dataKey="revenue" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <div className="mb-3 flex items-center gap-2">
          <PieIcon className="size-3.5 text-primary" />
          <h3 className="text-sm font-semibold">By category</h3>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative h-[120px] w-[120px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={36}
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
                  formatter={(v) => currency(Number(v))}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: "var(--shadow-md)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-[10px] font-medium text-muted-foreground">
                  Total
                </div>
                <div className="text-xs font-semibold tabular-nums">
                  {currency(totalCat)}
                </div>
              </div>
            </div>
          </div>
          <ul className="min-w-0 flex-1 space-y-2">
            {byCategory.map((c, i) => {
              const pct = totalCat ? Math.round((c.value / totalCat) * 100) : 0;
              return (
                <li key={c.name} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-sm"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="truncate font-medium text-foreground">
                      {c.name}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="tabular-nums">{pct}%</span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {currency(c.value)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </PanelShell>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        accent
          ? "border-primary/20 bg-primary/5"
          : "border-border bg-surface-2/40"
      }`}
    >
      <div
        className={`text-[11px] font-medium ${
          accent ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </div>
    </div>
  );
}
