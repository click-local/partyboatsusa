import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bragBoardPhotos, boats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  sendBoatNotification,
  getBoatNotificationRecipient,
} from "@/lib/email/send-notification";
import { buildBragBoardNotificationEmail } from "@/lib/email/templates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      boatId,
      submitterName,
      submitterEmail,
      catchDescription,
      photoUrl,
      honeypot,
      formLoadedAt,
    } = body;

    // Anti-spam: honeypot (silently accept to confuse bots)
    if (honeypot) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    // Anti-spam: time-based (form must be open at least 3 seconds)
    if (formLoadedAt) {
      const elapsed = Date.now() - Number(formLoadedAt);
      if (elapsed < 3000) {
        return NextResponse.json({ success: true }, { status: 201 });
      }
    }

    if (!boatId || !submitterName || !catchDescription || !photoUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify boat exists
    const [boat] = await db
      .select({ id: boats.id, name: boats.name, slug: boats.slug })
      .from(boats)
      .where(eq(boats.id, Number(boatId)));

    if (!boat) {
      return NextResponse.json({ error: "Boat not found" }, { status: 404 });
    }

    // Insert photo
    const [photo] = await db
      .insert(bragBoardPhotos)
      .values({
        boatId: boat.id,
        submitterName,
        submitterEmail: submitterEmail || null,
        submitterType: "public",
        photoUrl,
        catchDescription,
      })
      .returning();

    // Send notification email (fire-and-forget)
    const recipient = await getBoatNotificationRecipient(boat.id);
    const html = buildBragBoardNotificationEmail({
      boatName: boat.name,
      boatSlug: boat.slug,
      boatId: boat.id,
      submitterName,
      catchDescription,
      isClaimed: recipient.isClaimed,
    });

    sendBoatNotification({
      boatId: boat.id,
      subject: `New Catch Photo for ${boat.name} on Party Boats USA`,
      html,
    }).catch(() => {});

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Brag board submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit photo" },
      { status: 500 }
    );
  }
}
