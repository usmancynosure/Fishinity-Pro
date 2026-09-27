"use client";

import { useState } from "react";

// Renders the real image from /public/images if it exists, otherwise a labelled
// placeholder so the layout looks intentional before the (Gemini-generated)
// images are dropped in. See IMAGE_PROMPTS.md for the generation prompts.
export function AppImage({
  src,
  alt,
  className = "",
  rounded = "rounded-2xl",
  label,
}: {
  src: string;
  alt: string;
  className?: string;
  rounded?: string;
  label?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`grid place-items-center overflow-hidden bg-gradient-to-br from-sky-100 to-teal-100 text-slate-500 ${rounded} ${className}`}
        aria-label={alt}
        role="img"
      >
        <div className="text-center px-3">
          <svg className="mx-auto h-7 w-7 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <div className="mt-1 text-[11px] font-medium">{label ?? alt}</div>
          <div className="text-[10px] text-slate-400">{src.replace("/images/", "")}</div>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={`object-cover ${rounded} ${className}`} />;
}
