import { createServerFn } from "@tanstack/react-start";

export type ChartType = "bar" | "line" | "area" | "pie";

export interface AIInsightTable {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export interface AIInsightChart {
  type: ChartType;
  title: string;
  xKey: string;
  yKeys: string[];
  data: Record<string, string | number>[];
}

export interface AIInsight {
  headline: string;
  summary: string;
  highlights: string[];
  table: AIInsightTable;
  chart: AIInsightChart;
}

export interface AIInsightResult {
  insight: AIInsight | null;
  error: string | null;
}

interface OrderSummary {
  orderId: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  createdAtISO: string;
  createdHour: number;
  prepSeconds: number | null;
  deliverySeconds: number | null;
  items: { name: string; qty: number; price: number; category?: string }[];
}

interface AnalysisInput {
  question: string;
  restaurantName: string;
  generatedAtISO: string;
  totals: {
    orders: number;
    revenue: number;
    avgTicket: number;
    statusBreakdown: Record<string, number>;
    revenueByCategory: Record<string, number>;
    topItems: { name: string; qty: number; revenue: number }[];
    avgPrepSeconds: number;
    avgDeliverySeconds: number;
    acceptanceRate: number;
    cancellationRate: number;
  };
  hourlyToday: { hour: number; orders: number }[];
  weekly: { date: string; orders: number }[];
  recentOrders: OrderSummary[];
}

const SYSTEM_PROMPT = `You are a senior restaurant operations analyst.
You receive a JSON payload with live order metrics and a user question.
Return ONE call to the "render_insight" tool with:
- A short headline (max 8 words) and a 1–2 sentence summary that directly answers the user's question.
- 3–5 highlights (each <= 12 words) — concrete, numeric where possible.
- A "table" with 2–6 columns and 3–10 rows of the most relevant data for the question. Use real values from the payload, not invented ones. Round currency to 2 decimals.
- A "chart" with an appropriate type (bar/line/area/pie). Pick the chart that best fits the question.
  - For trends over time use "line" or "area".
  - For comparing categories/items use "bar".
  - For share/distribution use "pie" (in this case set xKey="name" and yKeys=["value"]).
- Numeric values in the chart "data" must be numbers (not strings). Currency stays as numbers without symbols.
- If the question cannot be answered from the data, say so clearly in summary and still produce a small table+chart of the most related metrics.
Never invent data not present in the payload.`;

const TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "render_insight",
    description:
      "Render a structured analytical insight with a summary, a table and a chart.",
    parameters: {
      type: "object",
      properties: {
        headline: { type: "string", description: "Short headline (<= 8 words)" },
        summary: {
          type: "string",
          description: "1–2 sentence direct answer to the question.",
        },
        highlights: {
          type: "array",
          items: { type: "string" },
          minItems: 2,
          maxItems: 6,
        },
        table: {
          type: "object",
          properties: {
            title: { type: "string" },
            columns: {
              type: "array",
              items: { type: "string" },
              minItems: 2,
              maxItems: 6,
            },
            rows: {
              type: "array",
              items: {
                type: "array",
                items: { type: ["string", "number"] },
              },
              minItems: 1,
              maxItems: 12,
            },
          },
          required: ["title", "columns", "rows"],
          additionalProperties: false,
        },
        chart: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["bar", "line", "area", "pie"] },
            title: { type: "string" },
            xKey: { type: "string" },
            yKeys: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 3,
            },
            data: {
              type: "array",
              items: { type: "object", additionalProperties: true },
              minItems: 2,
              maxItems: 24,
            },
          },
          required: ["type", "title", "xKey", "yKeys", "data"],
          additionalProperties: false,
        },
      },
      required: ["headline", "summary", "highlights", "table", "chart"],
      additionalProperties: false,
    },
  },
};

export const getAIInsights = createServerFn({ method: "POST" })
  .inputValidator((input: { payload: AnalysisInput }) => {
    if (!input || typeof input !== "object") throw new Error("Invalid input");
    if (!input.payload) throw new Error("Missing payload");
    if (typeof input.payload.question !== "string" || input.payload.question.length === 0) {
      throw new Error("Question is required");
    }
    if (input.payload.question.length > 500) {
      throw new Error("Question is too long");
    }
    return input;
  })
  .handler(async ({ data }): Promise<AIInsightResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        insight: null,
        error: "AI is not configured. Please enable Lovable AI to use insights.",
      };
    }

    try {
      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: `Question: ${data.payload.question}\n\nData payload (JSON):\n${JSON.stringify(
                  data.payload,
                )}`,
              },
            ],
            tools: [TOOL_SCHEMA],
            tool_choice: {
              type: "function",
              function: { name: "render_insight" },
            },
          }),
        },
      );

      if (response.status === 429) {
        return {
          insight: null,
          error: "Too many requests right now — please try again in a moment.",
        };
      }
      if (response.status === 402) {
        return {
          insight: null,
          error: "AI credits exhausted. Add funds in Settings → Workspace → Usage.",
        };
      }
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error("Lovable AI error:", response.status, text);
        return { insight: null, error: "AI service error. Please try again." };
      }

      const body = (await response.json()) as {
        choices?: {
          message?: {
            tool_calls?: { function?: { name?: string; arguments?: string } }[];
          };
        }[];
      };

      const toolCall = body.choices?.[0]?.message?.tool_calls?.[0];
      const argsString = toolCall?.function?.arguments;
      if (!argsString) {
        return { insight: null, error: "AI returned no structured insight." };
      }

      let parsed: AIInsight;
      try {
        parsed = JSON.parse(argsString) as AIInsight;
      } catch {
        return { insight: null, error: "Could not parse AI response." };
      }

      // Defensive: ensure chart numeric values are numbers
      if (parsed.chart && Array.isArray(parsed.chart.data)) {
        parsed.chart.data = parsed.chart.data.map((row) => {
          const out: Record<string, string | number> = {};
          for (const [k, v] of Object.entries(row)) {
            if (parsed.chart.yKeys.includes(k) && typeof v === "string") {
              const n = Number(v.replace?.(/[^0-9.\-]/g, "") ?? v);
              out[k] = isFinite(n) ? n : 0;
            } else {
              out[k] = v as string | number;
            }
          }
          return out;
        });
      }

      return { insight: parsed, error: null };
    } catch (err) {
      console.error("getAIInsights failed:", err);
      return {
        insight: null,
        error:
          err instanceof Error ? err.message : "Unexpected error generating insight.",
      };
    }
  });
