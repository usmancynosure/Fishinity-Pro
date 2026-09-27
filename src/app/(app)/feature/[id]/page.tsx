import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { serializeFeature, priceLabel } from "@/lib/features";
import FeatureRenderer from "@/components/FeatureRenderer";
import { TrackView, InstallButton, Reviews } from "@/components/FeatureInteractions";

export const dynamic = "force-dynamic";

export default async function FeaturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await prisma.feature.findUnique({
    where: { id },
    include: {
      creator: true,
      reviews: { orderBy: { createdAt: "desc" } },
      versions: { orderBy: { version: "desc" } },
    },
  });
  if (!row) notFound();

  const feature = serializeFeature(row);
  const price = priceLabel(feature.pricingType, feature.priceCents);
  const reviews = row.reviews.map((r) => ({
    id: r.id,
    author: r.author,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <TrackView id={feature.id} />

      <Link href="/marketplace" className="text-sm text-slate-400 hover:text-teal-300">
        ← Back to marketplace
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-line bg-gradient-to-br from-ink-900 to-ink-850 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <span className="grid place-items-center h-16 w-16 rounded-2xl bg-ink-800 border border-line text-4xl">
              {feature.icon}
            </span>
            <div>
              <h1 className="text-3xl font-bold text-white">{feature.name}</h1>
              <p className="text-slate-300 mt-1 max-w-xl">{feature.description}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span>{feature.creator?.avatar}</span>
                  {feature.creator?.name}
                </span>
                <span className="rounded-md bg-ink-900 px-2 py-0.5 text-xs">{feature.category}</span>
                {feature.reviewCount > 0 && (
                  <span className="text-amber-400">
                    {feature.rating} ★ <span className="text-slate-500">({feature.reviewCount})</span>
                  </span>
                )}
                <span className="text-slate-500">{feature.installs} installs</span>
                <span className="text-slate-500">v{feature.version}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-2xl font-bold text-white">{price}</div>
            <InstallButton id={feature.id} price={price} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Running feature */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Live tool</h2>
          <div className="rounded-2xl border border-line bg-gradient-to-b from-ink-900 to-ink-850 p-5 md:p-6">
            <FeatureRenderer schema={feature.schema} featureId={feature.id} />
          </div>

          <h2 className="text-lg font-semibold text-white pt-4">Reviews</h2>
          <Reviews id={feature.id} initial={reviews} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-ink-850 p-5">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">About the creator</div>
            <div className="flex items-center gap-3">
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-ink-800 border border-line text-xl">
                {feature.creator?.avatar}
              </span>
              <div>
                <div className="text-white font-medium">{feature.creator?.name}</div>
                <div className="text-xs text-slate-500">@{feature.creator?.handle}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-ink-850 p-5">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Version history</div>
            <div className="space-y-2.5">
              {row.versions.map((v) => (
                <div key={v.version} className="flex items-center justify-between text-sm">
                  <span className="text-slate-200">v{v.version}</span>
                  <span className="text-slate-500 text-xs">{v.note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-ink-850 p-5">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Details</div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Category</dt>
                <dd className="text-slate-200">{feature.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Pricing</dt>
                <dd className="text-slate-200 capitalize">{feature.pricingType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Blocks</dt>
                <dd className="text-slate-200">{feature.schema.blocks.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
