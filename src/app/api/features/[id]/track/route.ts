import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

// POST { type: "view" | "install" | "run" } — record an analytics event + counter.
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    const { type } = await req.json();
    const t = ["view", "install", "run"].includes(type) ? type : "view";
    await prisma.event.create({ data: { featureId: id, type: t } });
    if (t === "view") await prisma.feature.update({ where: { id }, data: { views: { increment: 1 } } });
    if (t === "install") await prisma.feature.update({ where: { id }, data: { installs: { increment: 1 } } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
