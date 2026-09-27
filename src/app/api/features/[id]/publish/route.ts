import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeFeature } from "@/lib/features";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

// POST — publish or unpublish a feature and set marketplace settings.
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    const body = await req.json();
    const existing = await prisma.feature.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const publish = body.publish !== false; // default true
    const data: Record<string, unknown> = {
      status: publish ? "published" : "draft",
      visibility: body.visibility || (publish ? "public" : "private"),
    };
    if (publish) data.publishedAt = existing.publishedAt ?? new Date();
    if (body.pricingType) data.pricingType = body.pricingType;
    if (body.priceCents !== undefined) data.priceCents = Math.max(0, Math.round(body.priceCents));

    const feature = await prisma.feature.update({
      where: { id },
      data,
      include: { creator: true, reviews: { select: { rating: true } } },
    });

    return NextResponse.json({ feature: serializeFeature(feature) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Publish failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
