"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Ship, Users, Settings, Mail, Layers, Crown,
  BarChart3, Map, GitCompare, LogOut, Anchor, Menu, X, FileText, Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NAV_ITEMS = [
  { href: "/admin/boats", label: "Boats", icon: Ship },
  { href: "/admin/crm", label: "CRM", icon: Users },
  { href: "/admin/destination-pages", label: "Destinations", icon: Map },
  { href: "/admin/site-settings", label: "Site Settings", icon: Settings },
  { href: "/admin/system-emails", label: "Email Templates", icon: Mail },
  { href: "/admin/options", label: "Options", icon: Layers },
  { href: "/admin/membership-tiers", label: "Membership Tiers", icon: Crown },
  { href: "/admin/operator-tiers", label: "Operator Tiers", icon: Star },
  { href: "/admin/feature-comparison", label: "Features", icon: GitCompare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "Admin Users", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

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
        {NAV_ITEMS.map((item) => {
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
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-300">
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
