"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllProjects, deleteProject, getImageUrl } from "@/lib/api";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

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
    if (!confirm(`Are you sure you want to delete "${title}"? This will also delete its files.`)) return;

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 text-xs mt-0.5">Manage your portfolio projects</p>
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

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#111118] border border-[#1e1e2e] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-[#111118] border border-[#1e1e2e] rounded-lg">
          <svg className="w-10 h-10 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-400 text-xs">No projects yet.</p>
          <Link href="/admin/projects/new" className="text-indigo-400 hover:text-indigo-300 text-xs mt-1.5 inline-block">
            Create your first project →
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {projects.map((project) => (
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
                  {!project.isActive && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-yellow-500/10 text-yellow-400 rounded-full">Inactive</span>
                  )}
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
