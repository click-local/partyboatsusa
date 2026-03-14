import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetSpeciesSuggestions, adminUpdateSpeciesSuggestion } from "@/lib/db/queries/admin";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const list = await adminGetSpeciesSuggestions();
  return NextResponse.json(list);
}

export async function PUT(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const body = await req.json();
  const { id, status } = body;
  if (!id || !["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const item = await adminUpdateSpeciesSuggestion(id, status);
  return NextResponse.json(item);
}
