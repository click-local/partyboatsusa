"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ship,
  Settings,
  ArrowUpCircle,
  LogOut,
  Anchor,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NAV_ITEMS = [
  { href: "/operator/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/operator/boats", label: "My Boats", icon: Ship },
  { href: "/operator/settings", label: "Settings", icon: Settings },
  { href: "/operator/upgrade", label: "Upgrade", icon: ArrowUpCircle },
];

export function OperatorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.push("/operator/login");
    router.refresh();
  }

  const navContent = (
    <>
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <Anchor className="h-5 w-5 text-primary" />
          <span className="font-display font-bold text-primary">
            Captain&apos;s Portal
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r lg:border-border lg:bg-white lg:min-h-screen">
        {navContent}
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-border px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Anchor className="h-5 w-5 text-primary" />
          <span className="font-display font-bold text-sm text-primary">
            Captain&apos;s Portal
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md text-muted-foreground hover:text-primary"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 top-14">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative bg-white w-60 min-h-full flex flex-col shadow-xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
