import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminAssignOperatorTier, adminDeleteOperator } from "@/lib/db/queries/admin";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ operatorId: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { operatorId } = await params;
  const { tierId } = await req.json();
  const operator = await adminAssignOperatorTier(Number(operatorId), tierId);
  return NextResponse.json(operator);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ operatorId: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { operatorId } = await params;
  await adminDeleteOperator(Number(operatorId));
  return NextResponse.json({ ok: true });
}
