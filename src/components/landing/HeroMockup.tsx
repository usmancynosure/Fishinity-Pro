// A CSS recreation of the Fishinity Feature Builder UI, used as the hero shot.
// Rendered in markup (no image) so it stays crisp on every display.

function Dot({ c }: { c: string }) {
  return <span className={`h-2.5 w-2.5 rounded-full ${c}`} />;
}

function MiniBar({ h, active = false }: { h: number; active?: boolean }) {
  return (
    <div className="flex-1 flex items-end">
      <div
        className={`w-full rounded-t ${active ? "bg-teal-500" : "bg-teal-300"}`}
        style={{ height: `${h}%` }}
      />
    </div>
  );
}

export function HeroMockup() {
  return (
    <div className="relative">
      {/* glow */}
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-teal-200/40 to-sky-200/40 blur-2xl" />
      <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-sky-900/10 overflow-hidden">
        {/* window bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <Dot c="bg-rose-300" />
            <Dot c="bg-amber-300" />
            <Dot c="bg-emerald-300" />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>🎣</span> Fishinity Builder
          </div>
          <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500">
            <span>Testing mode</span>
            <span className="grid h-4 w-7 items-center rounded-full bg-teal-500 px-0.5">
              <span className="h-3 w-3 rounded-full bg-white justify-self-end" />
            </span>
          </div>
        </div>

        {/* body */}
        <div className="grid grid-cols-[150px_1fr] sm:grid-cols-[190px_1fr]">
          {/* left: prompt + blocks */}
          <div className="border-r border-slate-100 p-3 space-y-3 bg-white">
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-2">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-sky-700">✨ Describe</div>
              <div className="mt-1 text-[10px] leading-snug text-slate-500">
                &ldquo;A catch dashboard with species and best waters&rdquo;
              </div>
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Blocks</div>
            {[
              { i: "🔠", t: "Heading" },
              { i: "📊", t: "Stat tiles" },
              { i: "📈", t: "Chart" },
              { i: "📋", t: "Table" },
              { i: "✨", t: "AI response" },
            ].map((b, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[11px] ${
                  idx === 1 ? "border-teal-300 bg-teal-50 text-slate-800" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <span>{b.i}</span>
                <span className="flex-1">{b.t}</span>
                <span className="text-slate-300">⋮⋮</span>
              </div>
            ))}
            <button className="w-full rounded-lg border border-dashed border-slate-300 py-1.5 text-[11px] text-slate-500">
              + Add block
            </button>
          </div>

          {/* right: live preview */}
          <div className="p-4 bg-gradient-to-b from-white to-slate-50/60">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Live preview</span>
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎣</span>
                <div className="font-display text-sm font-bold text-slate-900">Catch Dashboard</div>
              </div>
              {/* KPIs */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[
                  { l: "Catches", v: "142", t: "+12%" },
                  { l: "Biggest", v: "8.4kg", t: "+4%" },
                  { l: "Top", v: "Bass" },
                  { l: "Days", v: "37", t: "-3%" },
                ].map((k, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                    <div className="text-[8px] text-slate-400">{k.l}</div>
                    <div className="text-[13px] font-bold text-slate-900 leading-tight">{k.v}</div>
                    {k.t && (
                      <div className={`text-[8px] ${k.t.startsWith("-") ? "text-rose-500" : "text-teal-600"}`}>{k.t}</div>
                    )}
                  </div>
                ))}
              </div>
              {/* chart */}
              <div className="mt-3 rounded-lg border border-slate-100 bg-white p-3">
                <div className="text-[10px] font-medium text-slate-600 mb-2">Catches by species</div>
                <div className="flex items-end gap-1.5 h-16">
                  <MiniBar h={90} active />
                  <MiniBar h={58} />
                  <MiniBar h={48} />
                  <MiniBar h={50} />
                  <MiniBar h={32} />
                </div>
                <div className="mt-1 flex justify-between text-[8px] text-slate-400">
                  <span>Bass</span>
                  <span>Pike</span>
                  <span>Trout</span>
                  <span>Carp</span>
                  <span>Perch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* floating chips */}
      <div className="absolute -left-4 top-16 hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg animate-float">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-teal-100 text-teal-600 text-xs">⚡</span>
        <span className="text-xs font-medium text-slate-700">Generated in 4s</span>
      </div>
      <div className="absolute -right-3 bottom-20 hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg animate-float" style={{ animationDelay: "1.5s" }}>
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-sky-100 text-sky-600 text-xs">£</span>
        <span className="text-xs font-medium text-slate-700">You keep 85%</span>
      </div>
    </div>
  );
}
