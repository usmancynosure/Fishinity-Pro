import Link from "next/link";
import { prisma } from "@/lib/db";
import { serializeFeature, priceLabel } from "@/lib/features";
import { Nav } from "@/components/landing/Nav";
import { Faq } from "@/components/landing/Faq";
import { Testimonials } from "@/components/landing/Testimonials";
import { FeatureCarousel } from "@/components/landing/FeatureCarousel";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { AppImage } from "@/components/AppImage";

export const dynamic = "force-dynamic";

/* ---------- small presentational helpers ---------- */

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold uppercase tracking-widest text-teal-600">{children}</div>;
}

/* ---------- feature card mini-mockups (CSS) ---------- */

function CreatorMock() {
  return (
    <div className="rounded-xl border border-white/70 bg-white/80 p-3 shadow-sm">
      <div className="rounded-lg bg-sky-50 border border-sky-100 p-2 text-[10px] text-slate-500">
        ✨ &ldquo;A bait calculator for carp sessions&rdquo;
      </div>
      <div className="mt-2 space-y-1.5">
        {["Session length", "Number of rods", "Recommended bait"].map((t, i) => (
          <div key={i} className={`flex items-center justify-between rounded-md px-2 py-1 text-[10px] ${i === 2 ? "bg-teal-500 text-white" : "bg-white border border-slate-100 text-slate-500"}`}>
            <span>{t}</span>
            <span>{i === 2 ? "3.6 kg" : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuilderMock() {
  return (
    <div className="rounded-xl border border-white/70 bg-white/80 p-3 shadow-sm space-y-1.5">
      {[
        { i: "🔠", t: "Heading" },
        { i: "🔢", t: "Input field" },
        { i: "🧮", t: "Calculator", on: true },
        { i: "📈", t: "Chart" },
      ].map((b, i) => (
        <div key={i} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] ${b.on ? "border border-teal-300 bg-teal-50 text-slate-700" : "border border-slate-100 bg-white text-slate-500"}`}>
          <span>{b.i}</span>
          <span className="flex-1">{b.t}</span>
          <span className="text-slate-300">⋮⋮</span>
        </div>
      ))}
    </div>
  );
}

function MarketMock() {
  return (
    <div className="rounded-xl border border-white/70 bg-white/80 p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-lg">🪱</span>
        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[9px] font-medium text-teal-700">£2.99</span>
      </div>
      <div className="mt-2 text-[11px] font-semibold text-slate-800">Bait Calculator</div>
      <div className="text-[9px] text-slate-500">by River Kelly</div>
      <div className="mt-2 flex items-center justify-between text-[9px] text-slate-500">
        <span className="text-amber-500">★★★★★</span>
        <span>174 installs</span>
      </div>
    </div>
  );
}

const FEATURE_CARDS = [
  {
    title: "AI Feature Creator",
    body: "Describe the tool you want in plain English. The AI generates a working first version — calculators, planners, trackers, dashboards, scoring tools and more.",
    grad: "from-sky-100 to-sky-50",
    mock: <CreatorMock />,
  },
  {
    title: "Visual Builder",
    body: "Refine it with no code. Add, reorder and edit blocks — text, inputs, charts, tables, calculators, scoring and live AI responses — with an instant interactive preview.",
    grad: "from-violet-100 to-violet-50",
    mock: <BuilderMock />,
  },
  {
    title: "Publish & Earn",
    body: "Ship it privately, to your members, or to the public marketplace. Offer it free, one-off or by subscription — and keep 85% of every sale.",
    grad: "from-emerald-100 to-emerald-50",
    mock: <MarketMock />,
  },
];

const COMMUNITY = [
  { label: "Anglers", icon: "🎣", grad: "from-teal-500 to-cyan-500" },
  { label: "Coaches", icon: "🏆", grad: "from-sky-500 to-blue-500" },
  { label: "Waterbody owners", icon: "💧", grad: "from-cyan-500 to-teal-500" },
  { label: "Fishing brands", icon: "🏷️", grad: "from-emerald-500 to-teal-500" },
  { label: "Influencers", icon: "📣", grad: "from-sky-500 to-indigo-500" },
  { label: "Match organisers", icon: "🥇", grad: "from-teal-500 to-emerald-500" },
  { label: "Charter captains", icon: "⚓", grad: "from-blue-500 to-cyan-500" },
  { label: "Tackle shops", icon: "🪝", grad: "from-cyan-600 to-sky-500" },
];

/* ---------- page ---------- */

export default async function Landing() {
  const [featureCount, creatorCount, agg, featuredRows] = await Promise.all([
    prisma.feature.count({ where: { status: "published" } }),
    prisma.creator.count(),
    prisma.feature.aggregate({ _sum: { installs: true }, where: { status: "published" } }),
    prisma.feature.findMany({
      where: { status: "published", visibility: "public" },
      orderBy: { installs: "desc" },
      take: 8,
      include: { creator: true, reviews: { select: { rating: true } } },
    }),
  ]);
  const installs = agg._sum.installs ?? 0;
  const featured = featuredRows.map(serializeFeature);
  const carouselItems = featured.map((f) => ({
    id: f.id,
    icon: f.icon,
    name: f.name,
    description: f.description,
    creatorName: f.creator?.name ?? "Unknown",
    creatorAvatar: f.creator?.avatar ?? "🎣",
    installs: f.installs,
    price: priceLabel(f.pricingType, f.priceCents),
    category: f.category,
    rating: f.rating,
    reviewCount: f.reviewCount,
  }));

  return (
    <div className="bg-white text-slate-900 overflow-x-hidden">
      {/* ============ HERO ============ */}
      <section className="relative">
        {/* sky gradient + optional atmospheric image */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-white" />
        <div className="absolute inset-0 opacity-40">
          <AppImage src="/images/hero-sky.jpg" alt="" rounded="rounded-none" className="h-full w-full" label="Sky / water backdrop" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />

        <div className="relative">
          <Nav />
          <div className="mx-auto max-w-7xl px-4 pt-14 md:pt-20 pb-8 text-center">
            <div className="flex justify-center animate-fade-up">
              <Pill>
                <span className="rounded-full bg-teal-500 px-1.5 text-[10px] font-bold text-white">NEW</span>
                Introducing the Fishinity Feature Builder
              </Pill>
            </div>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] text-slate-900 sm:text-5xl md:text-6xl animate-fade-up">
              Build fishing tools with AI in minutes
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg animate-fade-up">
              Describe the tool you want — a bait calculator, catch dashboard, trip planner or scoring
              system — and AI builds the first working version. Customise it visually, then publish it to
              the marketplace for free or for profit.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up">
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
              >
                Build my feature <span aria-hidden>→</span>
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <span aria-hidden>▶</span> Explore the marketplace
              </Link>
            </div>
          </div>

          {/* hero product shot */}
          <div className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
            <div className="relative animate-fade-up">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-teal-200/40 to-sky-200/40 blur-2xl" />
              <AppImage
                src="/images/hero-app.jpg"
                alt="A fishing catch dashboard built with the Fishinity Pro Feature Builder"
                className="relative w-full border border-white/70 shadow-2xl shadow-sky-900/10"
                rounded="rounded-2xl"
                label="Fishinity dashboard"
              />
              <div className="absolute -left-3 top-10 hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg animate-float">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-teal-100 text-teal-600 text-xs">⚡</span>
                <span className="text-xs font-medium text-slate-700">Generated in 4s</span>
              </div>
              <div
                className="absolute -right-3 bottom-12 hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg animate-float"
                style={{ animationDelay: "1.5s" }}
              >
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-sky-100 text-sky-600 text-xs">£</span>
                <span className="text-xs font-medium text-slate-700">You keep 85%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP (gradient marquee) ============ */}
      <section className="overflow-hidden border-y border-slate-100 bg-white py-9">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
          Built for the whole fishing community
        </p>
        <div className="marquee-mask mt-6 overflow-hidden">
          <div className="flex w-max animate-marquee">
            {[0, 1].map((group) => (
              <div key={group} className="flex shrink-0 gap-3.5 pr-3.5" aria-hidden={group === 1}>
                {COMMUNITY.map((r) => (
                  <span
                    key={r.label}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r ${r.grad} animate-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/5`}
                  >
                    <span className="text-base">{r.icon}</span>
                    {r.label}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>The builder</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Everything you need to build fishing tools
          </h2>
          <p className="mt-4 text-slate-600">
            From a plain-English idea to a published, revenue-earning product — without writing a line of code.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FEATURE_CARDS.map((c) => (
            <div key={c.title} className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className={`rounded-2xl bg-gradient-to-b ${c.grad} p-4`}>{c.mock}</div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-slate-900">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* stats */}
        <div className="mt-14 grid grid-cols-2 gap-6 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-8 md:grid-cols-4">
          {[
            { v: `${featureCount}`, l: "Features published" },
            { v: `${creatorCount}`, l: "Active creators" },
            { v: installs.toLocaleString(), l: "Tool installs" },
            { v: "85%", l: "Revenue you keep" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-3xl font-extrabold text-slate-900 md:text-4xl">{s.v}</div>
              <div className="mt-1 text-xs text-slate-500">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="bg-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              From idea to published in four steps
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {[
              { n: "01", t: "Describe", b: "Tell the AI what fishing tool you want in plain English." },
              { n: "02", t: "Generate", b: "AI produces a working first version instantly." },
              { n: "03", t: "Customise", b: "Refine blocks visually with a live interactive preview." },
              { n: "04", t: "Publish", b: "Ship it free or paid — and earn from every sale." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="font-display text-sm font-bold text-teal-600">{s.n}</div>
                <div className="mt-2 font-display text-lg font-bold text-slate-900">{s.t}</div>
                <p className="mt-1.5 text-sm text-slate-600">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DATA ENGINE ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionLabel>Fishinity data engine</SectionLabel>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Tools powered by real fishing data
            </h2>
            <p className="mt-4 text-slate-600">
              Approved features can plug into Fishinity data sources to give anglers genuinely useful,
              context-aware results — with permission controls that keep private angler data protected.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { i: "🎣", t: "Catch & session history", d: "Personalise results from an angler's own record." },
                { i: "🌤️", t: "Weather & conditions", d: "Factor temperature, pressure and wind into tools." },
                { i: "💧", t: "Waterbody data", d: "Swims, rules, stock and venue-specific information." },
                { i: "🌙", t: "Moon & species stats", d: "Blend solunar timing and species behaviour." },
              ].map((x) => (
                <li key={x.t} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-lg">{x.i}</span>
                  <div>
                    <div className="font-medium text-slate-900">{x.t}</div>
                    <div className="text-sm text-slate-600">{x.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* data card mockup */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-sky-100 to-teal-100 blur-2xl" />
            <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">💧</span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Rutland Water</div>
                  <div className="text-xs text-slate-500">Reservoir · connected source</div>
                </div>
              </div>
              <dl className="mt-4 divide-y divide-slate-100 text-sm">
                {[
                  ["Species", "12 available"],
                  ["Avg weight", "4.0 kg"],
                  ["Water temp", "14°C"],
                  ["Best window", "Dawn / dusk"],
                  ["+15 more attributes", ""],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2.5">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-medium text-slate-800">{v}</dd>
                  </div>
                ))}
              </dl>
              <button className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white">
                Connect data source
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MARKETPLACE PREVIEW ============ */}
      {featured.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-100">
          <div className="mx-auto max-w-7xl px-4 py-20 md:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <SectionLabel>Marketplace</SectionLabel>
              <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                Trending fishing tools
              </h2>
              <p className="mt-4 text-slate-600">
                Real tools built and published by the community — free and paid.
              </p>
            </div>
            <div className="mt-12">
              <FeatureCarousel items={carouselItems} />
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Browse all features <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============ TESTIMONIALS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Loved by anglers</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            A new kind of fishing technology
          </h2>
        </div>
        <div className="mt-12">
          <Testimonials />
        </div>
      </section>

      {/* ============ PRICING / MONETISE ============ */}
      <section id="pricing" className="bg-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Monetise</SectionLabel>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Turn your fishing know-how into a product
            </h2>
            <p className="mt-4 text-slate-600">
              Choose how anglers access your feature. Fishinity takes a flat 15% platform fee — you keep the rest.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { t: "Free", p: "£0", d: "Grow your audience and build a reputation as a creator.", cta: "Publish free" },
              { t: "One-off", p: "£4.99", d: "Charge a single price for lifetime access to your tool.", cta: "Sell one-off", featured: true },
              { t: "Subscription", p: "£1.99/mo", d: "Earn recurring revenue from premium, evolving tools.", cta: "Start a subscription" },
            ].map((tier) => (
              <div
                key={tier.t}
                className={`rounded-3xl border p-6 ${
                  tier.featured ? "border-teal-400 bg-white shadow-xl ring-1 ring-teal-200" : "border-slate-200 bg-white"
                }`}
              >
                {tier.featured && (
                  <div className="mb-3 inline-block rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                    Most popular
                  </div>
                )}
                <div className="font-display text-lg font-bold text-slate-900">{tier.t}</div>
                <div className="mt-1 font-display text-3xl font-extrabold text-slate-900">{tier.p}</div>
                <p className="mt-3 text-sm text-slate-600">{tier.d}</p>
                <Link
                  href="/builder"
                  className={`mt-5 block rounded-xl py-2.5 text-center text-sm font-semibold ${
                    tier.featured ? "bg-slate-900 text-white hover:bg-slate-800" : "border border-slate-300 text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">Questions, answered</h2>
        </div>
        <div className="mt-12">
          <Faq />
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-6 py-16 text-center md:py-20">
          <div className="absolute -right-20 -top-20 text-[240px] opacity-10 select-none">🐟</div>
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-sky-500/10" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold text-white sm:text-4xl">
              Build something that doesn&rsquo;t exist yet
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Create bespoke fishing features with AI, keep them private or publish them to the Fishinity
              Marketplace — and earn from every angler who uses them.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-teal-400 transition-colors"
              >
                Build my feature <span aria-hidden>→</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Open creator dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <SiteFooter />
    </div>
  );
}
