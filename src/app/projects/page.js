"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Particles from "@/components/ui/particles";
import ProjectCard from "@/components/projects/ProjectCard";
import { getProjects } from "@/lib/api";

const slugify = (title, i) => `project-${i}-${String(title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="relative min-h-screen">
      <Particles className="fixed inset-0 -z-10" quantity={160} ease={100} refresh />
      <Navigation />

      <main className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
        <header className="rise-in mb-12 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#ff8a3d]/80">Beyond the event horizon</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight font-sounthernAire sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white via-[#ffb27a] to-[#ff6a1a]">
            Projects
          </h1>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-[#ff6a1a]/60 via-white/10 to-transparent" />
          <p className="mt-4 text-[13px] leading-relaxed font-nunitoLight text-white/60 lg:text-sm">
            Things I&apos;ve designed, built and shipped — interactive front-ends, scalable backends, and the awkward logic in between.
            {!loading && projects.length > 0 && <span className="text-white/40"> {projects.length} in orbit.</span>}
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
          {/* Index rail — a quick jump list once you're through the disk. */}
          <aside className="hidden lg:block">
            <nav className="sticky top-8" aria-label="Project index">
              <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-white/35">Index</p>
              <ul className="space-y-1.5 border-l border-white/10">
                {projects.map((project, i) => (
                  <li key={project._id || i}>
                    <a
                      href={`#${slugify(project.title, i)}`}
                      className="-ml-px block border-l border-transparent py-1 pl-3 text-[12px] font-nunitoLight text-white/45 transition-colors hover:border-[#ff6a1a] hover:text-white"
                    >
                      {String(project.title || "").split(" - ")[0]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="space-y-6">
            {loading ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div className="aspect-[16/9] w-full bg-white/[0.04]" />
                  <div className="space-y-3 p-6">
                    <div className="h-5 w-2/3 rounded bg-white/[0.06]" />
                    <div className="flex gap-2">
                      {[0, 1, 2].map((j) => (
                        <div key={j} className="h-5 w-16 rounded-full bg-white/[0.05]" />
                      ))}
                    </div>
                    <div className="h-3 w-full rounded bg-white/[0.05]" />
                    <div className="h-3 w-4/5 rounded bg-white/[0.05]" />
                  </div>
                </div>
              ))
            ) : projects.length === 0 ? (
              <div className="rise-in rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                <p className="text-sm font-nunitoLight text-white/60">{failed ? "Couldn't reach the archive — try again in a moment." : "Projects coming soon..."}</p>
              </div>
            ) : (
              projects.map((project, i) => <ProjectCard key={project._id || i} project={project} index={i} id={slugify(project.title, i)} />)
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
