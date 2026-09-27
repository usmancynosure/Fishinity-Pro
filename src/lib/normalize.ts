import type {
  Block,
  FeatureSchema,
  KpiItem,
  ScoringBand,
  ScoringQuestion,
} from "./types";

let idCounter = 0;
export function makeId(prefix = "b"): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}

function asString(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
}
function asNumber(v: unknown, fallback = 0): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return typeof n === "number" && !isNaN(n) ? n : fallback;
}
function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function normalizeBlock(raw: unknown): Block | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const type = asString(r.type);
  const id = asString(r.id) || makeId();

  switch (type) {
    case "heading": {
      const level = [1, 2, 3].includes(asNumber(r.level)) ? (asNumber(r.level) as 1 | 2 | 3) : 2;
      return { id, type: "heading", text: asString(r.text, "Heading"), level };
    }
    case "text":
      return { id, type: "text", text: asString(r.text) };
    case "kpiRow": {
      const items: KpiItem[] = asArray(r.items).map((it) => {
        const o = (it || {}) as Record<string, unknown>;
        return {
          label: asString(o.label, "Metric"),
          value: typeof o.value === "number" ? o.value : asString(o.value, "—"),
          unit: o.unit ? asString(o.unit) : undefined,
          trend: o.trend !== undefined ? asNumber(o.trend) : undefined,
        };
      });
      return { id, type: "kpiRow", items: items.length ? items : [{ label: "Metric", value: 0 }] };
    }
    case "input": {
      const inputType = ["number", "text", "select"].includes(asString(r.inputType))
        ? (asString(r.inputType) as "number" | "text" | "select")
        : "number";
      const key = asString(r.key) || asString(r.label, "field").replace(/[^a-zA-Z0-9]/g, "").slice(0, 20) || makeId("k");
      return {
        id,
        type: "input",
        label: asString(r.label, "Input"),
        key,
        inputType,
        placeholder: r.placeholder ? asString(r.placeholder) : undefined,
        options: inputType === "select" ? asArray(r.options).map((o) => asString(o)) : undefined,
        defaultValue:
          r.defaultValue !== undefined
            ? typeof r.defaultValue === "number"
              ? r.defaultValue
              : asString(r.defaultValue)
            : undefined,
        unit: r.unit ? asString(r.unit) : undefined,
      };
    }
    case "calculator":
      return {
        id,
        type: "calculator",
        label: asString(r.label, "Result"),
        formula: asString(r.formula, "0"),
        resultLabel: asString(r.resultLabel, "Result"),
        resultUnit: r.resultUnit ? asString(r.resultUnit) : undefined,
        decimals: r.decimals !== undefined ? asNumber(r.decimals, 1) : 1,
      };
    case "chart": {
      const chartType = asString(r.chartType) === "line" ? "line" : "bar";
      const labels = asArray(r.labels).map((l) => asString(l));
      const values = asArray(r.values).map((v) => asNumber(v));
      return {
        id,
        type: "chart",
        title: asString(r.title, "Chart"),
        chartType,
        labels: labels.length ? labels : ["A", "B", "C"],
        values: values.length ? values : [3, 6, 4],
        unit: r.unit ? asString(r.unit) : undefined,
      };
    }
    case "table": {
      const columns = asArray(r.columns).map((c) => asString(c));
      const rows = asArray(r.rows).map((row) =>
        asArray(row).map((cell) => (typeof cell === "number" ? cell : asString(cell)))
      );
      return {
        id,
        type: "table",
        title: r.title ? asString(r.title) : undefined,
        columns: columns.length ? columns : ["Column"],
        rows: rows.length ? rows : [["—"]],
      };
    }
    case "scoring": {
      const questions: ScoringQuestion[] = asArray(r.questions).map((q) => {
        const o = (q || {}) as Record<string, unknown>;
        return {
          text: asString(o.text, "Question"),
          options: asArray(o.options).map((opt) => {
            const oo = (opt || {}) as Record<string, unknown>;
            return { label: asString(oo.label, "Option"), points: asNumber(oo.points) };
          }),
        };
      });
      const bands: ScoringBand[] = asArray(r.bands).map((b) => {
        const o = (b || {}) as Record<string, unknown>;
        return { min: asNumber(o.min), label: asString(o.label, "Result"), message: asString(o.message) };
      });
      return {
        id,
        type: "scoring",
        title: asString(r.title, "Assessment"),
        questions: questions.length ? questions : [],
        bands: bands.length ? bands : [{ min: 0, label: "Result", message: "Your score." }],
      };
    }
    case "aiResponse":
      return {
        id,
        type: "aiResponse",
        label: asString(r.label, "Ask the AI"),
        prompt: asString(r.prompt, "Give me fishing advice."),
        buttonLabel: r.buttonLabel ? asString(r.buttonLabel) : undefined,
      };
    case "button":
      return {
        id,
        type: "button",
        label: asString(r.label, "Button"),
        style: asString(r.style) === "secondary" ? "secondary" : "primary",
      };
    case "image":
      return {
        id,
        type: "image",
        emoji: r.emoji ? asString(r.emoji) : "🐟",
        url: r.url ? asString(r.url) : undefined,
        caption: r.caption ? asString(r.caption) : undefined,
      };
    case "divider":
      return { id, type: "divider" };
    default:
      return null;
  }
}

const VALID_CATEGORIES = [
  "Dashboard",
  "Calculator",
  "Planner",
  "Tracker",
  "Questionnaire",
  "Scoring System",
  "Recommendation",
  "Other",
];

export function normalizeSchema(raw: unknown, fallbackPrompt = ""): FeatureSchema {
  const r = (raw || {}) as Record<string, unknown>;
  const blocks = asArray(r.blocks)
    .map(normalizeBlock)
    .filter((b): b is Block => b !== null);

  const category = VALID_CATEGORIES.includes(asString(r.category)) ? asString(r.category) : "Other";

  return {
    name: asString(r.name) || fallbackPrompt.slice(0, 40) || "Untitled Feature",
    description: asString(r.description) || "A custom fishing tool.",
    category,
    icon: asString(r.icon) || "🎣",
    blocks: blocks.length ? blocks : [{ id: makeId(), type: "text", text: "Empty feature." }],
  };
}
