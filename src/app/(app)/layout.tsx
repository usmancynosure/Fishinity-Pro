import Link from "next/link";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-ink-800 transition-colors"
    >
      {children}
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-dark min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line/70 backdrop-blur-xl bg-ink-950/70">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-sky-400 text-ink-950 text-lg shadow-lg shadow-teal-500/20">
              🎣
            </span>
            <div className="leading-tight">
              <div className="font-semibold text-white tracking-tight">Fishinity Pro</div>
              <div className="text-[10px] uppercase tracking-widest text-teal-300/80">Feature Marketplace</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink href="/builder">AI Builder</NavLink>
            <NavLink href="/marketplace">Marketplace</NavLink>
            <NavLink href="/dashboard">Creator Dashboard</NavLink>
            <Link
              href="/builder"
              className="ml-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-teal-500 hover:bg-teal-400 text-ink-950 transition-colors shadow-lg shadow-teal-500/20"
            >
              + New Feature
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
      <footer className="border-t border-line/60 mt-16">
        <div className="mx-auto max-w-7xl px-5 py-8 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
          <span>Fishinity Pro · Special Fishinity Pro Module — Feature Marketplace demo</span>
          <span>Next.js · Node · SQL (Prisma/SQLite) · Google Gemini</span>
        </div>
      </footer>
    </div>
  );
}
