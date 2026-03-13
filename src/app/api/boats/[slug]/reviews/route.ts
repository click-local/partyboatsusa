import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, boats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  sendBoatNotification,
  getBoatNotificationRecipient,
} from "@/lib/email/send-notification";
import { buildReviewNotificationEmail } from "@/lib/email/templates";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await params; // resolve params
    const body = await request.json();

    const { boatId, userName, userEmail, rating, title, comment, tripDate } = body;

    if (!boatId || !userName || !userEmail || !rating || !title || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const [review] = await db.insert(reviews).values({
      boatId,
      userName,
      userEmail,
      rating,
      title,
      comment,
      tripDate: tripDate || null,
      status: "pending",
    }).returning();

    // Send notification email (fire-and-forget)
    const [boat] = await db
      .select({ name: boats.name, slug: boats.slug })
      .from(boats)
      .where(eq(boats.id, boatId));

    if (boat) {
      const recipient = await getBoatNotificationRecipient(boatId);
      const html = buildReviewNotificationEmail({
        boatName: boat.name,
        boatSlug: boat.slug,
        boatId,
        reviewerName: userName,
        rating,
        title,
        comment,
        isClaimed: recipient.isClaimed,
      });

      sendBoatNotification({
        boatId,
        subject: `New Review for ${boat.name} on Party Boats USA`,
        html,
      }).catch(() => {});
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
