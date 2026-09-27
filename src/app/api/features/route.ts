import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentCreator, serializeFeature } from "@/lib/features";
import { normalizeSchema } from "@/lib/normalize";

export const runtime = "nodejs";

// GET /api/features?scope=marketplace|mine&category=&q=&sort=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || "marketplace";
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const sort = searchParams.get("sort") || "popular";

  const where: Record<string, unknown> = {};
  if (scope === "mine") {
    const creator = await getCurrentCreator();
    where.creatorId = creator.id;
  } else {
    where.status = "published";
    where.visibility = "public";
  }
  if (category && category !== "All") where.category = category;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const orderBy =
    sort === "recent"
      ? { updatedAt: "desc" as const }
      : sort === "rating"
      ? { installs: "desc" as const }
      : { installs: "desc" as const };

  const features = await prisma.feature.findMany({
    where,
    orderBy,
    include: { creator: true, reviews: { select: { rating: true } } },
  });

  return NextResponse.json({ features: features.map(serializeFeature) });
}

// POST /api/features  — create a new draft feature
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const schema = normalizeSchema(body.schema);
    const creator = await getCurrentCreator();

    const feature = await prisma.feature.create({
      data: {
        name: schema.name,
        description: schema.description,
        category: schema.category,
        icon: schema.icon,
        schema: JSON.stringify(schema),
        status: "draft",
        visibility: "private",
        creatorId: creator.id,
      },
      include: { creator: true, reviews: { select: { rating: true } } },
    });

    await prisma.featureVersion.create({
      data: { featureId: feature.id, version: 1, schema: JSON.stringify(schema), note: "Initial version" },
    });

    return NextResponse.json({ feature: serializeFeature(feature) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
