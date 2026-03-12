import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetDestinationPageById, adminUpdateDestinationPage, adminDeleteDestinationPage, adminGetContentBlocks } from "@/lib/db/queries/admin";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  const page = await adminGetDestinationPageById(Number(id));
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const blocks = await adminGetContentBlocks(Number(id));
  return NextResponse.json({ ...page, contentBlocks: blocks });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  // Strip non-updatable fields
  const { id: _id, contentBlocks: _cb, createdAt: _ca, updatedAt: _ua, ...updateData } = body;
  try {
    const page = await adminUpdateDestinationPage(Number(id), updateData);
    return NextResponse.json(page);
  } catch (e) {
    console.error("Failed to update destination page:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  await adminDeleteDestinationPage(Number(id));
  return NextResponse.json({ ok: true });
}
