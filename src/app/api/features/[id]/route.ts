import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeFeature } from "@/lib/features";
import { normalizeSchema } from "@/lib/normalize";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const feature = await prisma.feature.findUnique({
    where: { id },
    include: {
      creator: true,
      reviews: { orderBy: { createdAt: "desc" } },
      versions: { orderBy: { version: "desc" } },
    },
  });
  if (!feature) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    feature: serializeFeature(feature),
    reviews: feature.reviews.map((r) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    })),
    versions: feature.versions.map((v) => ({
      version: v.version,
      note: v.note,
      createdAt: v.createdAt.toISOString(),
    })),
  });
}

// PATCH — update schema and/or monetization/visibility metadata.
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    const body = await req.json();
    const existing = await prisma.feature.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    let newVersion = existing.version;

    if (body.schema) {
      const schema = normalizeSchema(body.schema);
      const changed = JSON.stringify(schema) !== existing.schema;
      data.schema = JSON.stringify(schema);
      data.name = schema.name;
      data.description = schema.description;
      data.category = schema.category;
      data.icon = schema.icon;
      if (changed) {
        newVersion = existing.version + 1;
        data.version = newVersion;
      }
    }
    if (body.pricingType) data.pricingType = body.pricingType;
    if (body.priceCents !== undefined) data.priceCents = Math.max(0, Math.round(body.priceCents));
    if (body.visibility) data.visibility = body.visibility;

    const feature = await prisma.feature.update({
      where: { id },
      data,
      include: { creator: true, reviews: { select: { rating: true } } },
    });

    if (data.schema && newVersion > existing.version) {
      await prisma.featureVersion.create({
        data: {
          featureId: id,
          version: newVersion,
          schema: data.schema as string,
          note: body.versionNote || `Edited in builder`,
        },
      });
    }

    return NextResponse.json({ feature: serializeFeature(feature) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    await prisma.feature.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
