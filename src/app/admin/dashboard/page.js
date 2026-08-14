"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllProjects, getResume, getContent } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ projects: 0, hasResume: false, lastUpdate: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projects, resume, heroContent] = await Promise.allSettled([
          getAllProjects(),
          getResume(),
          getContent("hero"),
        ]);

        setStats({
          projects: projects.status === "fulfilled" ? projects.value.length : 0,
          hasResume: resume.status === "fulfilled",
          lastUpdate: heroContent.status === "fulfilled" ? heroContent.value.updatedAt : null,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: "Projects",
      value: stats.projects,
      description: "Total projects in portfolio",
      href: "/admin/projects",
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
      color: "indigo",
    },
    {
      title: "Resume",
      value: stats.hasResume ? "Uploaded" : "Not Uploaded",
      description: stats.hasResume ? "Resume is available for download" : "Upload your resume",
      href: "/admin/resume",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: "emerald",
    },
    {
      title: "Content",
      value: "Manage",
      description: "Edit hero & contact sections",
      href: "/admin/content",
      icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
      color: "amber",
    },
    {
      title: "Social Links",
      value: "Manage",
      description: "Edit your social media links",
      href: "/admin/social",
      icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
      color: "rose",
    },
  ];

  const colorMap = {
    indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
  };

  return (
    <div className="space-y-4 max-w-full">
      <div className="border-b border-[#1e1e2e] pb-3">
        <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 text-xs mt-0.5">Welcome back! Manage your portfolio showcase & settings.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#111118] border border-[#1e1e2e] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {cards.map((card) => {
            const colors = colorMap[card.color];
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group bg-[#111118] border border-[#1e1e2e] rounded-lg p-4 hover:border-[#2a2a3a] transition-all duration-200"
              >
                <div className={`w-8 h-8 rounded-md ${colors.bg} flex items-center justify-center mb-3`}>
                  <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-gray-400 mb-1">{card.title}</h3>
                <p className="text-xl font-bold text-white mb-1">{card.value}</p>
                <p className="text-[11px] text-gray-500">{card.description}</p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="pt-2">
        <h2 className="text-sm font-semibold text-white mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Project
          </Link>
          <Link
            href="/admin/resume"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a2a] hover:bg-[#222233] text-gray-300 text-xs font-medium rounded-md border border-[#2a2a3a] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Manage Resume
          </Link>
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a2a] hover:bg-[#222233] text-gray-300 text-xs font-medium rounded-md border border-[#2a2a3a] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Content
          </Link>
        </div>
      </div>
    </div>
  );
}
