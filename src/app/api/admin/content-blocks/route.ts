import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetContentBlocks, adminCreateContentBlock } from "@/lib/db/queries/admin";

export async function GET(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const pageId = req.nextUrl.searchParams.get("pageId");
  if (!pageId) return NextResponse.json({ error: "pageId required" }, { status: 400 });
  const blocks = await adminGetContentBlocks(Number(pageId));
  return NextResponse.json(blocks);
}

export async function POST(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const body = await req.json();
  const block = await adminCreateContentBlock(body);
  return NextResponse.json(block, { status: 201 });
}
