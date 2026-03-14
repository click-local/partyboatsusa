"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Trash2, Edit, Loader2, Save, X, Shield } from "lucide-react";
import { toast } from "sonner";
import { ADMIN_PERMISSIONS } from "@/lib/db/schema";

interface AdminUser {
  id: string;
  email: string;
  user_metadata: { name?: string; role?: string; permissions?: string[] };
  created_at: string;
}

const PERMISSION_LABELS: Record<string, string> = {
  boats: "Boats & Reviews",
  crm: "CRM",
  options: "Options",
  "membership-tiers": "Membership Tiers",
  "operator-tiers": "Operator Tiers",
  "destination-pages": "Destinations",
  "system-emails": "Email Templates",
  "site-settings": "Site Settings",
  "feature-comparison": "Features",
  analytics: "Analytics",
  "admin-users": "Admin Users",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", permissions: [] as string[] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", newPassword: "", permissions: [] as string[] });

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const user = await res.json();
      setUsers((prev) => [...prev, user]);
      setForm({ email: "", password: "", name: "", permissions: [] });
      setShowAdd(false);
      toast.success("Admin user created");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to create user");
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const payload: Record<string, unknown> = {};
    if (editForm.name) payload.name = editForm.name;
    if (editForm.email) payload.email = editForm.email;
    if (editForm.newPassword) payload.password = editForm.newPassword;
    payload.permissions = editForm.permissions;

    const res = await fetch(`/api/admin/users/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === editingId ? { ...u, ...updated } : u)));
      setEditingId(null);
      toast.success("User updated");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to update user");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this admin user?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to delete user");
    }
  }

  function startEdit(user: AdminUser) {
    setEditingId(user.id);
    setEditForm({
      name: user.user_metadata?.name || "",
      email: user.email,
      newPassword: "",
      permissions: user.user_metadata?.permissions || [],
    });
    setShowAdd(false);
  }

  function togglePermission(perms: string[], perm: string): string[] {
    return perms.includes(perm) ? perms.filter((p) => p !== perm) : [...perms, perm];
  }

  function PermissionCheckboxes({ permissions, onChange }: { permissions: string[]; onChange: (p: string[]) => void }) {
    const isSuperAdmin = permissions.length === 0;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Permissions</span>
        </div>
        <label className="flex items-center gap-2 text-sm mb-2">
          <input
            type="checkbox"
            checked={isSuperAdmin}
            onChange={() => onChange(isSuperAdmin ? [...ADMIN_PERMISSIONS] : [])}
            className="rounded"
          />
          <span className="font-medium">Super Admin</span>
          <span className="text-xs text-gray-400">(full access)</span>
        </label>
        {!isSuperAdmin && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-6">
            {ADMIN_PERMISSIONS.map((perm) => (
              <label key={perm} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={permissions.includes(perm)}
                  onChange={() => onChange(togglePermission(permissions, perm))}
                  className="rounded"
                />
                {PERMISSION_LABELS[perm] || perm}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Admin Users</h1>
        </div>
        <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-4 w-4" /> Add Admin
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">New Admin User</h2>
            <button type="button" onClick={() => setShowAdd(false)} className="p-1 text-gray-400"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
            <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <PermissionCheckboxes permissions={form.permissions} onChange={(p) => setForm({ ...form, permissions: p })} />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Create Admin</button>
        </form>
      )}

      {editingId && (
        <form onSubmit={handleUpdate} className="bg-white rounded-xl border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Edit Admin User</h2>
            <button type="button" onClick={() => setEditingId(null)} className="p-1 text-gray-400"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="New Password (leave blank to keep)" type="password" value={editForm.newPassword} onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <PermissionCheckboxes permissions={editForm.permissions} onChange={(p) => setEditForm({ ...editForm, permissions: p })} />
          <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Access</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => {
              const perms = user.user_metadata?.permissions || [];
              const isSuperAdmin = perms.length === 0;
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{user.user_metadata?.name || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    {isSuperAdmin ? (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        Super Admin
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        {perms.length} permission{perms.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => startEdit(user)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(user.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No admin users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
