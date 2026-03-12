import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetContactLogs } from "@/lib/db/queries/admin";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const logs = await adminGetContactLogs();
  return NextResponse.json(logs);
}
