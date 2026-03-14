"use client";

import { usePathname } from "next/navigation";
import { OperatorSidebar } from "@/components/operator/operator-sidebar";

const AUTH_PATHS = [
  "/operator/login",
  "/operator/forgot-password",
  "/operator/reset-password",
  "/operator/verify-email",
  "/operator/claim",
];

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OperatorSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
