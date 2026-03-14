import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminUpdateSpecies, adminDeleteSpecies, adminSetSpeciesAliases, adminGetSpeciesAliases } from "@/lib/db/queries/admin";
import { adminSpeciesSchema } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  const aliases = await adminGetSpeciesAliases(Number(id));
  return NextResponse.json({ aliases });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const parsed = adminSpeciesSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const { aliases, ...data } = parsed.data;
  const item = await adminUpdateSpecies(Number(id), data);
  if (aliases !== undefined) {
    await adminSetSpeciesAliases(Number(id), aliases);
  }
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  await adminDeleteSpecies(Number(id));
  return NextResponse.json({ ok: true });
}
