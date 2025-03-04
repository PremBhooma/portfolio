"use client";

import Link from "next/link";
import Footer from "../../components/Footer";

export default function HomePage() {
  return (
    <>
      <div className="mx-auto max-w-4xl px-6 lg:px-4 py-10">
        <h1 className="lg:text-8xl text-6xl font-bold tracking-tight font-sounthernAire mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#fff] to-[#1E2761] drop-shadow-lg">Prem Bhooma</h1>

        <div className="space-y-6 text-sm lg:text-[16px] font-nunitoLight drop-shadow">
          <p>I don't just write code — I craft digital experiences. From breathing life into interactive UIs to architecting powerful backends, I thrive in the chaos of JavaScript, React.js, Next.js, Node.js, and everything in between.</p>

          <ul className="list-none space-y-2">
            <li>⚡ Need a pixel-perfect UI? I got you.</li>
            <li>⚡ Scalable backend? Consider it done.</li>
            <li>⚡ Complex logic that makes your head spin? That's my playground.</li>
          </ul>
          <p>With a knack for turning ideas into high-performance web apps, I specialize in building seamless, scalable, and visually stunning solutions. Whether it's implementing real-time data, payment integrations, advanced search, or state management wizardry, I ensure every project is both functional and futuristic.</p>

          <p> When I'm not conquering the web, you'll probably find me lost in the rhythm of Pop Music & Jazz or obsessing over the next big tech trend. </p>
        </div>

        <div className="mt-5">
          <Link href="#" className="inline-flex items-center">
            Let's build something awesome together! CONTACT ME ✨
          </Link>
        </div>
        <Footer />
      </div>
    </>
  );
}
