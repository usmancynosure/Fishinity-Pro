import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    const { author, rating, comment } = await req.json();
    const r = Math.max(1, Math.min(5, Math.round(Number(rating) || 0)));
    const review = await prisma.review.create({
      data: {
        featureId: id,
        author: (author || "Anonymous Angler").toString().slice(0, 60),
        rating: r,
        comment: (comment || "").toString().slice(0, 500),
      },
    });
    return NextResponse.json({
      review: {
        id: review.id,
        author: review.author,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Review failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
