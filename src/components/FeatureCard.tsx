import Link from "next/link";
import type { FeatureDTO } from "@/lib/features";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-amber-400" title={`${rating} / 5`}>
      {"★".repeat(full)}
      <span className="text-slate-600">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export function FeatureCard({
  feature,
  priceLabel,
  href,
}: {
  feature: FeatureDTO;
  priceLabel: string;
  href?: string;
}) {
  return (
    <Link
      href={href ?? `/feature/${feature.id}`}
      className="group flex flex-col rounded-2xl border border-line bg-ink-850 hover:border-teal-500/50 hover:bg-ink-800 p-5 transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <div className="grid place-items-center h-11 w-11 rounded-xl bg-ink-800 border border-line text-2xl">
          {feature.icon}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            priceLabel === "Free"
              ? "bg-teal-500/15 text-teal-300"
              : "bg-coral-500/15 text-coral-400"
          }`}
        >
          {priceLabel}
        </span>
      </div>
      <div className="mt-3 font-semibold text-white group-hover:text-teal-200 transition-colors">
        {feature.name}
      </div>
      <div className="mt-1 text-sm text-slate-400 line-clamp-2 flex-1">{feature.description}</div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span>{feature.creator?.avatar ?? "🎣"}</span>
          <span>{feature.creator?.name ?? "Unknown"}</span>
        </span>
        <span className="rounded-md bg-ink-900 px-2 py-0.5">{feature.category}</span>
      </div>
      <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
        {feature.reviewCount > 0 ? (
          <span className="flex items-center gap-1.5">
            <Stars rating={feature.rating} />
            <span className="text-slate-500">({feature.reviewCount})</span>
          </span>
        ) : (
          <span className="text-slate-600">No reviews yet</span>
        )}
        <span className="text-slate-500">{feature.installs} installs</span>
      </div>
    </Link>
  );
}
