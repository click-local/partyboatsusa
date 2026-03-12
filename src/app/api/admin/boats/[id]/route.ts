import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetBoatById, adminUpdateBoat, adminDeleteBoat } from "@/lib/db/queries/admin";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  const boat = await adminGetBoatById(Number(id));
  if (!boat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(boat);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const { tripTypeIds, amenityIds, ...data } = body;
  const boat = await adminUpdateBoat(Number(id), data, tripTypeIds, amenityIds);
  return NextResponse.json(boat);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  await adminDeleteBoat(Number(id));
  return NextResponse.json({ ok: true });
}
