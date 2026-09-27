# Fishinity Pro — AI Feature Marketplace (demo)

A working prototype of the **Special Fishinity Pro Module**: an AI-powered, no-code
**Feature Builder** and a **marketplace** where creators publish fishing tools —
free or paid — and earn from users.

Built to match the target stack: **React / Next.js** frontend, **Node** backend
(Next.js route handlers), **SQL** database (Prisma + SQLite), and an LLM for
generation (**Google Gemini**, with a local fallback engine so it always runs).

---

## The core flow

1. **Describe** — a creator types what they want in plain English
   (e.g. *"a bait calculator based on session length and rods"*).
2. **Generate** — the AI returns a working feature as a structured JSON definition
   (`/api/generate` → Gemini → validated & repaired into a safe schema).
3. **Customise** — a visual builder lets you add / reorder / edit / delete blocks
   with a **live interactive preview** beside it.
4. **Publish** — set visibility (public/private) and pricing (free / one-off /
   subscription); it lands in the marketplace with versioning.
5. **Use & review** — anyone can run the tool (calculators compute, AI blocks call
   the model live), install it, and leave ratings/reviews.
6. **Manage** — a creator dashboard shows installs, views, conversion, ratings and
   estimated revenue.

## Supported feature blocks (the no-code primitives)

Text, headings, images, dividers · **stat-tile rows** · **inputs** (number / text /
select) · **calculators** (safe arithmetic formulas referencing input keys) ·
**charts** (bar / line, hand-rendered SVG) · **tables** · **scoring systems**
(weighted questions → result bands) · **AI-response blocks** (runtime prompts with
`{{input}}` interpolation) · buttons.

This covers the builder capabilities named in the brief: text/images/buttons/
dropdowns/forms, charts and tables, calculators and scoring systems, AI responses,
and preview/testing.

---

## Run it

```bash
npm install
cp .env.example .env        # then add your GEMINI_API_KEY (optional)
npm run setup               # prisma db push + seed the marketplace
npm run dev                 # http://localhost:3000
```

- **`GEMINI_API_KEY`** enables live AI generation (get one at
  https://aistudio.google.com/apikey — standard keys start with `AIza`). Without a
  valid key the builder transparently falls back to a local template engine, so the
  full demo still works offline. Auth mode (API key vs OAuth bearer) is
  auto-detected.
- Override the model with `GEMINI_MODEL` (default `gemini-2.0-flash`).

---

## Architecture

```
src/
  app/
    page.tsx                 Landing (hero, how-it-works, featured)
    builder/                 AI Feature Builder + visual editor + live preview
    marketplace/             Browse / search / filter published features
    dashboard/               Creator analytics & feature management
    feature/[id]/            Public feature page: run it, reviews, versions
    api/
      generate/              POST prompt -> Gemini -> validated FeatureSchema
      ai-run/                POST runtime AI-response block execution
      features/              CRUD + list (scope: marketplace | mine)
      features/[id]/publish  Publish / unpublish + pricing
      features/[id]/review   Ratings & reviews
      features/[id]/track    View / install analytics events
  lib/
    types.ts                 The FeatureSchema / Block contract
    ai.ts                    Gemini client + generation + graceful fallback
    normalize.ts             Validate & repair any generated JSON into a safe schema
    formula.ts               Safe arithmetic evaluator (tokenizer + shunting-yard,
                             NO eval — untrusted AI/user formulas can't run code)
    mockEngine.ts            Keyword-driven local generator (offline fallback)
    db.ts / features.ts      Prisma client + DTO serialization
  components/
    FeatureRenderer.tsx      Runs a feature (inputs, calculators, charts, scoring, AI)
    BlockEditor.tsx          Per-block-type visual editors
    FeatureCard / RowActions / FeatureInteractions
prisma/
  schema.prisma            Creator, Feature, FeatureVersion, Review, Event
  seed.ts                  Sample creators + published features + reviews
```

### Notable engineering choices

- **AI output is never trusted blindly.** Generated JSON is run through
  `normalize.ts`, which coerces types, fills defaults, assigns IDs, and drops
  invalid blocks — so a malformed model response degrades gracefully instead of
  crashing the renderer.
- **Formulas are evaluated safely** with a custom tokenizer + shunting-yard RPN
  evaluator (`formula.ts`) — no `eval`/`Function`, so creator- or AI-authored
  calculator expressions can't execute arbitrary code.
- **Provider-agnostic AI layer** with automatic auth-mode detection and a local
  fallback, so the demo is bulletproof for a live walkthrough.
- **Versioning** is captured on every schema-changing save (`FeatureVersion`).
- **SQL schema is portable** — swap the Prisma provider from `sqlite` to
  `postgres`/`mysql` for production with no model changes.

---

## What this demonstrates for the role

- AI-driven **dynamic feature generation** from natural language.
- A **no-code / low-code visual builder** with a real interactive runtime.
- **Marketplace systems**: publishing, pricing/subscriptions, ratings, analytics,
  versioning, creator profiles.
- End-to-end ownership across **Next.js + Node + SQL** with clean, typed code.
