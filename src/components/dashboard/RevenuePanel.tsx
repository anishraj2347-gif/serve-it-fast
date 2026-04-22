import { useDashboard } from "@/store/useDashboard";
import { useEffect, useMemo, useState } from "react";
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
  AreaChart,
  Area,
} from "recharts";
import { currency } from "@/lib/format";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { PanelShell } from "./PanelShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order } from "@/types";

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

// ===== Period definitions =====

type DayPeriod = "today" | "yesterday" | "last7";
type MonthPeriod = "mtd" | "lastMonth" | "last3";
type YearPeriod = "ytd" | "lastYear" | "last2y";

const DAY_OPTIONS: { value: DayPeriod; label: string; compareLabel: string }[] = [
  { value: "today", label: "Today", compareLabel: "vs. yesterday" },
  { value: "yesterday", label: "Yesterday", compareLabel: "vs. day before" },
  { value: "last7", label: "Last 7 days", compareLabel: "vs. prior 7 days" },
];

const MONTH_OPTIONS: { value: MonthPeriod; label: string; compareLabel: string }[] = [
  { value: "mtd", label: "Month to date", compareLabel: "vs. last month" },
  { value: "lastMonth", label: "Last month", compareLabel: "vs. prior month" },
  { value: "last3", label: "Last 3 months", compareLabel: "vs. prior 3 months" },
];

const YEAR_OPTIONS: { value: YearPeriod; label: string; compareLabel: string }[] = [
  { value: "ytd", label: "Year to date", compareLabel: "vs. last year" },
  { value: "lastYear", label: "Last year", compareLabel: "vs. 2 years ago" },
  { value: "last2y", label: "Last 2 years", compareLabel: "vs. prior 2 years" },
];

// Sums delivered/non-cancelled order revenue between [from, to)
function sumRange(orders: Order[], from: number, to: number) {
  let sum = 0;
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    if (o.createdAt >= from && o.createdAt < to) sum += o.totalAmount;
  }
  return sum;
}

function dayRange(orders: Order[], period: DayPeriod) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;

  switch (period) {
    case "today": {
      const cur = sumRange(orders, startOfToday.getTime(), startOfToday.getTime() + dayMs);
      const prev = sumRange(orders, startOfToday.getTime() - dayMs, startOfToday.getTime());
      return { current: cur, compare: prev };
    }
    case "yesterday": {
      const cur = sumRange(orders, startOfToday.getTime() - dayMs, startOfToday.getTime());
      const prev = sumRange(orders, startOfToday.getTime() - 2 * dayMs, startOfToday.getTime() - dayMs);
      return { current: cur, compare: prev };
    }
    case "last7": {
      const cur = sumRange(orders, startOfToday.getTime() - 7 * dayMs, startOfToday.getTime() + dayMs);
      const prev = sumRange(orders, startOfToday.getTime() - 14 * dayMs, startOfToday.getTime() - 7 * dayMs);
      return { current: cur, compare: prev };
    }
  }
}

function monthRange(orders: Order[], period: MonthPeriod) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfPrev2 = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const startOfPrev3 = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const startOfPrev6 = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  switch (period) {
    case "mtd": {
      const cur = sumRange(orders, startOfMonth.getTime(), now.getTime());
      const lastMonthCutoff = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
      );
      const prev = sumRange(orders, startOfLastMonth.getTime(), lastMonthCutoff.getTime());
      return { current: cur, compare: prev };
    }
    case "lastMonth": {
      const cur = sumRange(orders, startOfLastMonth.getTime(), startOfMonth.getTime());
      const prev = sumRange(orders, startOfPrev2.getTime(), startOfLastMonth.getTime());
      return { current: cur, compare: prev };
    }
    case "last3": {
      const cur = sumRange(orders, startOfPrev3.getTime(), now.getTime());
      const prev = sumRange(orders, startOfPrev6.getTime(), startOfPrev3.getTime());
      return { current: cur, compare: prev };
    }
  }
}

function yearRange(orders: Order[], period: YearPeriod) {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
  const startOf2Ago = new Date(now.getFullYear() - 2, 0, 1);
  const startOf3Ago = new Date(now.getFullYear() - 3, 0, 1);

  switch (period) {
    case "ytd": {
      const cur = sumRange(orders, startOfYear.getTime(), now.getTime());
      const lastYearCutoff = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
      );
      const prev = sumRange(orders, startOfLastYear.getTime(), lastYearCutoff.getTime());
      return { current: cur, compare: prev };
    }
    case "lastYear": {
      const cur = sumRange(orders, startOfLastYear.getTime(), startOfYear.getTime());
      const prev = sumRange(orders, startOf2Ago.getTime(), startOfLastYear.getTime());
      return { current: cur, compare: prev };
    }
    case "last2y": {
      const cur = sumRange(orders, startOf2Ago.getTime(), now.getTime());
      const prev = sumRange(orders, startOf3Ago.getTime(), startOf2Ago.getTime());
      return { current: cur, compare: prev };
    }
  }
}

export function RevenuePanel() {
  const orders = useDashboard((s) => s.orders);

  // Avoid SSR/CSR hydration mismatch — values depend on the current wall clock.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [dayPeriod, setDayPeriod] = useState<DayPeriod>("today");
  const [monthPeriod, setMonthPeriod] = useState<MonthPeriod>("mtd");
  const [yearPeriod, setYearPeriod] = useState<YearPeriod>("ytd");

  const dayStat = useMemo(() => dayRange(orders, dayPeriod), [orders, dayPeriod, mounted]);
  const monthStat = useMemo(() => monthRange(orders, monthPeriod), [orders, monthPeriod, mounted]);
  const yearStat = useMemo(() => yearRange(orders, yearPeriod), [orders, yearPeriod, mounted]);

  const { byCategory, byDay, monthDaily } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000;

    const cats: Record<string, number> = {};
    const last7: Record<string, number> = {};
    const monthMap: Record<string, number> = {};

    for (const o of orders) {
      if (o.status === "cancelled") continue;
      const t = o.createdAt;

      if (t >= startOfMonth.getTime()) {
        for (const it of o.items) {
          const c = it.category || "Other";
          cats[c] = (cats[c] || 0) + it.price * it.qty;
        }
      }

      if (t >= sevenDaysAgo) {
        const d = new Date(t);
        const key = d.toLocaleDateString("en-US", { weekday: "short" });
        last7[key] = (last7[key] || 0) + o.totalAmount;
      }

      if (t >= startOfMonth.getTime()) {
        const d = new Date(t);
        const dayKey = String(d.getDate()).padStart(2, "0");
        monthMap[dayKey] = (monthMap[dayKey] || 0) + o.totalAmount;
      }
    }

    const order7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { weekday: "short" });
      order7.push({ day: key, revenue: Math.round((last7[key] || 0) * 100) / 100 });
    }

    const monthDaily = [];
    for (let day = 1; day <= now.getDate(); day++) {
      const k = String(day).padStart(2, "0");
      monthDaily.push({ day: k, revenue: Math.round((monthMap[k] || 0) * 100) / 100 });
    }

    const byCategory = Object.entries(cats)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);

    return { byCategory, byDay: order7, monthDaily };
  }, [orders, mounted]);

  const totalCat = byCategory.reduce((a, b) => a + b.value, 0);

  const dayOpt = DAY_OPTIONS.find((o) => o.value === dayPeriod)!;
  const monthOpt = MONTH_OPTIONS.find((o) => o.value === monthPeriod)!;
  const yearOpt = YEAR_OPTIONS.find((o) => o.value === yearPeriod)!;

  return (
    <PanelShell
      title="Revenue"
      description="Today, month-to-date, and year-to-date"
      icon={<Wallet className="size-4" strokeWidth={2.25} />}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Wallet className="size-3.5" />}
          accent
          value={mounted ? currency(dayStat.current) : "—"}
          compare={mounted ? dayStat.compare : 0}
          current={mounted ? dayStat.current : 0}
          compareLabel={dayOpt.compareLabel}
          period={dayPeriod}
          onPeriodChange={(v) => setDayPeriod(v as DayPeriod)}
          options={DAY_OPTIONS}
        />
        <StatCard
          icon={<CalendarDays className="size-3.5" />}
          value={mounted ? currency(monthStat.current) : "—"}
          compare={mounted ? monthStat.compare : 0}
          current={mounted ? monthStat.current : 0}
          compareLabel={monthOpt.compareLabel}
          period={monthPeriod}
          onPeriodChange={(v) => setMonthPeriod(v as MonthPeriod)}
          options={MONTH_OPTIONS}
        />
        <StatCard
          icon={<CalendarRange className="size-3.5" />}
          value={mounted ? currency(yearStat.current) : "—"}
          compare={mounted ? yearStat.compare : 0}
          current={mounted ? yearStat.current : 0}
          compareLabel={yearOpt.compareLabel}
          period={yearPeriod}
          onPeriodChange={(v) => setYearPeriod(v as YearPeriod)}
          options={YEAR_OPTIONS}
        />
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
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-accent-bold" />
            <h3 className="text-sm font-semibold">Month to date</h3>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            cumulative shape
          </span>
        </div>
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthDaily} margin={{ top: 5, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent-bold)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--color-accent-bold)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
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
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "var(--shadow-md)",
                }}
                formatter={(v) => currency(Number(v))}
                labelFormatter={(l) => `Day ${l}`}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-accent-bold)"
                strokeWidth={2}
                fill="url(#revArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <div className="mb-3 flex items-center gap-2">
          <PieIcon className="size-3.5 text-primary" />
          <h3 className="text-sm font-semibold">By category · MTD</h3>
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

function StatCard({
  value,
  compare,
  current,
  compareLabel,
  icon,
  accent,
  period,
  onPeriodChange,
  options,
}: {
  value: string;
  compare: number;
  current: number;
  compareLabel: string;
  icon: React.ReactNode;
  accent?: boolean;
  period: string;
  onPeriodChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const delta = compare > 0 ? ((current - compare) / compare) * 100 : 0;
  const up = delta >= 0;
  const showDelta = compare > 0;

  return (
    <div
      className={`rounded-lg border p-3 ${
        accent
          ? "border-primary/20 bg-primary/5"
          : "border-border bg-surface-2/40"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          className={`flex items-center gap-1.5 text-[11px] font-medium ${
            accent ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {icon}
          <span className="uppercase tracking-wide">Period</span>
        </div>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger
            className={`h-6 gap-1 px-1.5 text-[11px] font-semibold shadow-none ${
              accent
                ? "border-primary/30 bg-background/60 text-primary hover:bg-background/90"
                : "border-border bg-background/60"
            }`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {showDelta ? (
          <>
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
            <span>{compareLabel}</span>
          </>
        ) : (
          <span>{compareLabel}</span>
        )}
      </div>
    </div>
  );
}
