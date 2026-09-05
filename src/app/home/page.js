"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../../components/Footer";
import { getContent } from "@/lib/api";

export default function HomePage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getContent("hero");
        setContent(data.data);
      } catch (err) {
        // Fallback to static content if API is down
        setContent({
          name: "Prem Bhooma",
          bio: "I don't just write code — I craft digital experiences. From breathing life into interactive UIs to architecting powerful backends, I thrive in the chaos of JavaScript, React.js, Next.js, Node.js, and everything in between.",
          highlights: [
            "⚡ Need a pixel-perfect UI? I got you.",
            "⚡ Scalable backend? Consider it done.",
            "⚡ Complex logic that makes your head spin? That's my playground.",
          ],
          closingText: "With a knack for turning ideas into high-performance web apps, I specialize in building seamless, scalable, and visually stunning solutions. Whether it's implementing real-time data, payment integrations, advanced search, or state management wizardry, I ensure every project is both functional and futuristic.",
          funFact: "When I'm not conquering the web, you'll probably find me lost in the rhythm of Pop Music & Jazz or obsessing over the next big tech trend.",
          ctaText: "Let's build something awesome together! CONTACT ME ✨",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-2xl z-10">
        <div className="h-10 w-3/4 bg-white/5 rounded-lg animate-pulse mb-6" />
        <div className="space-y-3">
          <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
          <div className="h-3 w-5/6 bg-white/5 rounded animate-pulse" />
          <div className="h-3 w-4/6 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-2xl z-10">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-sounthernAire mb-5 bg-clip-text text-transparent bg-gradient-to-r from-[#fff] to-[#1E2761] drop-shadow-lg">
          {content?.name || "Prem Bhooma"}
        </h1>

        <div className="space-y-4 text-[13px] leading-relaxed lg:text-sm font-nunitoLight drop-shadow">
          <p>{content?.bio}</p>

          {content?.highlights?.length > 0 && (
            <ul className="list-none space-y-1.5">
              {content.highlights.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}

          {content?.closingText && <p>{content.closingText}</p>}
          {content?.funFact && <p>{content.funFact}</p>}
        </div>

        <div className="mt-5 text-[13px] lg:text-sm font-nunitoLight">
          <Link href="/contact" className="inline-flex items-center hover:text-[#7dd3fc] transition-colors">
            {content?.ctaText || "Let's build something awesome together! CONTACT ME ✨"}
          </Link>
        </div>
        <Footer />
      </div>
    </>
  );
}
