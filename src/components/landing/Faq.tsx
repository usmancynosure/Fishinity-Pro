"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "Do I need to know how to code?",
    a: "No. You describe the fishing tool you want in plain English and the AI builds the first working version. You then refine it in a visual builder — no code at any point.",
  },
  {
    q: "What kinds of tools can I build?",
    a: "Calculators, planners, trackers, dashboards, questionnaires, scoring systems, recommendation tools and more — using blocks like inputs, charts, tables, calculators, scoring and live AI responses.",
  },
  {
    q: "Can I keep a feature private?",
    a: "Yes. Keep it personal, share it with selected anglers, publish it unlisted, or list it publicly on the marketplace. Waterbody owners and brands often keep venue tools private for members.",
  },
  {
    q: "How does monetisation work?",
    a: "Publish for free, as a one-off purchase, or as a subscription. Fishinity takes a flat 15% platform fee and you keep 85% of every sale, paid out to your creator wallet.",
  },
  {
    q: "Can my tools use real fishing data?",
    a: "Approved features can connect to Fishinity data sources — catch history, weather and conditions, waterbody information, moon phase and species stats — with permission controls protecting private angler data.",
  },
  {
    q: "Can I update a feature after publishing?",
    a: "Yes. Every change is versioned, so you can ship improvements without creating a new listing and users receive updates automatically.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">
      {ITEMS.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
          >
            <span className="font-medium text-slate-900">{item.q}</span>
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border border-slate-300 text-slate-500 transition-transform ${
                open === i ? "rotate-45" : ""
              }`}
              aria-hidden
            >
              +
            </span>
          </button>
          {open === i && <p className="px-6 pb-5 -mt-1 text-sm leading-relaxed text-slate-600">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
