import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bragBoardPhotos, boats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  sendBoatNotification,
  getBoatNotificationRecipient,
} from "@/lib/email/send-notification";
import { buildBragBoardNotificationEmail } from "@/lib/email/templates";
import { bragBoardSubmissionSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Anti-spam checks run before validation
    if (body.honeypot) {
      return NextResponse.json({ success: true }, { status: 201 });
    }
    if (body.formLoadedAt) {
      const elapsed = Date.now() - Number(body.formLoadedAt);
      if (elapsed < 3000) {
        return NextResponse.json({ success: true }, { status: 201 });
      }
    }

    const parsed = bragBoardSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { boatId, submitterName, submitterEmail, catchDescription, photoUrl } = parsed.data;

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
