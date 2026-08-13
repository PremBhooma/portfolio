"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../../components/Footer";
import Navigation from "@/components/Navigation";
import Particles from "@/components/ui/particles";
import { getContent, getResume, getResumeDownloadUrl } from "@/lib/api";

export default function ContactPage() {
  const [content, setContent] = useState(null);
  const [hasResume, setHasResume] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, resumeRes] = await Promise.allSettled([
          getContent("contact"),
          getResume(),
        ]);

        if (contentRes.status === "fulfilled") {
          setContent(contentRes.value.data);
        } else {
          // Fallback
          setContent({
            intro: "I don't just code—I architect mind-blowing digital universes! From crafting sleek UIs to building rock-solid backends, I dance through the wild jungle of JavaScript, React.js, Next.js, Node.js, and everything in between with a grin.",
            highlights: [
              "🚀 Need a UI so perfect it'll make your jaw drop? I've got the magic wand!",
              "🚀 Want a backend that scales like a superhero? I'll make it soar!",
              "🚀 Got logic so twisted it'd stump Einstein? That's where I shine, baby!",
              "🚀 Craving real-time wizardry, payment fireworks, or search sorcery? I'll turn your wildest dreams into reality!",
              "🚀 Let's build something so epic it'll break the internet—in a good way!",
            ],
            connectText: "Let's connect and create the future! Hit me up at:",
            phone: "+91 917788 1213",
            email: "bhoomasagar1213@gmail.com",
            resumeText: "Snag my resume and see the madness for yourself!",
            closingText: "When I'm not coding up a storm, catch me grooving to Pop beats, jamming to Jazz riffs, or hunting the next tech treasure that'll blow your mind!",
            ctaText: "Let's ignite something legendary together! CONTACT ME ✨",
          });
        }

        setHasResume(resumeRes.status === "fulfilled");
      } catch (err) {
        console.error("Failed to fetch contact data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="relative flex flex-col min-h-screen overflow-hidden">
        <Particles className="absolute inset-0" quantity={200} ease={100} refresh />
        <Navigation />
        <div className="flex-1 flex justify-center items-center z-10">
          <div className="mx-auto max-w-4xl px-6 lg:px-4 py-10">
            <div className="space-y-4 animate-pulse">
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-5/6 bg-white/5 rounded" />
              <div className="h-4 w-4/6 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex flex-col min-h-screen overflow-hidden">
        <Particles className="absolute inset-0" quantity={200} ease={100} refresh />
        <Navigation />
        <div className="flex-1 flex justify-center items-center z-10">
          <div className="mx-auto max-w-4xl px-6 lg:px-4 py-10">
            <div className="space-y-6 text-sm lg:text-[16px] font-nunitoLight drop-shadow">
              <p>{content?.intro}</p>

              {content?.highlights?.length > 0 && (
                <ul className="list-none space-y-2">
                  {content.highlights.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}

              {content?.connectText && <p>{content.connectText}</p>}

              <ul className="list-none space-y-1">
                {content?.phone && (
                  <li>
                    📞 Phone:{" "}
                    <a href={`tel:${content.phone.replace(/\s/g, "")}`} className="text-blue-400 hover:underline">
                      {content.phone}
                    </a>
                  </li>
                )}
                {content?.email && (
                  <li>
                    📧 Email:{" "}
                    <a href={`mailto:${content.email}`} className="text-blue-400 hover:underline">
                      {content.email}
                    </a>
                  </li>
                )}
              </ul>

              {hasResume && content?.resumeText && (
                <p>
                  {content.resumeText}{" "}
                  <a href={getResumeDownloadUrl()} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                    Download Resume
                  </a>
                </p>
              )}

              {content?.closingText && <p>{content.closingText}</p>}
            </div>

            <div className="mt-5">
              <Link href="/contact" className="inline-flex items-center text-yellow-400 hover:text-yellow-300">
                {content?.ctaText || "Let's ignite something legendary together! CONTACT ME ✨"}
              </Link>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
