import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Table as TableIcon,
  Activity,
  Receipt,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { useDashboard } from "@/store/useDashboard";
import { currency } from "@/lib/format";
import { PanelShell } from "./PanelShell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  categoryBreakdown,
  ranges,
  RevenueBucket,
  sumRange,
  topItems,
  dailyBucketsLast7,
  dailyBucketsMTD,
  monthlyBucketsYTD,
} from "@/lib/revenueAgg";

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

type Period = "week" | "mtd" | "ytd";

interface Props {
  period: Period;
  title: string;
  description: string;
  icon: LucideIcon;
  trendLabel: string;
  /** Use bar for week/mtd, area for ytd (looks smoother across months). */
  trendChart?: "bar" | "area";
}

export function RevenuePeriodView({
  period,
  title,
  description,
  icon: Icon,
  trendLabel,
  trendChart = "bar",
}: Props) {
  const orders = useDashboard((s) => s.orders);

  // Avoid SSR/CSR hydration mismatch — values depend on the wall clock.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = useMemo(() => {
    const r = ranges();
    let from: number;
    let to: number;
    let prevFrom: number;
    let prevTo: number;
    let buckets: RevenueBucket[];
    let avgLabel: string;

    if (period === "week") {
      from = r.week.from;
      to = r.week.to;
      prevFrom = r.prevWeek.from;
      prevTo = r.prevWeek.to;
      buckets = dailyBucketsLast7(orders);
      avgLabel = "per day";
    } else if (period === "mtd") {
      from = r.mtd.from;
      to = r.mtd.to;
      prevFrom = r.lastMonthSamePeriod.from;
      prevTo = r.lastMonthSamePeriod.to;
      buckets = dailyBucketsMTD(orders);
      avgLabel = "per day";
    } else {
      from = r.ytd.from;
      to = r.ytd.to;
      prevFrom = r.lastYearSamePeriod.from;
      prevTo = r.lastYearSamePeriod.to;
      buckets = monthlyBucketsYTD(orders);
      avgLabel = "per month";
    }

    const cur = sumRange(orders, from, to);
    const prev = sumRange(orders, prevFrom, prevTo);
    const cats = categoryBreakdown(orders, from, to);
    const items = topItems(orders, from, to, 8);

    const aov = cur.count > 0 ? cur.revenue / cur.count : 0;
    const avgPerBucket =
      buckets.length > 0
        ? buckets.reduce((s, b) => s + b.revenue, 0) / buckets.length
        : 0;
    const peak = buckets.reduce<RevenueBucket | null>(
      (best, b) => (!best || b.revenue > best.revenue ? b : best),
      null,
    );

    return {
      cur,
      prev,
      cats,
      items,
      buckets,
      aov,
      avgPerBucket,
      avgLabel,
      peak,
    };
  }, [orders, period, mounted]);

  const totalCat = data.cats.reduce((a, b) => a + b.revenue, 0);
  const delta =
    data.prev.revenue > 0
      ? ((data.cur.revenue - data.prev.revenue) / data.prev.revenue) * 100
      : 0;
  const up = delta >= 0;

  const compareLabel =
    period === "week"
      ? "vs. prior 7 days"
      : period === "mtd"
        ? "vs. last month (same period)"
        : "vs. last year (same period)";

  return (
    <div className="space-y-6">
      <PanelShell
        title={title}
        description={description}
        icon={<Icon className="size-4" strokeWidth={2.25} />}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Revenue"
            value={mounted ? currency(data.cur.revenue) : "—"}
            icon={<Receipt className="size-3.5" />}
            delta={mounted && data.prev.revenue > 0 ? delta : undefined}
            deltaLabel={compareLabel}
            accent
          />
          <Stat
            label="Orders"
            value={mounted ? data.cur.count.toLocaleString() : "—"}
            icon={<ShoppingBag className="size-3.5" />}
          />
          <Stat
            label="Avg. order value"
            value={mounted ? currency(data.aov) : "—"}
            icon={<Activity className="size-3.5" />}
          />
          <Stat
            label={`Avg. ${data.avgLabel}`}
            value={mounted ? currency(data.avgPerBucket) : "—"}
            icon={<TrendingUp className="size-3.5" />}
            sub={
              data.peak
                ? `Peak ${data.peak.label} · ${currency(data.peak.revenue)}`
                : undefined
            }
          />
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-3.5 text-primary" />
              <h3 className="text-sm font-semibold">{trendLabel}</h3>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">
              revenue trend
            </span>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              {trendChart === "area" ? (
                <AreaChart
                  data={data.buckets}
                  margin={{ top: 5, right: 4, bottom: 0, left: -10 }}
                >
                  <defs>
                    <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent-bold)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--color-accent-bold)" stopOpacity={0.02} />
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
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                      boxShadow: "var(--shadow-md)",
                    }}
                    formatter={(v) => currency(Number(v))}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-accent-bold)"
                    strokeWidth={2}
                    fill="url(#trendArea)"
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={data.buckets}
                  margin={{ top: 5, right: 4, bottom: 0, left: -10 }}
                >
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
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
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </PanelShell>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <PanelShell
            title="By category"
            description="Where the revenue is coming from"
            icon={<PieIcon className="size-4" strokeWidth={2.25} />}
          >
            <div className="flex items-center gap-5">
              <div className="relative h-[140px] w-[140px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.cats}
                      dataKey="revenue"
                      nameKey="name"
                      innerRadius={42}
                      outerRadius={66}
                      paddingAngle={2}
                      stroke="var(--color-card)"
                      strokeWidth={2}
                    >
                      {data.cats.map((_, i) => (
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
                      {mounted ? currency(totalCat) : "—"}
                    </div>
                  </div>
                </div>
              </div>
              <ul className="min-w-0 flex-1 space-y-2">
                {data.cats.map((c, i) => {
                  const pct = totalCat ? Math.round((c.revenue / totalCat) * 100) : 0;
                  return (
                    <li
                      key={c.name}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
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
                          {currency(c.revenue)}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </PanelShell>
        </div>

        <div className="lg:col-span-3">
          <PanelShell
            title="Top items"
            description="Best sellers in this window"
            icon={<TableIcon className="size-4" strokeWidth={2.25} />}
          >
            <div className="-mx-2 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wide">
                      Item
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wide">
                      Category
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide">
                      Qty
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide">
                      Revenue
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-6 text-center text-xs text-muted-foreground"
                      >
                        No orders in this window yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.items.map((it) => (
                      <TableRow key={it.name}>
                        <TableCell className="font-medium text-foreground">
                          {it.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {it.category}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {it.qty}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {currency(it.revenue)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </PanelShell>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  delta,
  deltaLabel,
  sub,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  delta?: number;
  deltaLabel?: string;
  sub?: string;
  accent?: boolean;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div
      className={`rounded-lg border p-3 ${
        accent
          ? "border-primary/20 bg-primary/5"
          : "border-border bg-surface-2/40"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 text-[11px] font-medium ${
          accent ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </div>
      {delta !== undefined && deltaLabel ? (
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span
            className={`inline-flex items-center gap-0.5 rounded-sm px-1 py-0.5 font-semibold tabular-nums ${
              up
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            {up ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {up ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
          <span>{deltaLabel}</span>
        </div>
      ) : sub ? (
        <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
      ) : null}
    </div>
  );
}
