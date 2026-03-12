import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetReviews } from "@/lib/db/queries/admin";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const reviews = await adminGetReviews();
  return NextResponse.json(reviews);
}
