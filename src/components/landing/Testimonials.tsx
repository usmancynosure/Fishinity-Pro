"use client";

import { useState } from "react";
import { AppImage } from "@/components/AppImage";

const TESTIMONIALS = [
  {
    quote: "Finally, a tool that works like a tackle-shop mate. I described a bait calculator and had it live on the marketplace the same evening.",
    name: "Kieran Moore",
    role: "Carp angler & creator",
    img: "/images/avatar-1.jpg",
    favourites: ["Bait Calculator", "Session Planner"],
  },
  {
    quote: "We built a venue planner for our members without hiring a developer. Rules, swim info and a catch log — all from a description.",
    name: "Sarah Lowe",
    role: "Waterbody owner, Rutland",
    img: "/images/avatar-2.jpg",
    favourites: ["Venue Planner", "Catch Log"],
  },
  {
    quote: "Our brand now ships rig builders and tackle selectors straight to anglers. It's a completely new channel for us.",
    name: "Marco Bianchi",
    role: "Fishing brand lead",
    img: "/images/avatar-3.jpg",
    favourites: ["Rig Builder", "Tackle Selector"],
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const t = TESTIMONIALS[i];
  const next = () => setI((v) => (v + 1) % TESTIMONIALS.length);
  const prev = () => setI((v) => (v - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] items-stretch">
      {/* Big quote */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 flex flex-col">
        <div className="text-5xl leading-none text-teal-400 font-display">&ldquo;</div>
        <p className="mt-2 font-display text-2xl md:text-[26px] leading-snug text-slate-900 flex-1">
          {t.quote}
        </p>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppImage src={t.img} alt={t.name} className="h-11 w-11" rounded="rounded-full" label="Avatar" />
            <div>
              <div className="font-medium text-slate-900">{t.name}</div>
              <div className="text-xs text-slate-500">{t.role}</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {t.favourites.map((f) => (
              <span key={f} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Selector cards */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 flex-1">
          {TESTIMONIALS.map((tt, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                idx === i ? "border-teal-400 bg-teal-50/60" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <AppImage src={tt.img} alt={tt.name} className="h-12 w-12" rounded="rounded-xl" label="Avatar" />
              <div className="mt-2 text-sm font-medium text-slate-900">{tt.name}</div>
              <div className="text-xs text-slate-500 line-clamp-1">{tt.role}</div>
            </button>
          ))}
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 grid place-items-center text-center">
            <div>
              <div className="font-display text-2xl font-bold text-slate-900">4.9★</div>
              <div className="text-xs text-slate-500">avg creator rating</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={prev}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
            aria-label="Previous testimonial"
          >
            ←
          </button>
          <button
            onClick={next}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
            aria-label="Next testimonial"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
