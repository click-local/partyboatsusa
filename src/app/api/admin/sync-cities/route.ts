import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminSyncCitiesFromBoats } from "@/lib/db/queries/admin";

export async function POST() {
  const { error } = await adminGuard();
  if (error) return error;

  try {
    const result = await adminSyncCitiesFromBoats();
    return NextResponse.json(result);
  } catch (e) {
    console.error("Failed to sync cities:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
