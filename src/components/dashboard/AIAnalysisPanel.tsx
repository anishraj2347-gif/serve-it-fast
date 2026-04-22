import { useState } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { useDashboard } from "@/store/useDashboard";
import { buildAnalysisPayload } from "@/lib/buildAnalysisPayload";
import { getAIInsights, type AIInsight } from "@/utils/aiInsights.functions";
import { useServerFn } from "@tanstack/react-start";
import { PanelShell } from "./PanelShell";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Which menu items are driving the most revenue?",
  "How is order volume changing throughout the day?",
  "Where are we losing time — prep or delivery?",
  "What's our category mix and which is strongest?",
  "Which orders are delayed and why?",
  "Compare this week's daily volume.",
];

const PIE_COLORS = [
  "var(--color-primary)",
  "var(--color-status-ready)",
  "var(--color-status-preparing)",
  "var(--color-status-new)",
  "var(--color-status-delayed)",
  "var(--color-status-delivered)",
  "var(--color-status-cancelled)",
];

export function AIAnalysisPanel() {
  const orders = useDashboard((s) => s.orders);
  const hourly = useDashboard((s) => s.hourly);
  const restaurantName = useDashboard((s) => s.restaurantName);
  const fetchInsights = useServerFn(getAIInsights);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    setInsight(null);
    setActiveQuestion(trimmed);

    try {
      const payload = buildAnalysisPayload({
        question: trimmed,
        restaurantName,
        orders,
        hourly,
      });
      const result = await fetchInsights({ data: { payload } });
      if (result.error) {
        setError(result.error);
      } else {
        setInsight(result.insight);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch insight.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void ask(question);
  }

  return (
    <PanelShell
      title="AI Insights"
      description="Ask anything about service, revenue, prep time or menu performance"
      icon={<Sparkles className="size-4" strokeWidth={2.25} />}
    >
      {/* Input row */}
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Which items are driving the most revenue?"
            disabled={loading}
            className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 pr-10 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            maxLength={500}
          />
          <Sparkles className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
        </div>
        <Button
          type="submit"
          disabled={loading || question.trim().length === 0}
          className="h-10 gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Thinking…
            </>
          ) : (
            <>
              <Send className="size-4" /> Analyze
            </>
          )}
        </Button>
      </form>

      {/* Suggestions */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Lightbulb className="size-3" /> Try:
        </span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuestion(s);
              void ask(s);
            }}
            disabled={loading}
            className="rounded-full border border-border bg-surface-2/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Result area */}
      <div className="mt-5">
        {!insight && !loading && !error && (
          <div className="rounded-xl border border-dashed border-border bg-surface-2/30 px-5 py-10 text-center">
            <TrendingUp className="mx-auto size-6 text-muted-foreground/60" />
            <p className="mt-2 text-sm font-medium text-foreground">
              Ask a question to see live analysis
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              The AI will return a summary, a data table and a chart.
            </p>
          </div>
        )}

        {loading && <LoadingState question={activeQuestion} />}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-status-delayed/30 bg-status-delayed-soft px-4 py-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-status-delayed" />
            <div className="text-sm">
              <div className="font-medium text-status-delayed">
                Couldn't generate insight
              </div>
              <div className="mt-0.5 text-xs text-foreground/80">{error}</div>
            </div>
          </div>
        )}

        {insight && !loading && (
          <InsightView insight={insight} question={activeQuestion} />
        )}
      </div>
    </PanelShell>
  );
}

function LoadingState({ question }: { question: string | null }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span className="text-sm font-medium text-foreground">
          Analyzing your data…
        </span>
      </div>
      {question && (
        <p className="text-xs italic text-muted-foreground">"{question}"</p>
      )}
      <div className="mt-4 space-y-2">
        <div className="h-3 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="mt-5 h-[180px] animate-pulse rounded-lg bg-surface-2" />
    </div>
  );
}

function InsightView({
  insight,
  question,
}: {
  insight: AIInsight;
  question: string | null;
}) {
  return (
    <div className="space-y-4">
      {/* Headline & summary */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5">
        {question && (
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-primary/80">
            Q: {question}
          </div>
        )}
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {insight.headline}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
          {insight.summary}
        </p>
        {insight.highlights?.length > 0 && (
          <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {insight.highlights.map((h, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-foreground/85"
              >
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          {insight.chart.title}
        </h4>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartRenderer chart={insight.chart} />
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          {insight.table.title}
        </h4>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {insight.table.columns.map((c, i) => (
                  <TableHead
                    key={i}
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                      i > 0 && "text-right",
                    )}
                  >
                    {c}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {insight.table.rows.map((row, ri) => (
                <TableRow key={ri} className="text-sm">
                  {row.map((cell, ci) => (
                    <TableCell
                      key={ci}
                      className={cn(
                        "py-2.5",
                        ci === 0
                          ? "font-medium text-foreground"
                          : "text-right tabular-nums text-muted-foreground",
                      )}
                    >
                      {typeof cell === "number" && ci > 0
                        ? formatCell(cell)
                        : String(cell)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function ChartRenderer({ chart }: { chart: AIInsight["chart"] }) {
  const tooltipStyle = {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    fontSize: 12,
    boxShadow: "var(--shadow-md)",
  };
  const axisTick = {
    fontSize: 11,
    fill: "var(--color-muted-foreground)",
  };

  if (chart.type === "pie") {
    const valueKey = chart.yKeys[0] ?? "value";
    return (
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          verticalAlign="bottom"
          height={28}
          wrapperStyle={{ fontSize: 11 }}
        />
        <Pie
          data={chart.data}
          dataKey={valueKey}
          nameKey={chart.xKey}
          cx="50%"
          cy="45%"
          outerRadius={90}
          innerRadius={45}
          paddingAngle={2}
        >
          {chart.data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  }

  if (chart.type === "line") {
    return (
      <LineChart data={chart.data} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={chart.xKey} tick={axisTick} tickLine={false} axisLine={false} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        {chart.yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {chart.yKeys.map((k, i) => (
          <Line
            key={k}
            type="monotone"
            dataKey={k}
            stroke={PIE_COLORS[i % PIE_COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    );
  }

  if (chart.type === "area") {
    return (
      <AreaChart data={chart.data} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
        <defs>
          {chart.yKeys.map((k, i) => (
            <linearGradient key={k} id={`ai-area-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PIE_COLORS[i % PIE_COLORS.length]} stopOpacity={0.3} />
              <stop offset="100%" stopColor={PIE_COLORS[i % PIE_COLORS.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={chart.xKey} tick={axisTick} tickLine={false} axisLine={false} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        {chart.yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {chart.yKeys.map((k, i) => (
          <Area
            key={k}
            type="monotone"
            dataKey={k}
            stroke={PIE_COLORS[i % PIE_COLORS.length]}
            strokeWidth={2}
            fill={`url(#ai-area-${i})`}
          />
        ))}
      </AreaChart>
    );
  }

  // bar (default)
  return (
    <BarChart data={chart.data} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
      <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey={chart.xKey} tick={axisTick} tickLine={false} axisLine={false} />
      <YAxis tick={axisTick} tickLine={false} axisLine={false} />
      <Tooltip cursor={{ fill: "var(--color-surface-2)", opacity: 0.5 }} contentStyle={tooltipStyle} />
      {chart.yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
      {chart.yKeys.map((k, i) => (
        <Bar
          key={k}
          dataKey={k}
          fill={PIE_COLORS[i % PIE_COLORS.length]}
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      ))}
    </BarChart>
  );
}

function formatCell(value: number) {
  if (Math.abs(value) >= 100 && Number.isInteger(value)) {
    return value.toLocaleString();
  }
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}
