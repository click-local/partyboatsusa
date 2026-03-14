import { NextResponse } from "next/server";
import { getAdmin } from "./get-admin";
import type { AdminPermission } from "@/lib/db/schema";

export async function adminGuard(requiredPermission?: AdminPermission) {
  const admin = await getAdmin();
  if (!admin) {
    return { admin: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // If a permission is required, check if the admin has it
  // Empty permissions array = full access (super admin)
  if (requiredPermission && admin.permissions.length > 0 && !admin.permissions.includes(requiredPermission)) {
    return { admin: null, error: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }) };
  }

  return { admin, error: null };
}
