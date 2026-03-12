import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminUpdateFeatureItem, adminDeleteFeatureItem } from "@/lib/db/queries/admin";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const { tierValues, ...data } = body;
  const item = await adminUpdateFeatureItem(Number(id), data, tierValues);
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  await adminDeleteFeatureItem(Number(id));
  return NextResponse.json({ ok: true });
}
