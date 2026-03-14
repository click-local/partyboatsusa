import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import { adminGetSiteSettings, adminUpdateSiteSettings } from "@/lib/db/queries/admin";

export async function GET() {
  const { error } = await adminGuard("site-settings");
  if (error) return error;
  const settings = await adminGetSiteSettings();
  return NextResponse.json(settings ?? {});
}

export async function PUT(req: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;
  const body = await req.json();
  const settings = await adminUpdateSiteSettings(body);
  return NextResponse.json(settings);
}
