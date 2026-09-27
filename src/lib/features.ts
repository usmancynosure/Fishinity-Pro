import { prisma } from "./db";
import { normalizeSchema } from "./normalize";
import type { FeatureSchema } from "./types";

// The demo has no auth — "you" are a fixed seeded creator.
export const CURRENT_CREATOR_HANDLE = "you";

export async function getCurrentCreator() {
  let creator = await prisma.creator.findUnique({ where: { handle: CURRENT_CREATOR_HANDLE } });
  if (!creator) {
    creator = await prisma.creator.create({
      data: {
        handle: CURRENT_CREATOR_HANDLE,
        name: "You (Demo Creator)",
        avatar: "🧑‍💻",
        bio: "Building fishing tools with the Fishinity AI Feature Builder.",
      },
    });
  }
  return creator;
}

type FeatureWithRelations = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  schema: string;
  status: string;
  visibility: string;
  pricingType: string;
  priceCents: number;
  version: number;
  views: number;
  installs: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  creator?: { id: string; name: string; handle: string; avatar: string } | null;
  reviews?: { rating: number }[];
};

export interface FeatureDTO {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  schema: FeatureSchema;
  status: string;
  visibility: string;
  pricingType: string;
  priceCents: number;
  version: number;
  views: number;
  installs: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  creator: { id: string; name: string; handle: string; avatar: string } | null;
}

export function serializeFeature(f: FeatureWithRelations): FeatureDTO {
  const reviews = f.reviews ?? [];
  const rating = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  let schema: FeatureSchema;
  try {
    schema = normalizeSchema(JSON.parse(f.schema));
  } catch {
    schema = { name: f.name, description: f.description, category: f.category, icon: f.icon, blocks: [] };
  }
  return {
    id: f.id,
    name: f.name,
    description: f.description,
    category: f.category,
    icon: f.icon,
    schema,
    status: f.status,
    visibility: f.visibility,
    pricingType: f.pricingType,
    priceCents: f.priceCents,
    version: f.version,
    views: f.views,
    installs: f.installs,
    rating: Math.round(rating * 10) / 10,
    reviewCount: reviews.length,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
    publishedAt: f.publishedAt ? f.publishedAt.toISOString() : null,
    creator: f.creator
      ? { id: f.creator.id, name: f.creator.name, handle: f.creator.handle, avatar: f.creator.avatar }
      : null,
  };
}

export function priceLabel(pricingType: string, priceCents: number): string {
  if (pricingType === "free") return "Free";
  const price = `$${(priceCents / 100).toFixed(2)}`;
  return pricingType === "subscription" ? `${price}/mo` : price;
}
