"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="sticky top-0 z-50">
      <header className="mx-auto max-w-6xl mt-3 md:mt-4 px-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md px-4 py-2.5 shadow-sm">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid place-items-center h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-sky-500 text-white text-base shadow">
              🎣
            </span>
            <span className="font-display font-bold text-slate-900 tracking-tight">Fishinity Pro</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/builder"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Build a feature
              <span aria-hidden>→</span>
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="md:hidden grid place-items-center h-9 w-9 rounded-lg border border-slate-200 text-slate-700"
              aria-label="Toggle menu"
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/builder"
              className="mt-1 block rounded-lg bg-slate-900 px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Build a feature →
            </Link>
          </div>
        )}
      </header>
    </div>
  );
}
