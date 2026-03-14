import { NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { db } from "@/lib/db";
import { amenities } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db.select().from(amenities).orderBy(asc(amenities.sortOrder));
  return NextResponse.json(items);
}
