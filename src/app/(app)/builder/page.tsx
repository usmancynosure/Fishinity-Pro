"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Block, FeatureSchema } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import FeatureRenderer from "@/components/FeatureRenderer";
import { BlockEditor, ADDABLE_BLOCKS } from "@/components/BlockEditor";
import { createBlock } from "@/lib/blockFactory";

const EXAMPLE_PROMPTS = [
  "A bait quantity calculator based on session length and rods",
  "A catch dashboard with species breakdown and best waterbodies",
  "A trip planner for my target species and water conditions",
  "A questionnaire to build an angler's coaching profile",
];

function BuilderInner() {
  const params = useSearchParams();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [schema, setSchema] = useState<FeatureSchema | null>(null);
  const [genNote, setGenNote] = useState<string | null>(null);
  const [genSource, setGenSource] = useState<string | null>(null);

  const [featureId, setFeatureId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("draft");

  const [addOpen, setAddOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [pricingType, setPricingType] = useState("free");
  const [priceDollars, setPriceDollars] = useState("4.99");
  const [visibility, setVisibility] = useState("public");

  // Prefill prompt / load existing feature from URL
  useEffect(() => {
    const p = params.get("prompt");
    if (p) setPrompt(p);
    const id = params.get("id");
    if (id) {
      setFeatureId(id);
      fetch(`/api/features/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.feature) {
            setSchema(data.feature.schema);
            setStatus(data.feature.status);
            setPricingType(data.feature.pricingType);
            setPriceDollars((data.feature.priceCents / 100).toFixed(2));
            setVisibility(data.feature.visibility);
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGenNote(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.schema) {
        setSchema(data.schema);
        setGenSource(data.source);
        setGenNote(data.note ?? null);
        // new generation = new unsaved feature
        setFeatureId(null);
        setStatus("draft");
        setSavedAt(null);
      }
    } catch {
      setGenNote("Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function updateBlock(index: number, b: Block) {
    if (!schema) return;
    const blocks = [...schema.blocks];
    blocks[index] = b;
    setSchema({ ...schema, blocks });
  }
  function deleteBlock(index: number) {
    if (!schema) return;
    setSchema({ ...schema, blocks: schema.blocks.filter((_, i) => i !== index) });
  }
  function moveBlock(index: number, dir: -1 | 1) {
    if (!schema) return;
    const blocks = [...schema.blocks];
    const j = index + dir;
    if (j < 0 || j >= blocks.length) return;
    [blocks[index], blocks[j]] = [blocks[j], blocks[index]];
    setSchema({ ...schema, blocks });
  }
  function addBlock(type: Block["type"]) {
    if (!schema) return;
    setSchema({ ...schema, blocks: [...schema.blocks, createBlock(type)] });
    setAddOpen(false);
  }
  function updateMeta(patch: Partial<FeatureSchema>) {
    if (!schema) return;
    setSchema({ ...schema, ...patch });
  }

  async function save() {
    if (!schema) return;
    setSaving(true);
    try {
      if (featureId) {
        await fetch(`/api/features/${featureId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schema }),
        });
      } else {
        const res = await fetch("/api/features", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schema }),
        });
        const data = await res.json();
        if (data.feature) {
          setFeatureId(data.feature.id);
          router.replace(`/builder?id=${data.feature.id}`);
        }
      }
      setSavedAt(new Date().toLocaleTimeString());
    } finally {
      setSaving(false);
    }
  }

  async function doPublish() {
    if (!schema) return;
    // ensure saved first
    let id = featureId;
    if (!id) {
      const res = await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema }),
      });
      const data = await res.json();
      id = data.feature?.id;
      if (id) {
        setFeatureId(id);
        router.replace(`/builder?id=${id}`);
      }
    } else {
      await fetch(`/api/features/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema }),
      });
    }
    if (!id) return;
    await fetch(`/api/features/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publish: true,
        visibility,
        pricingType,
        priceCents: Math.round(parseFloat(priceDollars || "0") * 100),
      }),
    });
    setStatus("published");
    setPublishOpen(false);
  }

  // ---- Empty state (no schema yet) ----
  if (!schema) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8 animate-fade-up">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-3xl font-bold text-white">AI Feature Builder</h1>
          <p className="text-slate-400 mt-2">
            Describe the fishing tool you want. The AI generates a working first version you can customise.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-ink-850 p-5">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="e.g. A bait calculator that tells me how much groundbait to bring based on session length and swim size…"
            className="w-full rounded-xl bg-ink-900 border border-line px-4 py-3 text-white focus:border-teal-500 focus:outline-none resize-none"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Powered by Google Gemini · falls back to local engine offline</span>
            <button
              onClick={generate}
              disabled={generating || !prompt.trim()}
              className="px-5 py-2.5 rounded-xl font-semibold bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-ink-950 transition-colors"
            >
              {generating ? "Generating…" : "Generate feature"}
            </button>
          </div>
          {generating && (
            <div className="mt-4 space-y-2">
              <div className="h-3 rounded shimmer w-2/3" />
              <div className="h-3 rounded shimmer w-full" />
              <div className="h-3 rounded shimmer w-1/2" />
            </div>
          )}
        </div>
        <div className="mt-6">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Try one of these</div>
          <div className="grid gap-2">
            {EXAMPLE_PROMPTS.map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="text-left text-sm rounded-lg border border-line bg-ink-850 hover:border-teal-500/50 px-4 py-2.5 text-slate-300"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- Builder (schema exists) ----
  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl">{schema.icon}</span>
          <div className="min-w-0">
            <input
              value={schema.name}
              onChange={(e) => updateMeta({ name: e.target.value })}
              className="bg-transparent text-xl font-bold text-white focus:outline-none border-b border-transparent focus:border-teal-500 w-full"
            />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span
                className={`px-2 py-0.5 rounded-full ${
                  status === "published" ? "bg-teal-500/15 text-teal-300" : "bg-ink-800 text-slate-400"
                }`}
              >
                {status === "published" ? "● Published" : "○ Draft"}
              </span>
              {savedAt && <span>Saved {savedAt}</span>}
              {genSource && (
                <span className="text-slate-600">
                  · generated by {genSource === "ai" ? "AI" : "local engine"}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSchema(null);
              setFeatureId(null);
              setPrompt("");
              router.replace("/builder");
            }}
            className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-ink-800"
          >
            ↺ Start over
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-ink-800 border border-line text-white hover:border-teal-500/50 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          {featureId && status === "published" && (
            <Link
              href={`/feature/${featureId}`}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-ink-800 border border-line text-white hover:border-teal-500/50"
            >
              View live ↗
            </Link>
          )}
          <button
            onClick={() => setPublishOpen(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-ink-950 shadow-lg shadow-teal-500/20"
          >
            🚀 Publish
          </button>
        </div>
      </div>

      {genNote && (
        <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-200">
          {genNote}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: editor */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-ink-850 p-4">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Feature settings</div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs text-slate-400">Description</span>
                <textarea
                  value={schema.description}
                  onChange={(e) => updateMeta({ description: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-lg bg-ink-900 border border-line px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none resize-none"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-slate-400">Category</span>
                  <select
                    value={schema.category}
                    onChange={(e) => updateMeta({ category: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-ink-900 border border-line px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400">Icon (emoji)</span>
                  <input
                    value={schema.icon}
                    onChange={(e) => updateMeta({ icon: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-ink-900 border border-line px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-slate-500">Blocks ({schema.blocks.length})</div>
            <div className="relative">
              <button
                onClick={() => setAddOpen((o) => !o)}
                className="px-3 py-1.5 rounded-lg text-sm bg-ink-800 border border-line text-slate-200 hover:border-teal-500/50"
              >
                + Add block
              </button>
              {addOpen && (
                <div className="absolute right-0 mt-2 z-20 w-52 rounded-xl border border-line bg-ink-900 shadow-2xl p-1.5 grid grid-cols-1 max-h-80 overflow-auto">
                  {ADDABLE_BLOCKS.map((b) => (
                    <button
                      key={b.type}
                      onClick={() => addBlock(b.type)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-slate-200 hover:bg-ink-800 text-left"
                    >
                      <span>{b.icon}</span>
                      {b.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {schema.blocks.map((block, i) => (
              <BlockEditor
                key={block.id}
                block={block}
                onChange={(b) => updateBlock(i, b)}
                onDelete={() => deleteBlock(i)}
                onMoveUp={() => moveBlock(i, -1)}
                onMoveDown={() => moveBlock(i, 1)}
                isFirst={i === 0}
                isLast={i === schema.blocks.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Right: live preview */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs uppercase tracking-widest text-slate-500">Live preview</span>
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs text-slate-500">interactive · try the inputs</span>
          </div>
          <div className="rounded-2xl border border-line bg-gradient-to-b from-ink-900 to-ink-850 p-5 md:p-6">
            <FeatureRenderer key={JSON.stringify(schema.blocks.map((b) => b.id))} schema={schema} featureId={featureId ?? undefined} />
          </div>
        </div>
      </div>

      {/* Publish modal */}
      {publishOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPublishOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-ink-900 p-6 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white">Publish to marketplace</h3>
            <p className="text-sm text-slate-400 mt-1">Choose how anglers can access your feature.</p>

            <div className="mt-5 space-y-4">
              <div>
                <div className="text-xs text-slate-400 mb-1.5">Visibility</div>
                <div className="grid grid-cols-2 gap-2">
                  {["public", "private"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setVisibility(v)}
                      className={`px-3 py-2 rounded-lg text-sm border capitalize ${
                        visibility === v ? "bg-teal-500 text-ink-950 border-teal-400 font-medium" : "bg-ink-850 text-slate-300 border-line"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1.5">Pricing</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "free", l: "Free" },
                    { v: "oneoff", l: "One-off" },
                    { v: "subscription", l: "Subscription" },
                  ].map((p) => (
                    <button
                      key={p.v}
                      onClick={() => setPricingType(p.v)}
                      className={`px-2 py-2 rounded-lg text-sm border ${
                        pricingType === p.v ? "bg-teal-500 text-ink-950 border-teal-400 font-medium" : "bg-ink-850 text-slate-300 border-line"
                      }`}
                    >
                      {p.l}
                    </button>
                  ))}
                </div>
              </div>
              {pricingType !== "free" && (
                <label className="block">
                  <span className="text-xs text-slate-400">Price (USD){pricingType === "subscription" ? " / month" : ""}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={priceDollars}
                    onChange={(e) => setPriceDollars(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-ink-850 border border-line px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Fishinity takes a 15% platform fee on paid transactions.
                  </span>
                </label>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setPublishOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-ink-800">
                Cancel
              </button>
              <button
                onClick={doPublish}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-ink-950"
              >
                Publish now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading builder…</div>}>
      <BuilderInner />
    </Suspense>
  );
}
