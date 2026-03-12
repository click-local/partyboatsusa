import { OperatorSidebar } from "@/components/operator/operator-sidebar";

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <OperatorSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
