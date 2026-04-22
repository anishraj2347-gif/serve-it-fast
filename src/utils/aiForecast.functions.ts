import { createServerFn } from "@tanstack/react-start";

export interface AIForecastResult {
  prediction: {
    summary: string;
    start_hour: number;
    end_hour: number;
    prep_tip: string;
  } | null;
  error: string | null;
}

interface ForecastInput {
  hourlyCounts: { hour: number; avgOrders: number }[];
  topItems: string[];
}

const SYSTEM_PROMPT = `You are a restaurant operations forecaster.
You will receive 7-day average order counts per hour and a list of top-prep items.
Return ONE call to the "render_forecast" tool with:
- start_hour and end_hour: the busiest 2-hour window for tomorrow (integers 0-23, end_hour = start_hour + 2).
- summary: 1 sentence naming the window and expected intensity.
- prep_tip: 1 actionable preparation tip referencing 1-2 of the top items.
TOTAL across summary + prep_tip must be UNDER 3 sentences. Be specific and numeric.`;

const TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "render_forecast",
    description: "Return tomorrow's busiest 2-hour window and one prep tip.",
    parameters: {
      type: "object",
      properties: {
        start_hour: { type: "integer", minimum: 0, maximum: 23 },
        end_hour: { type: "integer", minimum: 0, maximum: 23 },
        summary: { type: "string", description: "One sentence about the busy window." },
        prep_tip: { type: "string", description: "One actionable preparation tip." },
      },
      required: ["start_hour", "end_hour", "summary", "prep_tip"],
      additionalProperties: false,
    },
  },
};

export const getAIForecast = createServerFn({ method: "POST" })
  .inputValidator((input: { payload: ForecastInput }) => {
    if (!input?.payload) throw new Error("Missing payload");
    if (!Array.isArray(input.payload.hourlyCounts)) {
      throw new Error("hourlyCounts must be an array");
    }
    if (input.payload.hourlyCounts.length > 24) {
      throw new Error("Too many hourly entries");
    }
    return input;
  })
  .handler(async ({ data }): Promise<AIForecastResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        prediction: null,
        error: "AI is not configured. Please enable Lovable AI.",
      };
    }

    const userPrompt = `Orders received at these hours (averages over the last 7 days): ${JSON.stringify(
      data.payload.hourlyCounts,
    )}. Top-prep items: ${data.payload.topItems.join(", ") || "none"}. Predict tomorrow's busiest 2-hour window and suggest one preparation tip. Keep total response under 3 sentences.`;

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
              { role: "user", content: userPrompt },
            ],
            tools: [TOOL_SCHEMA],
            tool_choice: {
              type: "function",
              function: { name: "render_forecast" },
            },
          }),
        },
      );

      if (response.status === 429) {
        return {
          prediction: null,
          error: "Too many requests right now — please try again in a moment.",
        };
      }
      if (response.status === 402) {
        return {
          prediction: null,
          error: "AI credits exhausted. Add funds in Settings → Workspace → Usage.",
        };
      }
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error("Lovable AI forecast error:", response.status, text);
        return { prediction: null, error: "AI service error. Please try again." };
      }

      const body = (await response.json()) as {
        choices?: {
          message?: {
            tool_calls?: { function?: { name?: string; arguments?: string } }[];
          };
        }[];
      };

      const argsString =
        body.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!argsString) {
        return { prediction: null, error: "AI returned no structured forecast." };
      }

      try {
        const parsed = JSON.parse(argsString) as {
          start_hour: number;
          end_hour: number;
          summary: string;
          prep_tip: string;
        };
        return { prediction: parsed, error: null };
      } catch {
        return { prediction: null, error: "Could not parse AI response." };
      }
    } catch (err) {
      console.error("getAIForecast failed:", err);
      return {
        prediction: null,
        error:
          err instanceof Error ? err.message : "Unexpected error generating forecast.",
      };
    }
  });
