import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetAmenities, adminCreateAmenity } from "@/lib/db/queries/admin";
import { adminAmenitySchema } from "@/lib/validations";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const items = await adminGetAmenities();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const body = await req.json();
  const parsed = adminAmenitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const item = await adminCreateAmenity(parsed.data);
  return NextResponse.json(item, { status: 201 });
}
