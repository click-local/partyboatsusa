import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { operators, membershipTiers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type OperatorWithTier = {
  id: number;
  authUserId: string;
  email: string;
  companyName: string;
  contactName: string;
  phone: string | null;
  membershipTierId: number | null;
  tier: {
    id: number;
    name: string;
    showPhone: boolean;
    showEmail: boolean;
    showWebsite: boolean;
    showBookingUrl: boolean;
    showSocialMedia: boolean;
    displayBadge: boolean;
    badgeColor: string | null;
    searchBoost: number;
    showAnalytics: boolean;
    isHighestTier: boolean;
  } | null;
};

/**
 * Get the authenticated operator from the current Supabase session.
 * Returns null if not authenticated or not an operator.
 * Use in API routes and server components.
 */
export async function getOperator(): Promise<OperatorWithTier | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const role = user.user_metadata?.role;
  if (role !== "operator") return null;

  const result = await db
    .select({
      id: operators.id,
      authUserId: operators.authUserId,
      email: operators.email,
      companyName: operators.companyName,
      contactName: operators.contactName,
      phone: operators.phone,
      membershipTierId: operators.membershipTierId,
      tier: {
        id: membershipTiers.id,
        name: membershipTiers.name,
        showPhone: membershipTiers.showPhone,
        showEmail: membershipTiers.showEmail,
        showWebsite: membershipTiers.showWebsite,
        showBookingUrl: membershipTiers.showBookingUrl,
        showSocialMedia: membershipTiers.showSocialMedia,
        displayBadge: membershipTiers.displayBadge,
        badgeColor: membershipTiers.badgeColor,
        searchBoost: membershipTiers.searchBoost,
        showAnalytics: membershipTiers.showAnalytics,
        isHighestTier: membershipTiers.isHighestTier,
      },
    })
    .from(operators)
    .leftJoin(membershipTiers, eq(operators.membershipTierId, membershipTiers.id))
    .where(eq(operators.authUserId, user.id))
    .limit(1);

  if (result.length === 0) return null;

  return result[0] as OperatorWithTier;
}
