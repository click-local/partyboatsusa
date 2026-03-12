import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const supabase = createAdminClient();
  const { data, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });
  const admins = (data.users || []).filter((u) => u.user_metadata?.role === "admin");
  return NextResponse.json(admins);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await adminGuard();
  if (error) return error;
  const { email, password, name } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  const supabase = createAdminClient();
  const { data, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "admin", name: name || email },
  });
  if (createError) return NextResponse.json({ error: createError.message }, { status: 400 });
  return NextResponse.json(data.user, { status: 201 });
}
