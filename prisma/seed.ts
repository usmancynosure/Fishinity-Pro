import { PrismaClient } from "@prisma/client";
import { mockGenerate } from "../src/lib/mockEngine";
import type { FeatureSchema } from "../src/lib/types";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Fishinity Pro marketplace…");

  // Wipe (dev only)
  await prisma.event.deleteMany();
  await prisma.review.deleteMany();
  await prisma.featureVersion.deleteMany();
  await prisma.feature.deleteMany();
  await prisma.creator.deleteMany();

  const creators = await Promise.all([
    prisma.creator.create({
      data: { handle: "you", name: "You (Demo Creator)", avatar: "🧑‍💻", bio: "Building fishing tools with the AI Feature Builder." },
    }),
    prisma.creator.create({
      data: { handle: "riverkelly", name: "River Kelly", avatar: "🎣", bio: "Match angler & guide, UK rivers." },
    }),
    prisma.creator.create({
      data: { handle: "captainmike", name: "Captain Mike", avatar: "⚓", bio: "Saltwater charters & tournament pro." },
    }),
    prisma.creator.create({
      data: { handle: "coachsam", name: "Coach Sam", avatar: "🏆", bio: "Fishing coach helping beginners land more fish." },
    }),
  ]);

  const [you, kelly, mike, sam] = creators;

  type Seed = {
    prompt: string;
    creatorId: string;
    status: string;
    visibility: string;
    pricingType: string;
    priceCents: number;
    views: number;
    installs: number;
    reviews: { author: string; rating: number; comment: string }[];
  };

  const seeds: Seed[] = [
    {
      prompt: "A catch dashboard showing species, biggest fish and best waterbodies",
      creatorId: kelly.id,
      status: "published",
      visibility: "public",
      pricingType: "free",
      priceCents: 0,
      views: 1240,
      installs: 312,
      reviews: [
        { author: "Dave P.", rating: 5, comment: "Love seeing my season at a glance. The species chart is spot on." },
        { author: "Nina", rating: 4, comment: "Great free tool. Would love weather overlay next." },
      ],
    },
    {
      prompt: "A bait quantity calculator based on session length and rods",
      creatorId: kelly.id,
      status: "published",
      visibility: "public",
      pricingType: "oneoff",
      priceCents: 299,
      views: 860,
      installs: 174,
      reviews: [
        { author: "Tom H.", rating: 5, comment: "No more over-buying bait. Paid for itself in one session." },
      ],
    },
    {
      prompt: "A trip planner that suggests tactics for target species and conditions",
      creatorId: mike.id,
      status: "published",
      visibility: "public",
      pricingType: "subscription",
      priceCents: 499,
      views: 2010,
      installs: 421,
      reviews: [
        { author: "Sarah L.", rating: 5, comment: "The AI plans are genuinely useful. Worth the sub." },
        { author: "Gaz", rating: 5, comment: "Nailed the pike tactics for a cold front." },
        { author: "Ben", rating: 4, comment: "Solid. Sometimes the plan is a bit generic." },
      ],
    },
    {
      prompt: "A scoring tool that rates today's bite conditions from weather",
      creatorId: mike.id,
      status: "published",
      visibility: "public",
      pricingType: "free",
      priceCents: 0,
      views: 640,
      installs: 156,
      reviews: [{ author: "Ellie", rating: 4, comment: "Fun and surprisingly accurate." }],
    },
    {
      prompt: "A questionnaire to build an angler's coaching profile",
      creatorId: sam.id,
      status: "published",
      visibility: "public",
      pricingType: "oneoff",
      priceCents: 999,
      views: 430,
      installs: 88,
      reviews: [
        { author: "Marco", rating: 5, comment: "Great intake form for my coaching clients." },
      ],
    },
    // A draft owned by "you" so the dashboard shows a mix.
    {
      prompt: "A bait calculator prototype",
      creatorId: you.id,
      status: "draft",
      visibility: "private",
      pricingType: "free",
      priceCents: 0,
      views: 0,
      installs: 0,
      reviews: [],
    },
  ];

  for (const s of seeds) {
    const schema: FeatureSchema = mockGenerate(s.prompt);
    const feature = await prisma.feature.create({
      data: {
        name: schema.name,
        description: schema.description,
        category: schema.category,
        icon: schema.icon,
        schema: JSON.stringify(schema),
        status: s.status,
        visibility: s.visibility,
        pricingType: s.pricingType,
        priceCents: s.priceCents,
        views: s.views,
        installs: s.installs,
        creatorId: s.creatorId,
        publishedAt: s.status === "published" ? new Date() : null,
        version: 1,
      },
    });
    await prisma.featureVersion.create({
      data: { featureId: feature.id, version: 1, schema: JSON.stringify(schema), note: "Initial version" },
    });
    for (const r of s.reviews) {
      await prisma.review.create({ data: { featureId: feature.id, ...r } });
    }
  }

  console.log(`Seeded ${seeds.length} features across ${creators.length} creators.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
