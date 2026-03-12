import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { boatTripTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  const result = await db.select().from(boatTripTypes).where(eq(boatTripTypes.boatId, Number(id)));
  return NextResponse.json(result);
}
