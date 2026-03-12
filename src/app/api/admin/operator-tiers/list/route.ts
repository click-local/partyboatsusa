import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetOperators } from "@/lib/db/queries/admin";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const operators = await adminGetOperators();
  return NextResponse.json(operators);
}
