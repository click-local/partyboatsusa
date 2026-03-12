import { db } from "@/lib/db";
import {
  operators,
  boats,
  boatSubmissions,
  bragBoardPhotos,
  claimRequests,
  membershipTiers,
  featureComparisonItems,
  featureTierValues,
  operatorContactLogs,
} from "@/lib/db/schema";
import { eq, and, desc, asc, isNull } from "drizzle-orm";

export async function getOperatorByAuthUserId(authUserId: string) {
  const result = await db
    .select()
    .from(operators)
    .leftJoin(membershipTiers, eq(operators.membershipTierId, membershipTiers.id))
    .where(eq(operators.authUserId, authUserId))
    .limit(1);

  if (result.length === 0) return null;
  return {
    ...result[0].operators,
    tier: result[0].membership_tiers,
  };
}

export async function getOperatorBoats(operatorId: number) {
  return db
    .select()
    .from(boats)
    .where(eq(boats.operatorId, operatorId))
    .orderBy(desc(boats.id));
}

export async function getOperatorBoatById(operatorId: number, boatId: number) {
  const result = await db
    .select()
    .from(boats)
    .where(and(eq(boats.id, boatId), eq(boats.operatorId, operatorId)))
    .limit(1);

  return result[0] ?? null;
}

export async function getOperatorSubmissions(operatorId: number) {
  return db
    .select()
    .from(boatSubmissions)
    .where(eq(boatSubmissions.operatorId, operatorId))
    .orderBy(desc(boatSubmissions.createdAt));
}

export async function getOperatorPendingPhotos(operatorId: number) {
  return db
    .select({
      photo: bragBoardPhotos,
      boatName: boats.name,
      boatSlug: boats.slug,
    })
    .from(bragBoardPhotos)
    .innerJoin(boats, eq(bragBoardPhotos.boatId, boats.id))
    .where(
      and(
        eq(boats.operatorId, operatorId),
        eq(bragBoardPhotos.status, "pending")
      )
    )
    .orderBy(desc(bragBoardPhotos.submittedAt));
}

export async function getOperatorClaimRequests(operatorId: number) {
  return db
    .select({
      claim: claimRequests,
      boatName: boats.name,
      boatSlug: boats.slug,
    })
    .from(claimRequests)
    .innerJoin(boats, eq(claimRequests.boatId, boats.id))
    .where(eq(claimRequests.operatorId, operatorId))
    .orderBy(desc(claimRequests.createdAt));
}

export async function getUnclaimedBoats() {
  return db
    .select()
    .from(boats)
    .where(and(isNull(boats.operatorId), eq(boats.isPublished, true)))
    .orderBy(asc(boats.name));
}

export async function getMembershipTiers() {
  return db
    .select()
    .from(membershipTiers)
    .orderBy(asc(membershipTiers.sortOrder));
}

export async function getFeatureComparison() {
  const features = await db
    .select()
    .from(featureComparisonItems)
    .where(eq(featureComparisonItems.isActive, true))
    .orderBy(asc(featureComparisonItems.sortOrder));

  const tierValues = await db.select().from(featureTierValues);

  const tiers = await getMembershipTiers();

  return { features, tierValues, tiers };
}

export async function logOperatorContact(data: {
  operatorId?: number;
  eventType: string;
  context?: Record<string, unknown>;
  sourceIp?: string;
  userAgent?: string;
  note?: string;
}) {
  await db.insert(operatorContactLogs).values({
    operatorId: data.operatorId ?? null,
    eventType: data.eventType,
    context: data.context ?? null,
    sourceIp: data.sourceIp ?? null,
    userAgent: data.userAgent ?? null,
    note: data.note ?? null,
  });
}
