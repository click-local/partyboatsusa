"use client";

import { useEffect, useState } from "react";
import { Users, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

interface ContactLog {
  log: {
    id: number;
    operatorId: number;
    eventType: string;
    context: Record<string, unknown> | null;
    sourceIp: string | null;
    userAgent: string | null;
    note: string | null;
    createdAt: string;
  };
  operatorEmail: string | null;
  companyName: string | null;
}

export default function AdminCRMPage() {
  const [logs, setLogs] = useState<ContactLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/crm")
      .then((r) => r.json())
      .then(setLogs)
      .catch(() => toast.error("Failed to load CRM data"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this log entry?")) return;
    const res = await fetch(`/api/admin/crm/logs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLogs((prev) => prev.filter((l) => l.log.id !== id));
      toast.success("Log deleted");
    }
  }

  const eventTypes = [...new Set(logs.map((l) => l.log.eventType))].sort();

  const filtered = logs.filter((item) => {
    const matchesSearch = !search ||
      item.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      item.operatorEmail?.toLowerCase().includes(search.toLowerCase()) ||
      item.log.note?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || item.log.eventType === typeFilter;
    return matchesSearch && matchesType;
  });

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
        <Users className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">CRM</h1>
        <span className="text-sm text-gray-500">({logs.length} logs)</span>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by company, email, or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Event Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Note</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((item) => (
              <tr key={item.log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{item.companyName || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{item.operatorEmail || "-"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                    {item.log.eventType}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{item.log.note || "-"}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{item.log.sourceIp || "-"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(item.log.createdAt).toLocaleDateString()} {new Date(item.log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(item.log.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  {search || typeFilter ? "No logs match your filters." : "No contact logs yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
