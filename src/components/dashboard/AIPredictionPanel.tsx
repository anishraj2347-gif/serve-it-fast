import { useDashboard } from "@/store/useDashboard";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Lightbulb,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { formatHourLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PanelShell } from "./PanelShell";

interface Prediction {
  start_hour: number;
  end_hour: number;
  summary: string;
  prep_tip: string;
  confidence: "low" | "medium" | "high";
}

function computePrediction(
  hourly: { date: string; hour: number; orderCount: number }[],
  topItems: string[],
): Prediction {
  const buckets: Record<number, number[]> = {};
  for (const h of hourly) {
    if (!buckets[h.hour]) buckets[h.hour] = [];
    buckets[h.hour].push(h.orderCount);
  }
  const avg: { hour: number; avg: number }[] = Object.entries(buckets).map(
    ([h, arr]) => ({
      hour: Number(h),
      avg: arr.reduce((a, b) => a + b, 0) / arr.length,
    }),
  );
  avg.sort((a, b) => a.hour - b.hour);

  let best = { start: avg[0]?.hour ?? 12, sum: -Infinity };
  for (let i = 0; i < avg.length - 2; i++) {
    const sum = avg[i].avg + avg[i + 1].avg + avg[i + 2].avg;
    if (sum > best.sum) best = { start: avg[i].hour, sum };
  }
  const peak = avg.find((x) => x.hour === best.start)?.avg ?? 0;
  const overall = avg.reduce((a, b) => a + b.avg, 0) / Math.max(1, avg.length);
  const intensity = peak / Math.max(1, overall);

  const confidence: Prediction["confidence"] =
    avg.length >= 10 && intensity > 1.6 ? "high" : intensity > 1.2 ? "medium" : "low";

  const window = `${formatHourLabel(best.start)}–${formatHourLabel(best.start + 3)}`;
  const summary =
    intensity > 1.6
      ? `Significant rush expected ${window}, roughly ${intensity.toFixed(1)}× the daily average volume.`
      : intensity > 1.2
        ? `Moderate uptick likely ${window}, about ${intensity.toFixed(1)}× the daily average — staff accordingly.`
        : `Service should remain steady tomorrow with a mild bump near ${window}.`;

  const focus = topItems.slice(0, 2).join(" and ") || "high-prep dishes";
  const prep_tip = `Pre-stage mise en place for ${focus} 30 minutes before ${formatHourLabel(best.start)} and add an extra runner during the window.`;

  return {
    start_hour: best.start,
    end_hour: Math.min(23, best.start + 3),
    summary,
    prep_tip,
    confidence,
  };
}

export function AIPredictionPanel() {
  const hourly = useDashboard((s) => s.hourly);
  const menu = useDashboard((s) => s.menu);

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);

  const topItems = useMemo(
    () =>
      [...menu]
        .filter((m) => m.isAvailable)
        .sort((a, b) => b.prepTimeEstimate - a.prepTimeEstimate)
        .slice(0, 5)
        .map((m) => m.name),
    [menu],
  );

  function refresh() {
    setLoading(true);
    setTimeout(() => {
      setPrediction(computePrediction(hourly, topItems));
      setLoading(false);
    }, 300);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PanelShell
      title="Demand forecast"
      description="Tomorrow's expected peak window"
      icon={<Sparkles className="size-4" strokeWidth={2.25} />}
      action={
        <Button
          size="icon"
          variant="ghost"
          className="size-8"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh prediction"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
        </Button>
      }
    >
      {loading && !prediction ? (
        <div className="grid place-items-center gap-2 rounded-lg border border-dashed border-border bg-surface-2/40 p-8 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span>Analyzing 7 days of order data…</span>
        </div>
      ) : prediction ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.18_265)] p-5 text-primary-foreground shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-primary-foreground/85">
                <TrendingUp className="size-3.5" />
                Peak window
              </div>
              <ConfidenceBadge level={prediction.confidence} />
            </div>
            <div className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatHourLabel(prediction.start_hour)}
              <span className="text-primary-foreground/50"> → </span>
              {formatHourLabel(prediction.end_hour)}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/90">
              {prediction.summary}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface-2/40 p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-primary">
              <Lightbulb className="size-3.5" />
              Prep recommendation
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
              {prediction.prep_tip}
            </p>
          </div>
        </div>
      ) : null}
    </PanelShell>
  );
}

function ConfidenceBadge({ level }: { level: "low" | "medium" | "high" }) {
  return (
    <span className="rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
      {level} confidence
    </span>
  );
}
