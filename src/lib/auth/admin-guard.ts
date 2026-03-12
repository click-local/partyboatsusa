import { NextResponse } from "next/server";
import { getAdmin } from "./get-admin";

export async function adminGuard() {
  const admin = await getAdmin();
  if (!admin) {
    return { admin: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { admin, error: null };
}
