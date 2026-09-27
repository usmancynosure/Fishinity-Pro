import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentCreator, serializeFeature, priceLabel } from "@/lib/features";
import { RowActions } from "@/components/RowActions";

export const dynamic = "force-dynamic";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-ink-850 p-5">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-bold text-white tabular-nums">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

export default async function Dashboard() {
  const creator = await getCurrentCreator();
  const rows = await prisma.feature.findMany({
    where: { creatorId: creator.id },
    orderBy: { updatedAt: "desc" },
    include: { creator: true, reviews: { select: { rating: true } } },
  });
  const features = rows.map(serializeFeature);

  const totalInstalls = features.reduce((a, f) => a + f.installs, 0);
  const totalViews = features.reduce((a, f) => a + f.views, 0);
  const published = features.filter((f) => f.status === "published").length;
  const rated = features.filter((f) => f.reviewCount > 0);
  const avgRating = rated.length ? rated.reduce((a, f) => a + f.rating, 0) / rated.length : 0;

  // Estimated monthly revenue after the 15% platform fee.
  const grossRevenue = features.reduce((a, f) => {
    if (f.pricingType === "free") return a;
    return a + (f.priceCents / 100) * f.installs;
  }, 0);
  const netRevenue = grossRevenue * 0.85;

  const conversion = totalViews > 0 ? (totalInstalls / totalViews) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center h-12 w-12 rounded-2xl bg-ink-800 border border-line text-2xl">
            {creator.avatar}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
            <p className="text-slate-400 text-sm">
              {creator.name} · @{creator.handle}
            </p>
          </div>
        </div>
        <Link
          href="/builder"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-ink-950 shadow-lg shadow-teal-500/20"
        >
          + New feature
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Published" value={String(published)} sub={`${features.length} total`} />
        <StatCard label="Total installs" value={totalInstalls.toLocaleString()} />
        <StatCard label="Total views" value={totalViews.toLocaleString()} sub={`${conversion.toFixed(1)}% conversion`} />
        <StatCard label="Avg rating" value={avgRating ? avgRating.toFixed(1) + " ★" : "—"} />
        <StatCard label="Est. net revenue" value={`$${netRevenue.toFixed(2)}`} sub="after 15% fee" />
      </div>

      {/* Features table */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">My features</h2>
        {features.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-ink-850 p-12 text-center">
            <div className="text-5xl mb-3">🛠️</div>
            <div className="text-white font-medium">No features yet</div>
            <p className="text-slate-400 text-sm mt-1">
              <Link href="/builder" className="text-teal-300 hover:text-teal-200">
                Build your first feature with AI
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-ink-850 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-line">
                    <th className="px-4 py-3 font-medium">Feature</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">v</th>
                    <th className="px-4 py-3 font-medium text-right">Views</th>
                    <th className="px-4 py-3 font-medium text-right">Installs</th>
                    <th className="px-4 py-3 font-medium text-right">Rating</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((f) => (
                    <tr key={f.id} className="border-b border-line/50 last:border-0 hover:bg-ink-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{f.icon}</span>
                          <div>
                            <div className="text-white font-medium">{f.name}</div>
                            <div className="text-xs text-slate-500">{f.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            f.status === "published" ? "bg-teal-500/15 text-teal-300" : "bg-ink-800 text-slate-400"
                          }`}
                        >
                          {f.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{priceLabel(f.pricingType, f.priceCents)}</td>
                      <td className="px-4 py-3 text-slate-400 tabular-nums">v{f.version}</td>
                      <td className="px-4 py-3 text-right text-slate-300 tabular-nums">{f.views}</td>
                      <td className="px-4 py-3 text-right text-slate-300 tabular-nums">{f.installs}</td>
                      <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                        {f.reviewCount ? `${f.rating} ★` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <RowActions id={f.id} status={f.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
