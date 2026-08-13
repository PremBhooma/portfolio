"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import Particles from "../../components/ui/particles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { getProjects, getImageUrl } from "@/lib/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <>
      <div className="h-screen overflow-hidden relative">
        <Navigation />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative max-w-xl lg:max-w-4xl mx-auto px-6 lg:px-0 h-[calc(100vh-4rem)] z-10">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:block col-span-1 space-y-6 overflow-y-auto lg:sticky lg:top-16">
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold mb-4">Projects</CardTitle>
                <CardDescription>
                  <ul className="space-y-3 text-white">
                    {projects.map((project) => (
                      <li
                        key={project._id}
                        className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {project.link ? (
                          <Link href={project.link} target="_blank">
                            {project.title.split(" - ")[0]}
                          </Link>
                        ) : (
                          <span>{project.title.split(" - ")[0]}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-4"></div>
              </CardContent>
              <BorderBeam duration={8} size={100} />
            </Card>
          </div>

          {/* Scrollable Content */}
          <div className="antialiased col-span-1 lg:col-span-3 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent custom-scrollbar">
            {loading ? (
              <div className="space-y-8 pt-5">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 w-2/3 bg-white/5 rounded mb-4" />
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-6 w-20 bg-white/5 rounded-full" />
                      ))}
                    </div>
                    <div className="h-48 w-full bg-white/5 rounded-lg mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-white/5 rounded" />
                      <div className="h-4 w-5/6 bg-white/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Projects coming soon...</p>
              </div>
            ) : (
              projects.map((project) => (
                <div key={project._id} className="mb-10 lg:pt-5">
                  <h2 className="text-2xl mb-4">
                    {project.link ? (
                      <Link href={project.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {project.title}
                      </Link>
                    ) : (
                      project.title
                    )}
                  </h2>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.badges.map((badge, idx) => (
                      <span key={idx} className="border bg-black text-white rounded-full text-sm w-fit px-4 py-1">
                        {badge}
                      </span>
                    ))}
                  </div>

                  <div className="text-sm prose prose-sm dark:prose-invert">
                    {/* Project Image */}
                    {project.image && (
                      <img
                        src={getImageUrl(project.image)}
                        alt={project.title}
                        className="rounded-lg mb-10 object-cover w-full"
                      />
                    )}

                    {/* Description */}
                    <p className="mb-4">{project.description}</p>

                    {/* Features */}
                    {project.features?.length > 0 && (
                      <>
                        <h3 className="text-lg font-semibold mb-2">Key Features & Highlights</h3>
                        <ul className="list-disc pl-5 space-y-2">
                          {project.features.map((feature, idx) => (
                            <li key={idx}>
                              <p>
                                <span className="font-medium">{feature.title}:</span> {feature.description}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Tech Stack */}
                    {project.techStack?.length > 0 && (
                      <>
                        <h3 className="text-lg font-semibold mb-2 mt-4">Tech Stack</h3>
                        <ul className="list-disc pl-5 space-y-2">
                          {project.techStack.map((tech, idx) => (
                            <li key={idx}>
                              <p>
                                <span className="font-medium">{tech.category}:</span> {tech.items}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <Particles className="absolute inset-0" quantity={200} ease={100} refresh />
      </div>
    </>
  );
}
