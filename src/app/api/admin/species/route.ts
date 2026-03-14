import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetSpecies, adminCreateSpecies } from "@/lib/db/queries/admin";
import { adminSpeciesSchema } from "@/lib/validations";

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
  const parsed = adminSpeciesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const item = await adminCreateSpecies(parsed.data);
  return NextResponse.json(item, { status: 201 });
}
