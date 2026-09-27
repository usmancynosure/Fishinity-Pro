import type { Block, FeatureSchema } from "./types";
import { normalizeSchema } from "./normalize";
import { mockGenerate } from "./mockEngine";

// AI provider: Google Gemini.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function hasKey(): boolean {
  return !!process.env.GEMINI_API_KEY?.trim();
}

export function activeProvider(): "gemini" | "none" {
  return hasKey() ? "gemini" : "none";
}

const SYSTEM_PROMPT = `You are the AI engine behind Fishinity Pro's no-code Feature Builder.
Anglers, waterbody owners, fishing brands and coaches describe a fishing tool they want,
and you generate the FIRST working version as a JSON feature definition.

You MUST reply with ONLY a single JSON object (no prose, no markdown fences) matching this shape:

{
  "name": string,               // short, punchy tool name
  "description": string,        // one sentence describing what it does
  "category": one of "Dashboard" | "Calculator" | "Planner" | "Tracker" | "Questionnaire" | "Scoring System" | "Recommendation" | "Other",
  "icon": string,               // ONE emoji representing the tool
  "blocks": Block[]             // ordered UI blocks, see below
}

Block is a discriminated union on "type". Supported blocks:

- { "type": "heading", "text": string, "level": 1|2|3 }
- { "type": "text", "text": string }                              // supporting copy / instructions
- { "type": "kpiRow", "items": [ { "label": string, "value": string|number, "unit"?: string, "trend"?: number } ] }  // 2-4 stat tiles
- { "type": "input", "label": string, "key": string, "inputType": "number"|"text"|"select", "placeholder"?: string, "options"?: string[], "defaultValue"?: string|number, "unit"?: string }
- { "type": "calculator", "label": string, "formula": string, "resultLabel": string, "resultUnit"?: string, "decimals"?: number }
      // formula is arithmetic referencing input "key" names, e.g. "weight * 0.9 + depth / 2".
      // Allowed: + - * / % ^ ( ) and functions min,max,round,floor,ceil,abs,sqrt,pow.
- { "type": "chart", "title": string, "chartType": "bar"|"line", "labels": string[], "values": number[], "unit"?: string }
- { "type": "table", "title"?: string, "columns": string[], "rows": (string|number)[][] }
- { "type": "scoring", "title": string, "questions": [ { "text": string, "options": [ { "label": string, "points": number } ] } ], "bands": [ { "min": number, "label": string, "message": string } ] }
- { "type": "aiResponse", "label": string, "prompt": string, "buttonLabel"?: string }
      // prompt is a template; use {{key}} tokens to inject the user's input values at runtime.
- { "type": "image", "emoji"?: string, "caption"?: string }
- { "type": "divider" }

Rules:
- Make it genuinely useful and specific to the request. Use realistic fishing domain values.
- Prefer interactive tools: when the user wants a calculator/planner/scoring tool, include the relevant "input" blocks and a "calculator" or "scoring" block that actually uses those input keys.
- For dashboards, lead with a kpiRow, then a chart, then a table.
- input "key" values must be short camelCase identifiers and must match those referenced in calculator formulas / aiResponse prompts.
- Keep it to 4-9 blocks. Do NOT include "id" fields — they are assigned by the platform.
- Output raw JSON only.`;

function extractJson(text: string): unknown {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

async function callGemini(key: string, mode: "apikey" | "bearer", body: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (mode === "apikey") headers["x-goog-api-key"] = key;
  else headers["Authorization"] = `Bearer ${key}`;
  return fetch(url, { method: "POST", headers, body });
}

async function geminiText(
  system: string,
  user: string,
  maxTokens: number,
  json: boolean
): Promise<string> {
  const key = process.env.GEMINI_API_KEY!;
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: maxTokens,
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  });

  // Standard AI Studio keys start with "AIza" and use the api-key header.
  // Anything else (e.g. an OAuth2 access token) uses Bearer auth. We try the
  // most likely mode first, then fall back to the other on an auth error.
  const primary: "apikey" | "bearer" = key.startsWith("AIza") ? "apikey" : "bearer";
  const secondary: "apikey" | "bearer" = primary === "apikey" ? "bearer" : "apikey";

  let res = await callGemini(key, primary, body);
  if (!res.ok && [400, 401, 403].includes(res.status)) {
    const retry = await callGemini(key, secondary, body);
    if (retry.ok) res = retry;
  }

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${errBody.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text.trim()) throw new Error("Empty Gemini response");
  return text;
}

export interface GenerateResult {
  schema: FeatureSchema;
  source: "ai" | "mock";
  provider: "gemini" | "none";
  note?: string;
}

export async function generateFeature(prompt: string): Promise<GenerateResult> {
  if (!hasKey()) {
    return {
      schema: mockGenerate(prompt),
      source: "mock",
      provider: "none",
      note: "No GEMINI_API_KEY set — used the local template engine. Add a key to enable live generation.",
    };
  }
  try {
    const text = await geminiText(SYSTEM_PROMPT, `Build this fishing feature: ${prompt}`, 8000, true);
    const schema = normalizeSchema(extractJson(text), prompt);
    return { schema, source: "ai", provider: "gemini" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      schema: mockGenerate(prompt),
      source: "mock",
      provider: "gemini",
      note: `Gemini generation unavailable (${message}) — used the local template engine.`,
    };
  }
}

const RUN_SYSTEM =
  "You are a knowledgeable, concise fishing assistant embedded in a Fishinity Pro tool. Give practical, specific advice in 2-4 short sentences.";

export async function runAiBlock(
  prompt: string,
  values: Record<string, string | number>
): Promise<{ text: string; source: "ai" | "mock" }> {
  let filled = prompt;
  for (const [k, v] of Object.entries(values)) {
    filled = filled.replaceAll(`{{${k}}}`, String(v));
  }
  if (!hasKey()) {
    return {
      text: "🎣 (Demo mode) Add GEMINI_API_KEY for a live response. General tip: match your bait to the water temperature and target species, and fish structure edges during low-light windows.",
      source: "mock",
    };
  }
  try {
    const text = await geminiText(RUN_SYSTEM, filled, 1024, false);
    return { text: text.trim(), source: "ai" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { text: `AI unavailable (${message}).`, source: "mock" };
  }
}

export type { Block };
