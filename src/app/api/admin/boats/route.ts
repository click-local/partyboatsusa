import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetBoats, adminCreateBoat } from "@/lib/db/queries/admin";
import { adminBoatSchema } from "@/lib/validations";

export async function GET() {
  const { error } = await adminGuard("boats");
  if (error) return error;
  const boats = await adminGetBoats();
  return NextResponse.json(boats);
}

export async function POST(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const body = await req.json();
  const parsed = adminBoatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const { tripTypeIds, amenityIds, speciesIds, ...data } = parsed.data;
  const boat = await adminCreateBoat(data, tripTypeIds, amenityIds, speciesIds);
  return NextResponse.json(boat, { status: 201 });
}
