import { NextRequest, NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { db } from "@/lib/db";
import { reviews, boats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { buildOperatorReplyEmail } from "@/lib/email/templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "PartyBoatsUSA <noreply@notifications.partyboatsusa.com>";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!operator.tier?.isHighestTier) {
    return NextResponse.json({ error: "Pro tier required to reply to reviews" }, { status: 403 });
  }

  const { reviewId } = await params;
  const id = parseInt(reviewId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
  }

  const body = await request.json();
  const reply = (body.reply || "").trim();
  if (!reply) {
    return NextResponse.json({ error: "Reply cannot be empty" }, { status: 400 });
  }
  if (reply.length > 2000) {
    return NextResponse.json({ error: "Reply must be under 2000 characters" }, { status: 400 });
  }

  // Get the review and verify operator owns the boat
  const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const [boat] = await db
    .select({ operatorId: boats.operatorId, name: boats.name, slug: boats.slug })
    .from(boats)
    .where(eq(boats.id, review.boatId));

  if (!boat || boat.operatorId !== operator.id) {
    return NextResponse.json({ error: "You can only reply to reviews on your own boats" }, { status: 403 });
  }

  // Save the reply
  await db
    .update(reviews)
    .set({
      operatorReply: reply,
      operatorReplyAt: new Date(),
    })
    .where(eq(reviews.id, id));

  // Send email to reviewer (fire-and-forget)
  if (review.userEmail) {
    const html = buildOperatorReplyEmail({
      boatName: boat.name,
      boatSlug: boat.slug,
      reviewerName: review.userName,
      reviewTitle: review.title,
      replySnippet: reply,
    });

    resend.emails
      .send({
        from: EMAIL_FROM,
        to: [review.userEmail],
        subject: `The captain of ${boat.name} replied to your review`,
        html,
      })
      .catch(() => {});
  }

  return NextResponse.json({ success: true });
}
