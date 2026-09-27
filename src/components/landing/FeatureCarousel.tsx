"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export interface CarouselItem {
  id: string;
  icon: string;
  name: string;
  description: string;
  creatorName: string;
  creatorAvatar: string;
  installs: number;
  price: string;
  category: string;
  rating: number;
  reviewCount: number;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-amber-400 text-sm">
      {"★".repeat(full)}
      <span className="text-slate-300">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export function FeatureCarousel({ items }: { items: CarouselItem[] }) {
  const n = items.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((dir: number) => setIndex((i) => (i + dir + n) % n), [n]);

  useEffect(() => {
    if (paused || n <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 3500);
    return () => clearInterval(t);
  }, [paused, n]);

  if (n === 0) return null;

  return (
    <div className="select-none">
      <div
        className="relative mx-auto h-[380px] max-w-5xl [perspective:1200px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {items.map((item, i) => {
          // circular offset in [-n/2, n/2]
          let offset = i - index;
          if (offset > n / 2) offset -= n;
          if (offset < -n / 2) offset += n;

          const isCenter = offset === 0;
          const isSide = Math.abs(offset) === 1;
          const visible = isCenter || isSide;

          const style: React.CSSProperties = {
            transform: `translateX(-50%) translateX(${offset * 62}%) rotateY(${offset * -18}deg) scale(${
              isCenter ? 1 : 0.82
            })`,
            opacity: visible ? (isCenter ? 1 : 0.45) : 0,
            zIndex: isCenter ? 30 : 10,
            pointerEvents: visible ? "auto" : "none",
            filter: isCenter ? "none" : "saturate(0.7)",
          };

          return (
            <div
              key={item.id}
              className="absolute left-1/2 top-2 w-[300px] sm:w-[340px] transition-all duration-500 ease-out"
              style={style}
              onClick={() => !isCenter && setIndex(i)}
              aria-hidden={!isCenter}
            >
              <div
                className={`flex h-[340px] flex-col rounded-3xl border bg-white p-6 ${
                  isCenter ? "border-slate-200 shadow-2xl shadow-sky-900/10 cursor-default" : "border-slate-100 shadow-lg cursor-pointer"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-3xl">
                    {item.icon}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      item.price === "Free" ? "bg-teal-100 text-teal-700" : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {item.price}
                  </span>
                </div>
                <div className="mt-4 font-display text-xl font-bold text-slate-900">{item.name}</div>
                <div className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 line-clamp-3">
                  {item.description}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  {item.reviewCount > 0 ? (
                    <span className="flex items-center gap-1.5">
                      <Stars rating={item.rating} />
                      <span className="text-xs text-slate-400">({item.reviewCount})</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">New</span>
                  )}
                  <span className="text-xs text-slate-400">{item.installs} installs</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <span>{item.creatorAvatar}</span>
                    {item.creatorName}
                  </span>
                  {isCenter && (
                    <Link
                      href={`/feature/${item.id}`}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Open →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* controls */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => go(-1)}
          className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
          aria-label="Previous"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to card ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-teal-500" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
          aria-label="Next"
        >
          →
        </button>
      </div>
    </div>
  );
}
