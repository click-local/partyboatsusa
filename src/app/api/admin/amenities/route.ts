import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetAmenities, adminCreateAmenity } from "@/lib/db/queries/admin";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const items = await adminGetAmenities();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const body = await req.json();
  const item = await adminCreateAmenity(body);
  return NextResponse.json(item, { status: 201 });
}
