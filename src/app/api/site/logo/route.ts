import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

export async function GET() {
  const settings = await db.select({ logoUrl: siteSettings.logoUrl }).from(siteSettings).limit(1);
  return NextResponse.json({ logoUrl: settings[0]?.logoUrl || null });
}
