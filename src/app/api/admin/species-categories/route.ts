import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetSpeciesCategories, adminCreateSpeciesCategory } from "@/lib/db/queries/admin";
import { adminSpeciesCategorySchema } from "@/lib/validations";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const list = await adminGetSpeciesCategories();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const body = await req.json();
  const parsed = adminSpeciesCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const item = await adminCreateSpeciesCategory(parsed.data);
  return NextResponse.json(item, { status: 201 });
}
