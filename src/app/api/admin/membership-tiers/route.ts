import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetMembershipTiers, adminCreateMembershipTier } from "@/lib/db/queries/admin";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const tiers = await adminGetMembershipTiers();
  return NextResponse.json(tiers);
}

export async function POST(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const body = await req.json();
  const tier = await adminCreateMembershipTier(body);
  return NextResponse.json(tier, { status: 201 });
}
