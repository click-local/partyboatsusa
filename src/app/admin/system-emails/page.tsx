"use client";

import { useEffect, useState } from "react";
import { Mail, Plus, Trash2, Edit, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface EmailTemplate {
  id: number;
  name: string;
  description: string | null;
  subject: string;
  body: string;
  trigger: string | null;
  recipients: string | null;
  isActive: boolean;
}

const emptyForm = { name: "", description: "", subject: "", body: "", trigger: "", recipients: "", isActive: true };

export default function AdminSystemEmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetch("/api/admin/email-templates")
      .then((r) => r.json())
      .then(setTemplates)
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/email-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const t = await res.json();
      setTemplates((prev) => [...prev, t]);
      setForm(emptyForm);
      setShowAdd(false);
      toast.success("Template created");
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await fetch(`/api/admin/email-templates/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      const t = await res.json();
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? t : x)));
      setEditing(null);
      toast.success("Template updated");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this template?")) return;
    const res = await fetch(`/api/admin/email-templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  function EmailForm({ data, onChange, onSubmit, title, submitLabel, onCancel }: {
    data: Record<string, unknown>;
    onChange: (d: Record<string, unknown>) => void;
    onSubmit: (e: React.FormEvent) => void;
    title: string;
    submitLabel: string;
    onCancel?: () => void;
  }) {
    return (
      <form onSubmit={onSubmit} className="bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{title}</h2>
          {onCancel && <button type="button" onClick={onCancel} className="p-1 text-gray-400"><X className="h-4 w-4" /></button>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={(data.name as string) || ""} onChange={(e) => onChange({ ...data, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
            <input value={(data.trigger as string) || ""} onChange={(e) => onChange({ ...data, trigger: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. on_registration" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input value={(data.description as string) || ""} onChange={(e) => onChange({ ...data, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input value={(data.subject as string) || ""} onChange={(e) => onChange({ ...data, subject: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
            <input value={(data.recipients as string) || ""} onChange={(e) => onChange({ ...data, recipients: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. operator, admin" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Body (HTML)</label>
          <textarea value={(data.body as string) || ""} onChange={(e) => onChange({ ...data, body: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm font-mono" rows={8} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!data.isActive} onChange={(e) => onChange({ ...data, isActive: e.target.checked })} className="rounded" />
          Active
        </label>
        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <Save className="h-4 w-4" /> {submitLabel}
        </button>
      </form>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Email Templates</h1>
        </div>
        <button onClick={() => { setShowAdd(!showAdd); setEditing(null); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-4 w-4" /> Add Template
        </button>
      </div>

      {showAdd && (
        <EmailForm data={form as unknown as Record<string, unknown>} onChange={(d) => setForm(d as unknown as typeof emptyForm)} onSubmit={handleAdd} title="New Template" submitLabel="Create" onCancel={() => setShowAdd(false)} />
      )}

      {editing && (
        <EmailForm data={editing as unknown as Record<string, unknown>} onChange={(d) => setEditing(d as unknown as EmailTemplate)} onSubmit={handleUpdate} title={`Edit: ${editing.name}`} submitLabel="Save Changes" onCancel={() => setEditing(null)} />
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Trigger</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {templates.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{t.subject}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{t.trigger || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {t.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => { setEditing(t); setShowAdd(false); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No email templates yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
