import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetBoatById, adminUpdateBoat, adminDeleteBoat } from "@/lib/db/queries/admin";
import { adminBoatSchema } from "@/lib/validations";

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
  const parsed = adminBoatSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const { tripTypeIds, amenityIds, speciesIds, ...data } = parsed.data;
  const boat = await adminUpdateBoat(Number(id), data, tripTypeIds, amenityIds, speciesIds);
  return NextResponse.json(boat);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  await adminDeleteBoat(Number(id));
  return NextResponse.json({ ok: true });
}
