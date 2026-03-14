import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { claimRequests, boats, operators } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  adminGetClaimRequests,
  adminApproveClaim,
  adminRejectClaim,
} from "@/lib/db/queries/admin";
import { Resend } from "resend";
import { buildClaimResultEmail } from "@/lib/email/templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "PartyBoatsUSA <noreply@notifications.partyboatsusa.com>";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;

  const claims = await adminGetClaimRequests();
  return NextResponse.json(claims);
}

export async function PUT(request: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;

  const body = await request.json();
  const { claimId, action } = body as { claimId: number; action: "approve" | "reject" };

  if (!claimId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Get claim details before acting (for the email)
  const [claim] = await db
    .select({
      operatorId: claimRequests.operatorId,
      boatId: claimRequests.boatId,
    })
    .from(claimRequests)
    .where(eq(claimRequests.id, claimId))
    .limit(1);

  if (!claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  const result =
    action === "approve"
      ? await adminApproveClaim(claimId)
      : await adminRejectClaim(claimId);

  if (!result) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }

  // Send email to operator (fire-and-forget)
  const [operator] = await db
    .select({ email: operators.email })
    .from(operators)
    .where(eq(operators.id, claim.operatorId))
    .limit(1);

  const [boat] = await db
    .select({ name: boats.name, slug: boats.slug })
    .from(boats)
    .where(eq(boats.id, claim.boatId))
    .limit(1);

  if (operator && boat) {
    const html = buildClaimResultEmail({
      boatName: boat.name,
      boatSlug: boat.slug,
      approved: action === "approve",
    });

    resend.emails
      .send({
        from: EMAIL_FROM,
        to: [operator.email],
        subject: action === "approve"
          ? `Claim Approved: ${boat.name}`
          : `Claim Update: ${boat.name}`,
        html,
      })
      .catch(() => {});
  }

  return NextResponse.json(result);
}
