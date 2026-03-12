import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetTripTypes, adminCreateTripType } from "@/lib/db/queries/admin";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const types = await adminGetTripTypes();
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const body = await req.json();
  const type = await adminCreateTripType(body);
  return NextResponse.json(type, { status: 201 });
}
