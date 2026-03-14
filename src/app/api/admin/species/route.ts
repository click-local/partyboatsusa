import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetSpecies, adminCreateSpecies } from "@/lib/db/queries/admin";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const list = await adminGetSpecies();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const body = await req.json();
  const item = await adminCreateSpecies(body);
  return NextResponse.json(item, { status: 201 });
}
