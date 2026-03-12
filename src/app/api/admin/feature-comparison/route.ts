import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetFeatureComparison, adminCreateFeatureItem } from "@/lib/db/queries/admin";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const data = await adminGetFeatureComparison();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const body = await req.json();
  const { tierValues, ...data } = body;
  const item = await adminCreateFeatureItem(data, tierValues);
  return NextResponse.json(item, { status: 201 });
}
