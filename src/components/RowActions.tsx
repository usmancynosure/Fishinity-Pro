"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function RowActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePublish() {
    setBusy(true);
    await fetch(`/api/features/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: status !== "published" }),
    });
    router.refresh();
    setBusy(false);
  }

  async function remove() {
    if (!confirm("Delete this feature? This cannot be undone.")) return;
    setBusy(true);
    await fetch(`/api/features/${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/builder?id=${id}`}
        className="px-2.5 py-1 rounded-md text-xs bg-ink-800 border border-line text-slate-200 hover:border-teal-500/50"
      >
        Edit
      </Link>
      {status === "published" && (
        <Link
          href={`/feature/${id}`}
          className="px-2.5 py-1 rounded-md text-xs bg-ink-800 border border-line text-slate-200 hover:border-teal-500/50"
        >
          View
        </Link>
      )}
      <button
        onClick={togglePublish}
        disabled={busy}
        className="px-2.5 py-1 rounded-md text-xs bg-ink-800 border border-line text-slate-200 hover:border-teal-500/50 disabled:opacity-50"
      >
        {status === "published" ? "Unpublish" : "Publish"}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className="px-2.5 py-1 rounded-md text-xs text-coral-400 hover:bg-ink-800 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
