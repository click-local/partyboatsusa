"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

interface Claim {
  id: number;
  status: string;
  message: string | null;
  createdAt: string;
  boatId: number;
  boatName: string;
  boatCity: string;
  boatState: string;
  operatorId: number;
  operatorCompany: string;
  operatorEmail: string;
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [acting, setActing] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/claims")
      .then((r) => r.json())
      .then(setClaims)
      .catch(() => toast.error("Failed to load claims"))
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(claimId: number, action: "approve" | "reject") {
    if (!confirm(`Are you sure you want to ${action} this claim?`)) return;
    setActing(claimId);

    try {
      const res = await fetch("/api/admin/claims", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, action }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Action failed");
        return;
      }

      setClaims((prev) =>
        prev.map((c) =>
          c.id === claimId ? { ...c, status: action === "approve" ? "approved" : "rejected" } : c
        )
      );
      toast.success(`Claim ${action === "approve" ? "approved" : "rejected"}`);
    } catch {
      toast.error("Action failed");
    } finally {
      setActing(null);
    }
  }

  const filtered = filter === "all" ? claims : claims.filter((c) => c.status === filter);
  const pendingCount = claims.filter((c) => c.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold">
            Claim Requests
            {pendingCount > 0 && (
              <span className="ml-2 text-sm font-normal bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {filter === "all" ? "" : filter + " "}claims found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Boat</th>
                <th className="pb-3 font-medium">Operator</th>
                <th className="pb-3 font-medium">Message</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-900">{claim.boatName}</p>
                    <p className="text-xs text-gray-500">
                      {claim.boatCity}, {claim.boatState}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-gray-900">{claim.operatorCompany}</p>
                    <p className="text-xs text-gray-500">{claim.operatorEmail}</p>
                  </td>
                  <td className="py-3 pr-4 max-w-[200px]">
                    <p className="text-gray-600 truncate">{claim.message || "—"}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={claim.status} />
                  </td>
                  <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    {claim.status === "pending" && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(claim.id, "approve")}
                          disabled={acting === claim.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          {acting === claim.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(claim.id, "reject")}
                          disabled={acting === claim.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
      );
    default:
      return <span className="text-xs text-gray-500">{status}</span>;
  }
}
