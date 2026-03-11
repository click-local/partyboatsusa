import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";

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

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
