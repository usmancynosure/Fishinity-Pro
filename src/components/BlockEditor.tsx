"use client";

import { useState } from "react";
import type { Block } from "@/lib/types";

const BLOCK_LABELS: Record<string, string> = {
  heading: "Heading",
  text: "Text",
  kpiRow: "Stat tiles",
  input: "Input field",
  calculator: "Calculator",
  chart: "Chart",
  table: "Table",
  scoring: "Scoring",
  aiResponse: "AI response",
  button: "Button",
  image: "Image",
  divider: "Divider",
};

const BLOCK_ICONS: Record<string, string> = {
  heading: "🔠",
  text: "📝",
  kpiRow: "📊",
  input: "🔢",
  calculator: "🧮",
  chart: "📈",
  table: "📋",
  scoring: "🎯",
  aiResponse: "✨",
  button: "🔘",
  image: "🖼️",
  divider: "➖",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-lg bg-ink-900 border border-line px-2.5 py-1.5 text-sm text-white focus:border-teal-500 focus:outline-none";

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={String(value ?? "")}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

function Area({ value, onChange, rows = 2 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className={inputCls} />
  );
}

function csv(arr: (string | number)[]): string {
  return arr.join(", ");
}
function parseCsv(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}
function parseNums(s: string): number[] {
  return s.split(",").map((x) => parseFloat(x.trim())).filter((n) => !isNaN(n));
}

function Fields({ block, update }: { block: Block; update: (patch: Partial<Block>) => void }) {
  const u = update as (patch: Record<string, unknown>) => void;
  switch (block.type) {
    case "heading":
      return (
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Field label="Text">
              <TextInput value={block.text} onChange={(v) => u({ text: v })} />
            </Field>
          </div>
          <Field label="Level">
            <select value={block.level} onChange={(e) => u({ level: Number(e.target.value) })} className={inputCls}>
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
          </Field>
        </div>
      );
    case "text":
      return (
        <Field label="Text">
          <Area value={block.text} onChange={(v) => u({ text: v })} rows={3} />
        </Field>
      );
    case "image":
      return (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Emoji">
            <TextInput value={block.emoji ?? ""} onChange={(v) => u({ emoji: v })} />
          </Field>
          <Field label="Caption">
            <TextInput value={block.caption ?? ""} onChange={(v) => u({ caption: v })} />
          </Field>
        </div>
      );
    case "button":
      return (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Label">
            <TextInput value={block.label} onChange={(v) => u({ label: v })} />
          </Field>
          <Field label="Style">
            <select value={block.style ?? "primary"} onChange={(e) => u({ style: e.target.value })} className={inputCls}>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </select>
          </Field>
        </div>
      );
    case "input":
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Label">
              <TextInput value={block.label} onChange={(v) => u({ label: v })} />
            </Field>
            <Field label="Key (variable)">
              <TextInput value={block.key} onChange={(v) => u({ key: v.replace(/[^a-zA-Z0-9_]/g, "") })} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Type">
              <select value={block.inputType} onChange={(e) => u({ inputType: e.target.value })} className={inputCls}>
                <option value="number">Number</option>
                <option value="text">Text</option>
                <option value="select">Select</option>
              </select>
            </Field>
            <Field label="Default">
              <TextInput value={block.defaultValue ?? ""} onChange={(v) => u({ defaultValue: v })} />
            </Field>
            <Field label="Unit">
              <TextInput value={block.unit ?? ""} onChange={(v) => u({ unit: v })} />
            </Field>
          </div>
          {block.inputType === "select" && (
            <Field label="Options (comma separated)">
              <TextInput value={csv(block.options ?? [])} onChange={(v) => u({ options: parseCsv(v) })} />
            </Field>
          )}
        </div>
      );
    case "calculator":
      return (
        <div className="space-y-2">
          <Field label="Formula (use input keys, e.g. weight * 0.9 + depth / 2)">
            <TextInput value={block.formula} onChange={(v) => u({ formula: v })} />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Result label">
              <TextInput value={block.resultLabel} onChange={(v) => u({ resultLabel: v })} />
            </Field>
            <Field label="Unit">
              <TextInput value={block.resultUnit ?? ""} onChange={(v) => u({ resultUnit: v })} />
            </Field>
            <Field label="Decimals">
              <TextInput type="number" value={block.decimals ?? 1} onChange={(v) => u({ decimals: Number(v) })} />
            </Field>
          </div>
        </div>
      );
    case "chart":
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Field label="Title">
                <TextInput value={block.title} onChange={(v) => u({ title: v })} />
              </Field>
            </div>
            <Field label="Type">
              <select value={block.chartType} onChange={(e) => u({ chartType: e.target.value })} className={inputCls}>
                <option value="bar">Bar</option>
                <option value="line">Line</option>
              </select>
            </Field>
          </div>
          <Field label="Labels (comma separated)">
            <TextInput value={csv(block.labels)} onChange={(v) => u({ labels: parseCsv(v) })} />
          </Field>
          <Field label="Values (comma separated numbers)">
            <TextInput value={csv(block.values)} onChange={(v) => u({ values: parseNums(v) })} />
          </Field>
        </div>
      );
    case "table":
      return (
        <div className="space-y-2">
          <Field label="Title">
            <TextInput value={block.title ?? ""} onChange={(v) => u({ title: v })} />
          </Field>
          <Field label="Columns (comma separated)">
            <TextInput value={csv(block.columns)} onChange={(v) => u({ columns: parseCsv(v) })} />
          </Field>
          <Field label="Rows (one per line, cells separated by | )">
            <Area
              rows={4}
              value={block.rows.map((r) => r.join(" | ")).join("\n")}
              onChange={(v) =>
                u({
                  rows: v
                    .split("\n")
                    .filter((l) => l.trim())
                    .map((l) => l.split("|").map((c) => c.trim())),
                })
              }
            />
          </Field>
        </div>
      );
    case "kpiRow":
      return (
        <Field label="Stat tiles (one per line: label | value | unit | trend%)">
          <Area
            rows={4}
            value={block.items.map((i) => [i.label, i.value, i.unit ?? "", i.trend ?? ""].join(" | ")).join("\n")}
            onChange={(v) =>
              u({
                items: v
                  .split("\n")
                  .filter((l) => l.trim())
                  .map((l) => {
                    const [label, value, unit, trend] = l.split("|").map((c) => c.trim());
                    const numVal = parseFloat(value);
                    return {
                      label: label || "Metric",
                      value: isNaN(numVal) ? value : numVal,
                      unit: unit || undefined,
                      trend: trend ? parseFloat(trend) : undefined,
                    };
                  }),
              })
            }
          />
        </Field>
      );
    case "aiResponse":
      return (
        <div className="space-y-2">
          <Field label="Button label">
            <TextInput value={block.label} onChange={(v) => u({ label: v })} />
          </Field>
          <Field label="Prompt (use {{key}} to inject input values)">
            <Area rows={3} value={block.prompt} onChange={(v) => u({ prompt: v })} />
          </Field>
        </div>
      );
    case "scoring":
      return (
        <div className="space-y-2">
          <Field label="Title">
            <TextInput value={block.title} onChange={(v) => u({ title: v })} />
          </Field>
          <Field label="Questions (one per line: text :: optionLabel=points, optionLabel=points)">
            <Area
              rows={4}
              value={block.questions
                .map((q) => `${q.text} :: ${q.options.map((o) => `${o.label}=${o.points}`).join(", ")}`)
                .join("\n")}
              onChange={(v) =>
                u({
                  questions: v
                    .split("\n")
                    .filter((l) => l.trim())
                    .map((l) => {
                      const [text, opts] = l.split("::");
                      return {
                        text: (text || "").trim(),
                        options: (opts || "")
                          .split(",")
                          .map((o) => o.trim())
                          .filter(Boolean)
                          .map((o) => {
                            const [label, pts] = o.split("=");
                            return { label: (label || "").trim(), points: parseFloat(pts) || 0 };
                          }),
                      };
                    }),
                })
              }
            />
          </Field>
          <Field label="Result bands (one per line: minScore | label | message)">
            <Area
              rows={3}
              value={block.bands.map((b) => `${b.min} | ${b.label} | ${b.message}`).join("\n")}
              onChange={(v) =>
                u({
                  bands: v
                    .split("\n")
                    .filter((l) => l.trim())
                    .map((l) => {
                      const [min, label, message] = l.split("|").map((c) => c.trim());
                      return { min: parseFloat(min) || 0, label: label || "Result", message: message || "" };
                    }),
                })
              }
            />
          </Field>
        </div>
      );
    default:
      return <div className="text-xs text-slate-500">No editable fields.</div>;
  }
}

export function BlockEditor({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);
  const update = (patch: Partial<Block>) => onChange({ ...block, ...patch } as Block);

  return (
    <div className="rounded-xl border border-line bg-ink-850">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 flex-1 text-left min-w-0"
        >
          <span className="text-base">{BLOCK_ICONS[block.type]}</span>
          <span className="text-sm font-medium text-slate-200">{BLOCK_LABELS[block.type]}</span>
          <span className="text-xs text-slate-500 truncate">
            {"text" in block ? block.text : "label" in block ? block.label : "title" in block ? (block.title ?? "") : ""}
          </span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="h-7 w-7 grid place-items-center rounded-md text-slate-400 hover:text-white hover:bg-ink-700 disabled:opacity-30"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="h-7 w-7 grid place-items-center rounded-md text-slate-400 hover:text-white hover:bg-ink-700 disabled:opacity-30"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="h-7 w-7 grid place-items-center rounded-md text-slate-400 hover:text-white hover:bg-ink-700"
            title="Edit"
          >
            {open ? "▾" : "✎"}
          </button>
          <button
            onClick={onDelete}
            className="h-7 w-7 grid place-items-center rounded-md text-coral-400 hover:text-coral-300 hover:bg-ink-700"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-line/60">
          <Fields block={block} update={update} />
        </div>
      )}
    </div>
  );
}

export const ADDABLE_BLOCKS: { type: Block["type"]; label: string; icon: string }[] = Object.keys(
  BLOCK_LABELS
).map((type) => ({ type: type as Block["type"], label: BLOCK_LABELS[type], icon: BLOCK_ICONS[type] }));
