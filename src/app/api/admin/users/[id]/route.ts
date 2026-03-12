import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const update: Record<string, unknown> = {};
  if (body.email) update.email = body.email;
  if (body.password) update.password = body.password;
  if (body.name !== undefined) update.user_metadata = { name: body.name, role: "admin" };

  const { data, error: updateError } = await supabase.auth.admin.updateUserById(id, update);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json(data.user);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await adminGuard();
  if (error) return error;
  const { id } = await params;
  if (admin!.id === id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  const supabase = createAdminClient();
  const { error: deleteError } = await supabase.auth.admin.deleteUser(id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
