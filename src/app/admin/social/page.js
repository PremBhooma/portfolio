"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllSocialLinks, createSocialLink, updateSocialLink, deleteSocialLink } from "@/lib/api";

const PRESET_ICONS = [
  {
    name: "GitHub",
    svgPath: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z",
    defaultHref: "https://github.com/yourusername",
  },
  {
    name: "LinkedIn",
    svgPath: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
    defaultHref: "https://linkedin.com/in/yourusername",
  },
  {
    name: "Twitter / X",
    svgPath: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    defaultHref: "https://x.com/yourusername",
  },
  {
    name: "Instagram",
    svgPath: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    defaultHref: "https://instagram.com/yourusername",
  },
  {
    name: "YouTube",
    svgPath: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    defaultHref: "https://youtube.com/@yourchannel",
  },
  {
    name: "Email",
    svgPath: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
    defaultHref: "mailto:you@example.com",
  },
];

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

  const applyPreset = (preset) => {
    setFormName(preset.name);
    setFormSvgPath(preset.svgPath);
    if (!formHref) {
      setFormHref(preset.defaultHref);
    }
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

  const activeCount = links.filter((l) => l.isActive).length;
  const inactiveCount = links.length - activeCount;

  return (
    <div className="space-y-4 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e1e2e] pb-3">
        <div>
          <h1 className="text-xl font-bold text-white">Social Links Management</h1>
          <p className="text-gray-400 text-xs mt-0.5">Manage public profile links and platform icons</p>
        </div>

        <div className="flex items-center gap-2">
          {/* KPI Chips */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#111118] border border-[#1e1e2e] rounded-md text-xs">
            <span className="text-gray-400">Total:</span>
            <span className="text-white font-semibold">{links.length}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-md text-xs">
            <span className="text-green-400">Active:</span>
            <span className="text-green-300 font-semibold">{activeCount}</span>
          </div>

          <button
            onClick={() => {
              if (showForm && !editing) {
                setShowForm(false);
              } else {
                resetForm();
                setShowForm(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showForm && !editing ? "Close Form" : "Add Link"}
          </button>
        </div>
      </div>

      {/* Form Drawer / Container */}
      {showForm && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e1e2e] pb-2">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              {editing ? "Edit Social Link" : "Add Social Link"}
            </h3>
            <button onClick={resetForm} className="text-xs text-gray-500 hover:text-gray-300">
              Cancel
            </button>
          </div>

          {/* Quick Presets Toolbar */}
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1.5">
              Quick Presets (Click to Auto-fill):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ICONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1a1a2a] hover:bg-indigo-600/20 hover:border-indigo-500/40 text-gray-300 text-[11px] rounded-md border border-[#2a2a3a] transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d={preset.svgPath} />
                  </svg>
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Platform Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., GitHub"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Target URL *</label>
                <input
                  type="text"
                  value={formHref}
                  onChange={(e) => setFormHref(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="https://github.com/yourusername"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-300">SVG Path Data *</label>
                {formSvgPath && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                    <span>Preview:</span>
                    <div className="w-5 h-5 bg-[#1a1a2a] rounded flex items-center justify-center border border-[#2a2a3a]">
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d={formSvgPath} />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <textarea
                value={formSvgPath}
                onChange={(e) => setFormSvgPath(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y font-mono text-[11px]"
                placeholder="M12 0C5.37 0..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Display Order</label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Status</label>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`w-full px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                    formIsActive
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  }`}
                >
                  {formIsActive ? "✓ Active" : "○ Inactive"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#1e1e2e]">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>{editing ? "Update Link" : "Create Social Link"}</>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 text-gray-400 hover:text-white text-xs font-medium rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-[#111118] border border-[#1e1e2e] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-12 bg-[#111118] border border-[#1e1e2e] rounded-lg">
          <svg className="w-10 h-10 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <p className="text-gray-400 text-xs">No social links configured yet.</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="text-indigo-400 hover:text-indigo-300 text-xs mt-1.5 inline-block font-medium"
          >
            Add your first link →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {links.map((link) => (
            <div
              key={link._id}
              className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-3 flex items-center justify-between gap-3 hover:border-[#2a2a3a] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-md bg-[#1a1a2a] border border-[#2a2a3a] flex items-center justify-center flex-shrink-0 text-gray-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={link.svgPath} />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-xs truncate">{link.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                        link.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }`}
                    >
                      {link.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px] truncate mt-0.5">{link.href}</p>
                </div>
              </div>

              {/* Toolbar Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-[10px] text-gray-600 font-mono mr-1">#{link.order}</span>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors text-xs"
                  title="Test Link"
                >
                  ↗
                </a>
                <button
                  onClick={() => startEdit(link)}
                  className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
                  title="Edit Link"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(link._id, link.name)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                  title="Delete Link"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
