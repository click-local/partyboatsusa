"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Anchor,
  X,
  MapPin,
  Fish,
  Camera,
  LogIn,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/search", label: "Browse Boats", icon: Search },
  { href: "/destinations", label: "Destinations", icon: MapPin },
  { href: "/species", label: "Fish Species", icon: Fish },
  { href: "/brag-board", label: "Brag Board", icon: Camera },
];

export function Navbar({ logoUrl }: { logoUrl?: string | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="relative flex items-center justify-between h-20 md:h-20 lg:h-28">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Party Boats USA"
                  width={300}
                  height={96}
                  className="h-16 md:h-16 lg:h-24 w-auto"
                  priority
                />
              ) : (
                <>
                  <Anchor className="h-6 w-6 text-primary" />
                  <span className="font-display font-bold text-lg text-primary">
                    Party Boats USA
                  </span>
                </>
              )}
            </Link>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side - Login & CTA */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/operator/login"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                href="/operator/login"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                List Your Boat
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-muted-foreground hover:text-primary"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[100] transition-all duration-300 lg:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#0a1628]/95 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        {/* Menu Content */}
        <div
          className={`relative flex flex-col h-full transition-transform duration-300 ${
            mobileOpen ? "translate-y-0" : "-translate-y-8"
          }`}
        >
          {/* Top bar: Logo + Close */}
          <div className="flex items-center justify-between px-4 py-3 mx-4 mt-3 rounded-xl bg-white/10 backdrop-blur-md">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2"
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Party Boats USA"
                  width={150}
                  height={40}
                  className="h-10 w-auto"
                />
              ) : (
                <>
                  <Anchor className="h-6 w-6 text-white" />
                  <span className="font-display font-bold text-lg text-white">
                    Party Boats USA
                  </span>
                </>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 flex flex-col justify-center px-6 -mt-16">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-4 py-3.5 border-b border-white/10 last:border-0 transition-colors ${
                    isActive
                      ? "text-blue-400"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? "text-blue-400"
                        : "text-white/40 group-hover:text-white/70"
                    }`}
                  />
                  <span className="text-lg font-medium">{link.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom CTAs */}
          <div className="px-6 pb-8 space-y-3">
            <Link
              href="/operator/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-white text-primary font-semibold text-base hover:bg-blue-50 transition-colors"
            >
              <Anchor className="h-5 w-5" />
              List Your Boat
            </Link>
            <Link
              href="/operator/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white/70 hover:text-white transition-colors text-sm"
            >
              <LogIn className="h-4 w-4" />
              Operator Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
