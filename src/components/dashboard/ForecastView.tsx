import { useDashboard } from "@/store/useDashboard";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Lightbulb,
  Loader2,
  RefreshCw,
  Brain,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatHourLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PanelShell } from "./PanelShell";
import { useServerFn } from "@tanstack/react-start";
import { getAIForecast } from "@/utils/aiForecast.functions";

interface Prediction {
  start_hour: number;
  end_hour: number;
  summary: string;
  prep_tip: string;
}

export function ForecastView() {
  const hourly = useDashboard((s) => s.hourly);
  const menu = useDashboard((s) => s.menu);

  const aggregated = useMemo(() => {
    const buckets: Record<number, number[]> = {};
    for (const h of hourly) {
      if (!buckets[h.hour]) buckets[h.hour] = [];
      buckets[h.hour].push(h.orderCount);
    }
    const rows = Object.entries(buckets)
      .map(([h, arr]) => {
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        const peak = Math.max(...arr);
        return {
          hour: Number(h),
          label: formatHourLabel(Number(h)),
          avgOrders: Math.round(avg * 10) / 10,
          peakOrders: peak,
          samples: arr.length,
        };
      })
      .sort((a, b) => a.hour - b.hour);
    return rows;
  }, [hourly]);

  const weekly = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of hourly) {
      map[h.date] = (map[h.date] || 0) + h.orderCount;
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, orders]) => {
        const d = new Date(date + "T00:00:00");
        return {
          date,
          label: d.toLocaleDateString("en-US", { weekday: "short" }),
          orders,
        };
      });
  }, [hourly]);

  const peakAvg = useMemo(
    () => Math.max(0, ...aggregated.map((r) => r.avgOrders)),
    [aggregated],
  );

  const topItems = useMemo(
    () =>
      [...menu]
        .filter((m) => m.isAvailable)
        .sort((a, b) => b.prepTimeEstimate - a.prepTimeEstimate)
        .slice(0, 5)
        .map((m) => m.name),
    [menu],
  );

  const callForecast = useServerFn(getAIForecast);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    setAiError(null);
    try {
      const result = await callForecast({
        data: {
          payload: {
            hourlyCounts: aggregated.map((r) => ({
              hour: r.hour,
              avgOrders: r.avgOrders,
            })),
            topItems,
          },
        },
      });
      if (result.error) {
        setAiError(result.error);
        setPrediction(null);
      } else if (result.prediction) {
        setPrediction(result.prediction);
      }
    } catch (e) {
      setAiError(
        e instanceof Error ? e.message : "Failed to generate forecast.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* AI prediction — full width */}
      <div className="lg:col-span-3">
        <PanelShell
          title="AI order predictor"
          description="Tomorrow's busiest 2-hour window, generated from 7 days of data"
          icon={<Brain className="size-4" strokeWidth={2.25} />}
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={refresh}
              disabled={loading}
              className="gap-1.5"
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              {loading ? "Predicting…" : "Re-predict"}
            </Button>
          }
        >
          {loading && !prediction ? (
            <div className="grid place-items-center gap-2 rounded-lg border border-dashed border-border bg-surface-2/40 p-10 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span>Analyzing 7 days of order data with AI…</span>
            </div>
          ) : aiError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {aiError}
            </div>
          ) : prediction ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.18_265)] p-6 text-primary-foreground shadow-sm">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-primary-foreground/85">
                  <TrendingUp className="size-3.5" />
                  Predicted peak window
                </div>
                <div className="text-4xl font-semibold tracking-tight tabular-nums">
                  {formatHourLabel(prediction.start_hour)}
                  <span className="text-primary-foreground/50"> → </span>
                  {formatHourLabel(prediction.end_hour)}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/90">
                  {prediction.summary}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-2/40 p-6">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-primary">
                  <Lightbulb className="size-3.5" />
                  Preparation tip
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {prediction.prep_tip}
                </p>
                <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <Sparkles className="size-3" />
                  Generated by Lovable AI · {topItems.length} top items considered
                </div>
              </div>
            </div>
          ) : null}
        </PanelShell>
      </div>

      {/* Hourly bar chart */}
      <div className="lg:col-span-2">
        <PanelShell
          title="Average orders by hour"
          description="7-day rolling average — peak hours highlighted"
          icon={<TrendingUp className="size-4" strokeWidth={2.25} />}
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={aggregated}
                margin={{ top: 5, right: 8, bottom: 0, left: -22 }}
              >
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={1}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-accent)", opacity: 0.4 }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: "var(--shadow-md)",
                  }}
                />
                <Bar dataKey="avgOrders" radius={[4, 4, 0, 0]}>
                  {aggregated.map((r) => {
                    const intensity = peakAvg ? r.avgOrders / peakAvg : 0;
                    const isPeak = intensity > 0.8;
                    return (
                      <Cell
                        key={r.hour}
                        fill={
                          isPeak
                            ? "var(--color-primary)"
                            : "color-mix(in oklab, var(--color-primary) 35%, transparent)"
                        }
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelShell>
      </div>

      {/* 7-day trend line */}
      <div>
        <PanelShell
          title="7-day volume"
          description="Daily order totals"
          icon={<TrendingUp className="size-4" strokeWidth={2.25} />}
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weekly}
                margin={{ top: 5, right: 8, bottom: 0, left: -22 }}
              >
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
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
                  cursor={{ stroke: "var(--color-border)" }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: "var(--shadow-md)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="var(--color-primary)"
                  strokeWidth={2.25}
                  dot={{
                    r: 3,
                    strokeWidth: 2,
                    fill: "var(--color-background)",
                    stroke: "var(--color-primary)",
                  }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PanelShell>
      </div>

      {/* Hourly table */}
      <div className="lg:col-span-3">
        <PanelShell
          title="Hourly demand breakdown"
          description="Avg, peak, and intensity per hour over 7 days"
          icon={<TrendingUp className="size-4" strokeWidth={2.25} />}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hour</TableHead>
                  <TableHead className="text-right">Avg orders</TableHead>
                  <TableHead className="text-right">Peak</TableHead>
                  <TableHead className="w-[40%]">Intensity</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregated.map((r) => {
                  const intensity = peakAvg ? r.avgOrders / peakAvg : 0;
                  const pct = Math.round(intensity * 100);
                  const isPeak = intensity > 0.8;
                  const isQuiet = intensity < 0.25;
                  return (
                    <TableRow key={r.hour}>
                      <TableCell className="font-medium tabular-nums">
                        {r.label}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.avgOrders.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {r.peakOrders}
                      </TableCell>
                      <TableCell>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: isPeak
                                ? "var(--color-primary)"
                                : "color-mix(in oklab, var(--color-primary) 50%, transparent)",
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            isPeak
                              ? "bg-primary/15 text-primary"
                              : isQuiet
                                ? "bg-muted text-muted-foreground"
                                : "bg-accent text-accent-foreground"
                          }`}
                        >
                          {isPeak ? "Peak" : isQuiet ? "Quiet" : "Steady"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </PanelShell>
      </div>
    </div>
  );
}
