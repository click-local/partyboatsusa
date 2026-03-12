import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminUpdateMembershipTier, adminDeleteMembershipTier } from "@/lib/db/queries/admin";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const tier = await adminUpdateMembershipTier(Number(id), body);
  return NextResponse.json(tier);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  await adminDeleteMembershipTier(Number(id));
  return NextResponse.json({ ok: true });
}
