"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProject, deleteProject, getImageUrl } from "@/lib/api";

export default function AdminProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProject(id);
        setProject(data);
      } catch (err) {
        setError(err.message || "Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await deleteProject(id);
      router.push("/admin/projects");
    } catch (err) {
      alert("Failed to delete project: " + err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[#111118] border border-[#1e1e2e] rounded-lg animate-pulse" />
        <div className="h-64 bg-[#111118] border border-[#1e1e2e] rounded-xl animate-pulse" />
        <div className="h-32 bg-[#111118] border border-[#1e1e2e] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Projects
        </Link>
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-6 text-center">
          <p>{error || "Project not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e1e2e] pb-4">
        <div>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors mb-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects List
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white">{project.title}</h1>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${project.isActive
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                }`}
            >
              {project.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-[#1a1a2a] text-gray-400 rounded-full border border-[#2a2a3a]">
              Order #{project.order}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/projects/${project._id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Project
          </Link>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            Delete
          </button>
        </div>
      </div>

      {/* Main Banner / Image */}
      {project.image ? (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg overflow-hidden max-h-[300px] flex items-center justify-center">
          <img
            src={getImageUrl(project.image)}
            alt={project.title}
            className="w-full h-full object-cover max-h-[300px]"
          />
        </div>
      ) : (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-6 text-center text-gray-500 text-xs">
          No cover image uploaded for this project.
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Project Link */}
        {project.link && (
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Live Project Link</span>
              <p className="text-white text-xs mt-0.5 font-mono">{project.link}</p>
            </div>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-md transition-colors border border-indigo-500/20"
            >
              Visit Website
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}

        {/* Overview & Description */}
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-4 space-y-2">
          <h2 className="text-sm font-semibold text-white">Project Overview</h2>
          <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line">{project.description}</p>
        </div>

        {/* Badges / Tech Tags */}
        {project.badges?.length > 0 && (
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-4 space-y-2">
            <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Badges / Tech Tags</h2>
            <div className="flex flex-wrap gap-1.5">
              {project.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 bg-[#1a1a2a] text-indigo-300 text-[11px] font-medium rounded-full border border-[#2a2a3a]"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Features */}
        {project.features?.length > 0 && (
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">Key Features & Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {project.features.map((feature, idx) => (
                <div key={idx} className="p-3 bg-[#161622] border border-[#1e1e2e] rounded-md space-y-0.5">
                  <h3 className="text-xs font-semibold text-indigo-400">{feature.title}</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack */}
        {project.techStack?.length > 0 && (
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">Tech Stack Architecture</h2>
            <div className="space-y-2">
              {project.techStack.map((tech, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-[#161622] border border-[#1e1e2e] rounded-md gap-1">
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider w-32 flex-shrink-0">
                    {tech.category}
                  </span>
                  <span className="text-[11px] text-gray-300 font-mono flex-1">{tech.items}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
