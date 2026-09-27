import Link from "next/link";
import { prisma } from "@/lib/db";
import { serializeFeature, priceLabel } from "@/lib/features";
import { FeatureCard } from "@/components/FeatureCard";
import { CATEGORIES } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATS = ["All", ...CATEGORIES];

export default async function Marketplace({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category || "All";
  const q = sp.q || "";
  const sort = sp.sort || "popular";

  const where: Record<string, unknown> = { status: "published", visibility: "public" };
  if (category !== "All") where.category = category;
  if (q) where.OR = [{ name: { contains: q } }, { description: { contains: q } }];

  const orderBy =
    sort === "recent" ? { publishedAt: "desc" as const } : { installs: "desc" as const };

  const rows = await prisma.feature.findMany({
    where,
    orderBy,
    include: { creator: true, reviews: { select: { rating: true } } },
  });
  const features = rows.map(serializeFeature);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Feature Marketplace</h1>
          <p className="text-slate-400 mt-1">Discover fishing tools built by the community.</p>
        </div>
        <form className="flex gap-2" action="/marketplace">
          {category !== "All" && <input type="hidden" name="category" value={category} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search features…"
            className="rounded-lg bg-ink-850 border border-line px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none w-56"
          />
          <button className="px-3 py-2 rounded-lg bg-ink-800 border border-line text-sm text-slate-200 hover:border-teal-500/50">
            Search
          </button>
        </form>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {CATS.map((c) => {
          const params = new URLSearchParams();
          if (c !== "All") params.set("category", c);
          if (q) params.set("q", q);
          const active = c === category;
          return (
            <Link
              key={c}
              href={`/marketplace${params.toString() ? "?" + params.toString() : ""}`}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                active
                  ? "bg-teal-500 text-ink-950 border-teal-400 font-medium"
                  : "bg-ink-850 text-slate-300 border-line hover:border-teal-500/50"
              }`}
            >
              {c}
            </Link>
          );
        })}
      </div>

      {features.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-ink-850 p-12 text-center">
          <div className="text-5xl mb-3">🎣</div>
          <div className="text-white font-medium">No features here yet</div>
          <p className="text-slate-400 text-sm mt-1">
            Be the first —{" "}
            <Link href="/builder" className="text-teal-300 hover:text-teal-200">
              build one with AI
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f) => (
            <FeatureCard key={f.id} feature={f} priceLabel={priceLabel(f.pricingType, f.priceCents)} />
          ))}
        </div>
      )}
    </div>
  );
}
