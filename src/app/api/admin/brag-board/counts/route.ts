import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetBragBoardCounts } from "@/lib/db/queries/admin";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const counts = await adminGetBragBoardCounts();
  return NextResponse.json(counts);
}
