"use client";

import Link from "next/link";
import { useState } from "react";

function SocialIcon({ path, label, viewBox = "0 0 24 24" }: { path: string; label: string; viewBox?: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900"
    >
      <svg viewBox={viewBox} className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d={path} />
      </svg>
    </a>
  );
}

const SOCIALS = [
  { label: "X", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "Instagram", path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.44c-3.14 0-3.51.01-4.75.07-1.15.05-1.77.24-2.19.4-.55.22-.94.47-1.35.88-.41.41-.66.8-.88 1.35-.16.42-.35 1.04-.4 2.19-.06 1.24-.07 1.61-.07 4.75s.01 3.51.07 4.75c.05 1.15.24 1.77.4 2.19.22.55.47.94.88 1.35.41.41.8.66 1.35.88.42.16 1.04.35 2.19.4 1.24.06 1.61.07 4.75.07s3.51-.01 4.75-.07c1.15-.05 1.77-.24 2.19-.4.55-.22.94-.47 1.35-.88.41-.41.66-.8.88-1.35.16-.42.35-1.04.4-2.19.06-1.24.07-1.61.07-4.75s-.01-3.51-.07-4.75c-.05-1.15-.24-1.77-.4-2.19a3.64 3.64 0 00-.88-1.35 3.64 3.64 0 00-1.35-.88c-.42-.16-1.04-.35-2.19-.4-1.24-.06-1.61-.07-4.75-.07zm0 2.45a5.95 5.95 0 110 11.9 5.95 5.95 0 010-11.9zm0 9.82a3.87 3.87 0 100-7.74 3.87 3.87 0 000 7.74zm7.58-10.06a1.39 1.39 0 11-2.78 0 1.39 1.39 0 012.78 0z" },
  { label: "LinkedIn", path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 110-4.14 2.07 2.07 0 010 4.14zM7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" },
  { label: "YouTube", path: "M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 00.5 6.2C0 8.09 0 12 0 12s0 3.91.5 5.8a3.02 3.02 0 002.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 002.12-2.14C24 15.91 24 12 24 12s0-3.91-.5-5.8zM9.6 15.6V8.4l6.24 3.6z" },
  { label: "GitHub", path: "M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0024 12.5C24 5.87 18.63.5 12 .5z" },
];

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
      className="mt-6 flex max-w-md gap-2 rounded-2xl bg-white/95 p-1.5 shadow-lg"
    >
      {done ? (
        <div className="flex-1 px-4 py-2 text-sm font-medium text-teal-700">
          🎣 You&rsquo;re on the list — tight lines!
        </div>
      ) : (
        <>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 rounded-xl bg-transparent px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Subscribe
          </button>
        </>
      )}
    </form>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative bg-white">
      {/* newsletter band (overlaps footer top) */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-600 to-sky-700 px-8 py-10 md:px-12 md:py-12 shadow-xl">
          <div className="absolute -right-6 -top-8 text-[180px] leading-none opacity-15 select-none">🐟</div>
          <div className="relative grid items-center gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-display text-2xl font-bold text-white md:text-3xl">
                New fishing tools, straight to your inbox
              </h3>
              <p className="mt-2 max-w-md text-sm text-teal-50/90">
                Get the best new features from the marketplace, creator tips and product updates. No spam —
                unsubscribe anytime.
              </p>
            </div>
            <div className="md:justify-self-end md:w-full">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>

      {/* footer columns */}
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-500 text-white">
                🎣
              </span>
              <span className="font-display text-lg font-bold text-slate-900">Fishinity Pro</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              The AI-powered no-code Feature Builder and marketplace for anglers, waterbody owners, coaches
              and fishing brands.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map((s) => (
                <SocialIcon key={s.label} path={s.path} label={s.label} />
              ))}
            </div>
          </div>

          <FooterCol
            title="Product"
            links={[
              { label: "AI Builder", href: "/builder" },
              { label: "Marketplace", href: "/marketplace" },
              { label: "Creator Dashboard", href: "/dashboard" },
            ]}
          />
          <FooterCol
            title="Learn"
            links={[
              { label: "How it works", href: "#how" },
              { label: "Pricing", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ]}
          />
          <FooterCol
            title="Creators"
            links={[
              { label: "Anglers", href: "/builder" },
              { label: "Waterbody owners", href: "/builder" },
              { label: "Brands & coaches", href: "/builder" },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
          <span>© {2026} Fishinity Pro · Special Fishinity Pro Module — Feature Marketplace demo</span>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-slate-700">Privacy</a>
            <a href="#" className="hover:text-slate-700">Terms</a>
            <a href="#" className="hover:text-slate-700">Site map</a>
            <span className="text-slate-300">Next.js · Node · SQL · Gemini</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</div>
      <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="hover:text-slate-900">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
