"use client";

import { useEffect, useState } from "react";
import { Star, Loader2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface Operator {
  operator: {
    id: number;
    companyName: string;
    contactName: string;
    email: string;
    phone: string | null;
    membershipTierId: number | null;
  };
  tierName: string | null;
  tierBadgeColor: string | null;
}

interface Tier { id: number; name: string; badgeColor: string | null; }

export default function AdminOperatorTiersPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/operator-tiers/list").then((r) => r.json()),
      fetch("/api/admin/membership-tiers").then((r) => r.json()),
    ])
      .then(([ops, t]) => {
        setOperators(Array.isArray(ops) ? ops : []);
        setTiers(Array.isArray(t) ? t : []);
      })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function assignTier(operatorId: number, tierId: number | null) {
    const res = await fetch(`/api/admin/operator-tiers/${operatorId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierId }),
    });
    if (res.ok) {
      const tier = tiers.find((t) => t.id === tierId);
      setOperators((prev) =>
        prev.map((o) =>
          o.operator.id === operatorId
            ? { ...o, operator: { ...o.operator, membershipTierId: tierId }, tierName: tier?.name || null, tierBadgeColor: tier?.badgeColor || null }
            : o
        )
      );
      toast.success("Tier assigned");
    }
  }

  async function handleDelete(operatorId: number) {
    if (!confirm("Delete this operator? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/operator-tiers/${operatorId}`, { method: "DELETE" });
    if (res.ok) {
      setOperators((prev) => prev.filter((o) => o.operator.id !== operatorId));
      toast.success("Operator deleted");
    } else {
      toast.error("Failed to delete operator");
    }
  }

  const filtered = operators.filter((o) =>
    o.operator.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    o.operator.email?.toLowerCase().includes(search.toLowerCase()) ||
    o.operator.contactName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Star className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Operator Tiers</h1>
        <span className="text-sm text-gray-500">({operators.length})</span>
      </div>

      <input
        type="text"
        placeholder="Search by company, email, or contact name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg px-4 py-2 text-sm"
      />

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Current Tier</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Assign Tier</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((o) => (
              <tr key={o.operator.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{o.operator.companyName}</td>
                <td className="px-4 py-3 text-gray-600">{o.operator.contactName}</td>
                <td className="px-4 py-3 text-gray-600">{o.operator.email}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{o.operator.phone || "—"}</td>
                <td className="px-4 py-3">
                  {o.tierName ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: o.tierBadgeColor || "#3B82F6" }}>
                      {o.tierName}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">None</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={o.operator.membershipTierId ?? ""}
                    onChange={(e) => assignTier(o.operator.id, e.target.value ? Number(e.target.value) : null)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="">No Tier</option>
                    {tiers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(o.operator.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{search ? "No operators match your search." : "No operators yet."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
