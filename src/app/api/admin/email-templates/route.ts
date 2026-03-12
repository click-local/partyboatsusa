import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetEmailTemplates, adminCreateEmailTemplate } from "@/lib/db/queries/admin";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;
  const templates = await adminGetEmailTemplates();
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const body = await req.json();
  const template = await adminCreateEmailTemplate(body);
  return NextResponse.json(template, { status: 201 });
}
