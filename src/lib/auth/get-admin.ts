import { createClient } from "@/lib/supabase/server";

/**
 * Get the authenticated admin user from the current Supabase session.
 * Returns null if not authenticated or not an admin.
 */
export async function getAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;
  if (user.user_metadata?.role !== "admin") return null;

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name || "Admin",
    permissions: (user.user_metadata?.permissions as string[]) || [],
  };
}
