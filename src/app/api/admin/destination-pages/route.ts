import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetDestinationPages, adminCreateDestinationPage, adminGetStates, adminGetCities, adminSyncCitiesFromBoats } from "@/lib/db/queries/admin";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  // Auto-sync cities from boat data before returning
  await adminSyncCitiesFromBoats().catch(() => {});
  const [pages, states, cities] = await Promise.all([
    adminGetDestinationPages(),
    adminGetStates(),
    adminGetCities(),
  ]);
  return NextResponse.json({ pages, states, cities });
}

export async function POST(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const body = await req.json();
  const page = await adminCreateDestinationPage(body);
  return NextResponse.json(page, { status: 201 });
}
