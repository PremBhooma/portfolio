"use client";

import { useEffect, useState } from "react";
import { getAllSocialLinks, createSocialLink, updateSocialLink, deleteSocialLink } from "@/lib/api";

export default function AdminSocialPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formHref, setFormHref] = useState("");
  const [formSvgPath, setFormSvgPath] = useState("");
  const [formOrder, setFormOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchLinks = async () => {
    try {
      const data = await getAllSocialLinks();
      setLinks(data);
    } catch (err) {
      console.error("Failed to fetch social links:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormHref("");
    setFormSvgPath("");
    setFormOrder(0);
    setFormIsActive(true);
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (link) => {
    setFormName(link.name);
    setFormHref(link.href);
    setFormSvgPath(link.svgPath);
    setFormOrder(link.order);
    setFormIsActive(link.isActive);
    setEditing(link._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: formName,
        href: formHref,
        svgPath: formSvgPath,
        order: formOrder,
        isActive: formIsActive,
      };

      if (editing) {
        await updateSocialLink(editing, payload);
      } else {
        await createSocialLink(payload);
      }

      await fetchLinks();
      resetForm();
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}" social link?`)) return;
    try {
      await deleteSocialLink(id);
      setLinks((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Links</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your social media links</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Link
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="mb-8 bg-[#111118] border border-[#1e1e2e] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{editing ? "Edit Social Link" : "Add Social Link"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Platform Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., LinkedIn"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
                <input
                  type="text"
                  value={formHref}
                  onChange={(e) => setFormHref(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://linkedin.com/in/..."
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">SVG Path Data</label>
              <textarea
                value={formSvgPath}
                onChange={(e) => setFormSvgPath(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y font-mono text-xs"
                placeholder="M19 0h-14c-2.761..."
                required
              />
              {/* Preview */}
              {formSvgPath && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Preview:</span>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d={formSvgPath} />
                  </svg>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                    formIsActive
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  }`}
                >
                  {formIsActive ? "✓ Active" : "○ Inactive"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? "Saving..." : editing ? "Update Link" : "Add Link"}
              </button>
              <button type="button" onClick={resetForm} className="px-5 py-2.5 text-gray-400 hover:text-white text-sm rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#111118] border border-[#1e1e2e] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-16 bg-[#111118] border border-[#1e1e2e] rounded-xl">
          <p className="text-gray-400">No social links yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link._id}
              className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-5 py-3 flex items-center gap-4 hover:border-[#2a2a3a] transition-colors"
            >
              <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d={link.svgPath} />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm">{link.name}</span>
                  {!link.isActive && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full">Inactive</span>
                  )}
                </div>
                <p className="text-gray-500 text-xs truncate">{link.href}</p>
              </div>
              <span className="text-xs text-gray-600">#{link.order}</span>
              <button
                onClick={() => startEdit(link)}
                className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(link._id, link.name)}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
