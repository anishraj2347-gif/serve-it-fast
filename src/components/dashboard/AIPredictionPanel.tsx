import { useDashboard } from "@/store/useDashboard";
import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Lightbulb, Loader2, RefreshCw } from "lucide-react";
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

/**
 * Local heuristic "demand prediction" — analyses 7 days of hourly data
 * to find tomorrow's likely peak window and surface a prep tip.
 * (Pure client-side; no backend required.)
 */
function computePrediction(
  hourly: { date: string; hour: number; orderCount: number }[],
  topItems: string[],
): Prediction {
  // Average orders per hour-of-day across the past 7 days
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

  // Find best 3-hour rolling window
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
      ? `A pronounced rush is expected ${window}, running roughly ${intensity.toFixed(1)}× the daily average.`
      : intensity > 1.2
        ? `A moderate uptick is likely ${window}, about ${intensity.toFixed(1)}× the daily average — staff accordingly.`
        : `Service should stay relatively even tomorrow; mild bump near ${window}.`;

  const focus = topItems.slice(0, 2).join(" & ") || "high-prep dishes";
  const prep_tip = `Pre-stage mise en place for ${focus} 30 minutes before ${formatHourLabel(best.start)}, and queue an extra runner for the pass.`;

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
    // Tiny artificial delay for the "thinking" feel
    setTimeout(() => {
      setPrediction(computePrediction(hourly, topItems));
      setLoading(false);
    }, 350);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PanelShell
      eyebrow="Section I · Forecast"
      title="The Oracle"
      hint="Tomorrow's expected rush, learned from the week's pattern"
      action={
        <Button
          size="icon"
          variant="ghost"
          className="size-8 rounded-sm"
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
      {loading && !prediction && (
        <div className="grid place-items-center gap-2 rounded-sm border border-dashed border-border bg-paper p-6 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span className="font-display italic">Reading the week's pattern…</span>
        </div>
      )}

      {prediction && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-sm border border-foreground/90 bg-foreground p-5 text-background">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-background/70">
                <TrendingUp className="size-3" />
                Tomorrow's peak
              </div>
              <ConfidenceBadge level={prediction.confidence} />
            </div>
            <div className="font-display text-3xl font-bold tracking-tight tabular-nums">
              {formatHourLabel(prediction.start_hour)}
              <span className="text-background/50"> — </span>
              {formatHourLabel(prediction.end_hour)}
            </div>
            <p className="mt-2 font-display text-sm italic leading-relaxed text-background/85">
              {prediction.summary}
            </p>
          </div>

          <div className="rounded-sm border-l-4 border-primary bg-paper p-4">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              <Lightbulb className="size-3" />
              Chef's prep note
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
              {prediction.prep_tip}
            </p>
          </div>
        </div>
      )}
    </PanelShell>
  );
}

function ConfidenceBadge({ level }: { level: "low" | "medium" | "high" }) {
  return (
    <span className="rounded-sm border border-background/40 bg-background/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-background">
      {level} conf.
    </span>
  );
}
