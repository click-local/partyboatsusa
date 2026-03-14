"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Ship, Users, Settings, Mail, Layers, Crown, Fish,
  BarChart3, Map, GitCompare, LogOut, Anchor, Menu, X, Star, ShieldCheck, Camera, MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AdminPermission } from "@/lib/db/schema";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Ship;
  permission?: AdminPermission;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/boats", label: "Boats", icon: Ship, permission: "boats" },
  { href: "/admin/claims", label: "Claim Requests", icon: ShieldCheck, permission: "boats" },
  { href: "/admin/brag-board", label: "Brag Board", icon: Camera, permission: "boats" },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare, permission: "boats" },
  { href: "/admin/crm", label: "CRM", icon: Users, permission: "crm" },
  { href: "/admin/destination-pages", label: "Destinations", icon: Map, permission: "destination-pages" },
  { href: "/admin/site-settings", label: "Site Settings", icon: Settings, permission: "site-settings" },
  { href: "/admin/system-emails", label: "Email Templates", icon: Mail, permission: "system-emails" },
  { href: "/admin/species", label: "Species", icon: Fish, permission: "options" },
  { href: "/admin/options", label: "Options", icon: Layers, permission: "options" },
  { href: "/admin/membership-tiers", label: "Membership Tiers", icon: Crown, permission: "membership-tiers" },
  { href: "/admin/operator-tiers", label: "Operator Tiers", icon: Star, permission: "operator-tiers" },
  { href: "/admin/feature-comparison", label: "Features", icon: GitCompare, permission: "feature-comparison" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, permission: "analytics" },
  { href: "/admin/users", label: "Admin Users", icon: Users, permission: "admin-users" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.permissions) setPermissions(data.permissions);
      })
      .catch(() => {});
  }, []);

  // Empty permissions = super admin (full access)
  const visibleItems = permissions.length === 0
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => !item.permission || permissions.includes(item.permission));

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.push("/admin/login");
    router.refresh();
  }

  const navContent = (
    <>
      <div className="p-4 border-b border-gray-700">
        <Link href="/admin/boats" className="flex items-center gap-2">
          <Anchor className="h-5 w-5 text-blue-400" />
          <span className="font-display font-bold text-white text-sm">PBUSA Admin</span>
        </Link>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-gray-700">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:bg-gray-900 lg:min-h-screen">
        {navContent}
      </aside>
      <div className="lg:hidden sticky top-0 z-50 bg-gray-900 px-4 h-14 flex items-center justify-between">
        <span className="font-display font-bold text-white text-sm">PBUSA Admin</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 top-14">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative bg-gray-900 w-56 min-h-full flex flex-col">{navContent}</div>
        </div>
      )}
    </>
  );
}
