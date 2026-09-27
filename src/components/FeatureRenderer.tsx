"use client";

import { useMemo, useState } from "react";
import type {
  Block,
  FeatureSchema,
  ScoringBlock,
} from "@/lib/types";
import { evaluateFormula } from "@/lib/formula";

type Values = Record<string, string | number>;

function initialValues(schema: FeatureSchema): Values {
  const v: Values = {};
  for (const block of schema.blocks) {
    if (block.type === "input") {
      if (block.defaultValue !== undefined) v[block.key] = block.defaultValue;
      else if (block.inputType === "number") v[block.key] = 0;
      else if (block.inputType === "select") v[block.key] = block.options?.[0] ?? "";
      else v[block.key] = "";
    }
  }
  return v;
}

function numericValues(values: Values): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(values)) {
    const n = typeof v === "number" ? v : parseFloat(v);
    out[k] = isNaN(n) ? 0 : n;
  }
  return out;
}

// ---- Charts ---------------------------------------------------------------

function BarChart({ labels, values, unit }: { labels: string[]; values: number[]; unit?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-2 h-44 pt-4">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <div className="text-xs text-teal-300 font-medium">{v}</div>
          <div className="w-full flex items-end justify-center h-full">
            <div
              className="w-full max-w-12 rounded-t-md bg-gradient-to-t from-teal-600 to-teal-400 transition-all"
              style={{ height: `${(v / max) * 100}%` }}
              title={`${labels[i]}: ${v}${unit ? " " + unit : ""}`}
            />
          </div>
          <div className="text-[11px] text-slate-400 truncate w-full text-center">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

function LineChart({ labels, values, unit }: { labels: string[]; values: number[]; unit?: string }) {
  const w = 520;
  const h = 160;
  const pad = 24;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L ${pts[0][0].toFixed(1)} ${h - pad} Z`;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[420px]" style={{ maxHeight: 200 }}>
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lineFill)" />
        <path d={path} fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r="3.5" fill="#5eead4" />
            <text x={p[0]} y={h - 6} textAnchor="middle" className="fill-slate-400" fontSize="10">
              {labels[i]}
            </text>
            <text x={p[0]} y={p[1] - 8} textAnchor="middle" className="fill-teal-300" fontSize="10">
              {values[i]}
              {unit ? unit : ""}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ---- Scoring --------------------------------------------------------------

function Scoring({ block }: { block: ScoringBlock }) {
  // Track the selected option index per question.
  const [selected, setSelected] = useState<Record<number, number>>({});
  const answered = Object.keys(selected).length;
  const total = block.questions.reduce((sum, q, qi) => {
    const oi = selected[qi];
    return oi === undefined ? sum : sum + (q.options[oi]?.points ?? 0);
  }, 0);
  const done = answered === block.questions.length && block.questions.length > 0;
  const band = useMemo(() => {
    if (!done) return null;
    const sorted = [...block.bands].sort((a, b) => b.min - a.min);
    return sorted.find((b) => total >= b.min) ?? sorted[sorted.length - 1];
  }, [done, total, block.bands]);

  return (
    <div className="space-y-5">
      {block.questions.map((q, qi) => (
        <div key={qi}>
          <div className="text-sm font-medium text-slate-200 mb-2">
            {qi + 1}. {q.text}
          </div>
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => setSelected((s) => ({ ...s, [qi]: oi }))}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  selected[qi] === oi
                    ? "bg-teal-500 text-ink-950 border-teal-400 font-medium"
                    : "bg-ink-850 text-slate-300 border-line hover:border-teal-500/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="pt-2">
        {done && band ? (
          <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 animate-fade-up">
            <div className="text-lg font-semibold text-white">{band.label}</div>
            <div className="text-sm text-slate-300 mt-1">{band.message}</div>
            <div className="text-xs text-teal-300/80 mt-2">Score: {total}</div>
          </div>
        ) : (
          <div className="text-xs text-slate-500">
            Answer all {block.questions.length} questions to see your result ({answered}/{block.questions.length}).
          </div>
        )}
      </div>
    </div>
  );
}

// ---- AI block -------------------------------------------------------------

function AiBlock({
  block,
  values,
  featureId,
}: {
  block: Extract<Block, { type: "aiResponse" }>;
  values: Values;
  featureId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: block.prompt, values, featureId }),
      });
      const data = await res.json();
      setResult(data.text ?? "No response.");
      setSource(data.source ?? null);
    } catch {
      setResult("Something went wrong calling the AI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-sky-500/25 bg-sky-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sky-300">✨</span>
        <span className="text-sm font-medium text-slate-200">{block.label}</span>
      </div>
      <button
        onClick={run}
        disabled={loading}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-ink-950 transition-colors"
      >
        {loading ? "Thinking…" : block.buttonLabel || "Ask the AI"}
      </button>
      {loading && (
        <div className="mt-3 space-y-2">
          <div className="h-3 rounded shimmer w-3/4" />
          <div className="h-3 rounded shimmer w-full" />
          <div className="h-3 rounded shimmer w-1/2" />
        </div>
      )}
      {result && !loading && (
        <div className="mt-3 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap animate-fade-up">
          {result}
          {source === "mock" && (
            <div className="text-[11px] text-slate-500 mt-2">demo mode · set GEMINI_API_KEY for live AI</div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Block dispatcher -----------------------------------------------------

function BlockView({
  block,
  values,
  setValue,
  featureId,
}: {
  block: Block;
  values: Values;
  setValue: (k: string, v: string | number) => void;
  featureId?: string;
}) {
  switch (block.type) {
    case "heading": {
      const cls =
        block.level === 1
          ? "text-2xl font-bold text-white"
          : block.level === 2
          ? "text-xl font-semibold text-white"
          : "text-base font-semibold text-teal-200";
      return <h3 className={cls}>{block.text}</h3>;
    }
    case "text":
      return <p className="text-sm text-slate-300 leading-relaxed">{block.text}</p>;
    case "divider":
      return <hr className="border-line" />;
    case "image":
      return (
        <div className="flex flex-col items-center gap-2 py-4">
          {block.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.url} alt={block.caption || ""} className="max-h-48 rounded-lg" />
          ) : (
            <div className="text-6xl">{block.emoji || "🐟"}</div>
          )}
          {block.caption && <div className="text-xs text-slate-400">{block.caption}</div>}
        </div>
      );
    case "kpiRow":
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {block.items.map((it, i) => (
            <div key={i} className="rounded-xl border border-line bg-ink-850 p-4">
              <div className="text-xs text-slate-400">{it.label}</div>
              <div className="mt-1 text-2xl font-bold text-white tabular-nums">
                {it.value}
                {it.unit && <span className="text-sm text-slate-400 ml-1">{it.unit}</span>}
              </div>
              {it.trend !== undefined && (
                <div className={`text-xs mt-1 ${it.trend >= 0 ? "text-teal-300" : "text-coral-400"}`}>
                  {it.trend >= 0 ? "▲" : "▼"} {Math.abs(it.trend)}%
                </div>
              )}
            </div>
          ))}
        </div>
      );
    case "input": {
      const val = values[block.key] ?? "";
      return (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {block.label}
            {block.unit && <span className="text-slate-500 ml-1">({block.unit})</span>}
          </label>
          {block.inputType === "select" ? (
            <select
              value={String(val)}
              onChange={(e) => setValue(block.key, e.target.value)}
              className="w-full rounded-lg bg-ink-850 border border-line px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
            >
              {(block.options ?? []).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={block.inputType === "number" ? "number" : "text"}
              value={String(val)}
              placeholder={block.placeholder}
              onChange={(e) =>
                setValue(block.key, block.inputType === "number" ? parseFloat(e.target.value) || 0 : e.target.value)
              }
              className="w-full rounded-lg bg-ink-850 border border-line px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
            />
          )}
        </div>
      );
    }
    case "calculator": {
      const result = evaluateFormula(block.formula, numericValues(values));
      const decimals = block.decimals ?? 1;
      return (
        <div className="rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-transparent p-4">
          <div className="text-xs text-teal-300/80">{block.resultLabel}</div>
          <div className="mt-1 text-3xl font-bold text-white tabular-nums">
            {result.toFixed(decimals)}
            {block.resultUnit && <span className="text-base text-slate-400 ml-1.5">{block.resultUnit}</span>}
          </div>
        </div>
      );
    }
    case "chart":
      return (
        <div className="rounded-xl border border-line bg-ink-850 p-4">
          <div className="text-sm font-medium text-slate-200 mb-1">{block.title}</div>
          {block.chartType === "line" ? (
            <LineChart labels={block.labels} values={block.values} unit={block.unit} />
          ) : (
            <BarChart labels={block.labels} values={block.values} unit={block.unit} />
          )}
        </div>
      );
    case "table":
      return (
        <div className="rounded-xl border border-line bg-ink-850 overflow-hidden">
          {block.title && <div className="px-4 py-2.5 text-sm font-medium text-slate-200 border-b border-line">{block.title}</div>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-line">
                  {block.columns.map((c, i) => (
                    <th key={i} className="px-4 py-2 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-line/50 last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-2 text-slate-300 tabular-nums">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "scoring":
      return (
        <div className="rounded-xl border border-line bg-ink-850 p-4">
          <div className="text-sm font-medium text-slate-200 mb-4">{block.title}</div>
          <Scoring block={block} />
        </div>
      );
    case "aiResponse":
      return <AiBlock block={block} values={values} featureId={featureId} />;
    case "button":
      return (
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            block.style === "secondary"
              ? "bg-ink-800 text-slate-200 border border-line hover:border-teal-500/50"
              : "bg-teal-500 text-ink-950 hover:bg-teal-400"
          }`}
        >
          {block.label}
        </button>
      );
    default:
      return null;
  }
}

export default function FeatureRenderer({
  schema,
  featureId,
}: {
  schema: FeatureSchema;
  featureId?: string;
}) {
  const [values, setValues] = useState<Values>(() => initialValues(schema));
  const setValue = (k: string, v: string | number) => setValues((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-5">
      {schema.blocks.map((block) => (
        <BlockView key={block.id} block={block} values={values} setValue={setValue} featureId={featureId} />
      ))}
    </div>
  );
}
