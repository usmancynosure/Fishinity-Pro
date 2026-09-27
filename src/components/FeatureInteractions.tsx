"use client";

import { useEffect, useRef, useState } from "react";

export function TrackView({ id }: { id: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    fetch(`/api/features/${id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view" }),
    }).catch(() => {});
  }, [id]);
  return null;
}

export function InstallButton({ id, price }: { id: string; price: string }) {
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  async function install() {
    setBusy(true);
    await fetch(`/api/features/${id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "install" }),
    }).catch(() => {});
    setInstalled(true);
    setBusy(false);
  }
  if (installed) {
    return (
      <div className="px-5 py-2.5 rounded-xl font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30">
        ✓ Added to your tools
      </div>
    );
  }
  return (
    <button
      onClick={install}
      disabled={busy}
      className="px-5 py-2.5 rounded-xl font-semibold bg-teal-500 hover:bg-teal-400 text-ink-950 transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
    >
      {price === "Free" ? "Add to my tools" : `Get for ${price}`}
    </button>
  );
}

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export function Reviews({ id, initial }: { id: string; initial: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initial);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/features/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, rating, comment }),
    });
    const data = await res.json();
    if (data.review) {
      setReviews((r) => [data.review, ...r]);
      setComment("");
      setAuthor("");
      setRating(5);
    }
    setBusy(false);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="rounded-2xl border border-line bg-ink-850 p-5 space-y-3">
        <div className="text-sm font-medium text-white">Leave a review</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            className="rounded-lg bg-ink-900 border border-line px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
          />
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-2xl ${n <= rating ? "text-amber-400" : "text-slate-600"}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="How was this feature?"
          className="w-full rounded-lg bg-ink-900 border border-line px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none resize-none"
        />
        <button
          disabled={busy}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-500 hover:bg-teal-400 text-ink-950 disabled:opacity-50"
        >
          {busy ? "Posting…" : "Post review"}
        </button>
      </form>

      {reviews.length === 0 ? (
        <div className="text-sm text-slate-500">No reviews yet — be the first.</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-line bg-ink-850 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{r.author}</span>
                <span className="text-amber-400 text-sm">
                  {"★".repeat(r.rating)}
                  <span className="text-slate-600">{"★".repeat(5 - r.rating)}</span>
                </span>
              </div>
              {r.comment && <p className="text-sm text-slate-300 mt-1.5">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
