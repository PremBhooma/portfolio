"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getAllProjects, deleteProject, getImageUrl } from "@/lib/api";
import ResumeAnalysisModal from "@/components/admin/ResumeAnalysisModal";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "inactive"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will permanently remove its files.`)) return;

    setDeleting(id);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert("Failed to delete project: " + err.message);
    } finally {
      setDeleting(null);
    }
  };

  // Filtered projects computation
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Status filter
      if (statusFilter === "active" && !p.isActive) return false;
      if (statusFilter === "inactive" && p.isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesBadges = p.badges.some((b) => b.toLowerCase().includes(query));
        return matchesTitle || matchesDesc || matchesBadges;
      }

      return true;
    });
  }, [projects, statusFilter, searchQuery]);

  const activeCount = projects.filter((p) => p.isActive).length;
  const inactiveCount = projects.length - activeCount;

  return (
    <div className="space-y-4 max-w-full">
      {/* Resume Analysis Workbench Modal */}
      <ResumeAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        onSyncSuccess={fetchProjects}
      />

      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e1e2e] pb-3">
        <div>
          <h1 className="text-xl font-bold text-white">Projects Management</h1>
          <p className="text-gray-400 text-xs mt-0.5">Manage, filter, and organize your portfolio showcase</p>
        </div>

        {/* Stats Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#111118] border border-[#1e1e2e] rounded-md text-xs">
            <span className="text-gray-400">Total:</span>
            <span className="text-white font-semibold">{projects.length}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-md text-xs">
            <span className="text-green-400">Active:</span>
            <span className="text-green-300 font-semibold">{activeCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-xs">
            <span className="text-yellow-400">Inactive:</span>
            <span className="text-yellow-300 font-semibold">{inactiveCount}</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar (Search, Filter, View Toggle, Add Button) */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Search & Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <svg
              className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects or tech..."
              className="w-full pl-8 pr-7 py-1.5 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Right: View Mode Toggle & Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          <button
            onClick={() => setShowAnalysisModal(true)}
            className="relative group inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white text-xs font-semibold rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.35)] border border-purple-400/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300"></span>
            </span>
            <span>✨ Analyze Resume & Sync</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-white/20 rounded font-mono font-bold">
              AI 2.5
            </span>
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#0a0a0f] border border-[#2a2a3a] rounded-md p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded text-xs transition-colors ${
                viewMode === "grid" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded text-xs transition-colors ${
                viewMode === "list" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              }`}
              title="List View"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Project
          </Link>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-[#111118] border border-[#1e1e2e] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-[#111118] border border-[#1e1e2e] rounded-lg">
          <svg className="w-10 h-10 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-400 text-xs">
            {searchQuery || statusFilter !== "all" ? "No projects match your filter criteria." : "No projects created yet."}
          </p>
          <Link href="/admin/projects/new" className="text-indigo-400 hover:text-indigo-300 text-xs mt-1.5 inline-block font-medium">
            Create a project →
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="bg-[#111118] border border-[#1e1e2e] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#2a2a3a] transition-all group"
            >
              <div>
                {/* Image Banner Header */}
                <div className="relative h-36 bg-[#1a1a2a] overflow-hidden">
                  {project.image ? (
                    <img
                      src={getImageUrl(project.image)}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Overlays */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 bg-black/70 backdrop-blur text-gray-300 rounded-full font-mono border border-white/10">
                      #{project.order}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium backdrop-blur ${
                        project.isActive
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      }`}
                    >
                      {project.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-3.5 space-y-2">
                  <Link
                    href={`/admin/projects/${project._id}`}
                    className="text-white text-xs font-semibold hover:text-indigo-400 transition-colors line-clamp-1 block"
                    title={project.title}
                  >
                    {project.title}
                  </Link>

                  <p className="text-gray-400 text-[11px] line-clamp-2 leading-relaxed">{project.description}</p>

                  {/* Badges */}
                  {project.badges?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {project.badges.slice(0, 3).map((badge, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-[#1a1a2a] text-indigo-300 rounded-full border border-[#2a2a3a]">
                          {badge}
                        </span>
                      ))}
                      {project.badges.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-gray-500">+{project.badges.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-3.5 py-2 bg-[#0d0d14] border-t border-[#1e1e2e] flex items-center justify-between">
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    Website ↗
                  </a>
                ) : (
                  <span className="text-[10px] text-gray-600">No link</span>
                )}

                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/projects/${project._id}`}
                    className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
                    title="View Details"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>

                  <Link
                    href={`/admin/projects/${project._id}/edit`}
                    className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
                    title="Edit Project"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </Link>

                  <button
                    onClick={() => handleDelete(project._id, project.title)}
                    disabled={deleting === project._id}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                    title="Delete Project"
                  >
                    {deleting === project._id ? (
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-2">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-3 flex items-center gap-3 hover:border-[#2a2a3a] transition-colors"
            >
              {/* Image */}
              <Link href={`/admin/projects/${project._id}`} className="w-12 h-12 rounded-md bg-[#1a1a2a] flex-shrink-0 overflow-hidden group">
                {project.image ? (
                  <img
                    src={getImageUrl(project.image)}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 group-hover:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/projects/${project._id}`} className="text-white text-xs font-semibold hover:text-indigo-400 transition-colors truncate">
                    {project.title}
                  </Link>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                      project.isActive
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}
                  >
                    {project.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-gray-500 text-xs truncate mt-0.5">{project.description}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {project.badges.slice(0, 4).map((badge, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-[#1a1a2a] text-gray-400 rounded-full">
                      {badge}
                    </span>
                  ))}
                  {project.badges.length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-gray-500">+{project.badges.length - 4}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-[11px] text-gray-600 mr-1.5 font-mono">#{project.order}</span>
                <Link
                  href={`/admin/projects/${project._id}`}
                  className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
                  title="View Details"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
                <Link
                  href={`/admin/projects/${project._id}/edit`}
                  className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
                  title="Edit"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Link>
                <button
                  onClick={() => handleDelete(project._id, project.title)}
                  disabled={deleting === project._id}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === project._id ? (
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
