"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink } from "lucide-react";
import { getImageUrl } from "@/lib/api";

export default function ProjectCard({ project, index, id }) {
  const [open, setOpen] = useState(false);
  const hasDetails = project.features?.length > 0 || project.techStack?.length > 0;

  return (
    <article
      id={id}
      className="rise-in group relative scroll-mt-24 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm transition-colors duration-300 hover:border-[#ff6a1a]/40"
      style={{ animationDelay: `${Math.min(index, 6) * 90}ms` }}
    >
      {/* Accretion glow — the page you fell out of, bleeding through the card edge. */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -inset-24 bg-[radial-gradient(45%_45%_at_50%_0%,rgba(255,106,26,0.16),transparent_70%)]" />
      </div>

      {project.image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img
            src={getImageUrl(project.image)}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
        </div>
      )}

      <div className="relative p-5 sm:p-6">
        <h2 className="text-lg font-nunitoBold tracking-tight sm:text-xl">
          {project.link ? (
            <Link
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-1.5 transition-colors hover:text-[#ff8a3d]"
            >
              <span>{project.title}</span>
              <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
            </Link>
          ) : (
            project.title
          )}
        </h2>

        {project.badges?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.badges.map((badge, i) => (
              <span key={i} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-nunitoLight text-white/70">
                {badge}
              </span>
            ))}
          </div>
        )}

        {project.description && <p className="mt-4 text-[13px] leading-relaxed font-nunitoLight text-white/70">{project.description}</p>}

        {hasDetails && (
          <>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-nunitoLight text-[#ff8a3d] transition-colors hover:text-[#ffa869]"
            >
              {open ? "Hide details" : "Key features & stack"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>

            <div className={`grid transition-[grid-template-rows,opacity] duration-400 ease-out ${open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <div className="space-y-5 border-t border-white/10 pt-4 text-[13px] font-nunitoLight text-white/70">
                  {project.features?.length > 0 && (
                    <section>
                      <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/40">Key features</h3>
                      <ul className="space-y-2">
                        {project.features.map((feature, i) => (
                          <li key={i} className="flex gap-2.5">
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#ff6a1a]" aria-hidden="true" />
                            <span>
                              <span className="text-white/90">{feature.title}:</span> {feature.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {project.techStack?.length > 0 && (
                    <section>
                      <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/40">Tech stack</h3>
                      <dl className="space-y-1.5">
                        {project.techStack.map((tech, i) => (
                          <div key={i} className="sm:flex sm:gap-2">
                            <dt className="text-white/90 sm:min-w-[7.5rem]">{tech.category}</dt>
                            <dd>{tech.items}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
