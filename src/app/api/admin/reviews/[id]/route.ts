import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminUpdateReview, adminDeleteReview } from "@/lib/db/queries/admin";
import { db } from "@/lib/db";
import { reviews, boats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { buildReviewNotificationEmail } from "@/lib/email/templates";
import { getBoatNotificationRecipient } from "@/lib/email/send-notification";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "PartyBoatsUSA <noreply@notifications.partyboatsusa.com>";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();

  // Check if this is an approval action
  const isApproving = body.status === "approved";

  // Get review details before updating (for the email)
  let reviewData: { boatId: number; userName: string; rating: number; title: string; comment: string } | null = null;
  if (isApproving) {
    const [r] = await db.select().from(reviews).where(eq(reviews.id, Number(id))).limit(1);
    if (r) reviewData = { boatId: r.boatId, userName: r.userName, rating: r.rating, title: r.title, comment: r.comment };
  }

  const review = await adminUpdateReview(Number(id), body);

  // Send notification to operator/boat email on approval
  if (isApproving && reviewData) {
    const [boat] = await db
      .select({ name: boats.name, slug: boats.slug })
      .from(boats)
      .where(eq(boats.id, reviewData.boatId))
      .limit(1);

    if (boat) {
      const recipient = await getBoatNotificationRecipient(reviewData.boatId);
      const to: string[] = [];
      if (recipient.operatorEmail) to.push(recipient.operatorEmail);
      else if (recipient.boatEmail) to.push(recipient.boatEmail);

      if (to.length > 0) {
        const html = buildReviewNotificationEmail({
          boatName: boat.name,
          boatSlug: boat.slug,
          boatId: reviewData.boatId,
          reviewerName: reviewData.userName,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          isClaimed: recipient.isClaimed,
        });

        resend.emails
          .send({
            from: EMAIL_FROM,
            to,
            subject: `New Review Approved: ${boat.name} - ${reviewData.rating}★`,
            html,
          })
          .catch(() => {});
      }
    }
  }

  return NextResponse.json(review);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  await adminDeleteReview(Number(id));
  return NextResponse.json({ ok: true });
}
