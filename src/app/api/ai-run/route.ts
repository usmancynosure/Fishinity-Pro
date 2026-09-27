import { NextResponse } from "next/server";
import { runAiBlock } from "@/lib/ai";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, values, featureId } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "A prompt is required." }, { status: 400 });
    }
    const result = await runAiBlock(prompt, values || {});
    if (featureId && typeof featureId === "string") {
      // Best-effort analytics; ignore failures (e.g. unsaved draft ids).
      prisma.event.create({ data: { featureId, type: "ai_run" } }).catch(() => {});
    }
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI run failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
