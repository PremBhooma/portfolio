"use client";

import Link from "next/link";
import Footer from "../../components/Footer";
import Navigation from "@/components/Navigation";
import Particles from "@/components/ui/particles";

export default function ContactPage() {
  return (
    <>
      <div className="relative flex flex-col min-h-screen overflow-hidden">
        <Particles className="absolute inset-0" quantity={200} ease={100} refresh />
        <Navigation />
        <div className="flex-1 flex justify-center items-center z-10">
          <div className="mx-auto max-w-4xl px-6 lg:px-4 py-10">
            {/* <h1 className="lg:text-8xl text-6xl font-bold tracking-tight font-sounthernAire mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#fff] to-[#1E2761] drop-shadow-lg">Prem Bhooma</h1> */}

            <div className="space-y-6 text-sm lg:text-[16px] font-nunitoLight drop-shadow">
              <p>I don’t just code—I architect mind-blowing digital universes! From crafting sleek UIs to building rock-solid backends, I dance through the wild jungle of JavaScript, React.js, Next.js, Node.js, and everything in between with a grin.</p>

              <ul className="list-none space-y-2">
                <li>🚀 Need a UI so perfect it’ll make your jaw drop? I’ve got the magic wand!</li>
                <li>🚀 Want a backend that scales like a superhero? I’ll make it soar!</li>
                <li>🚀 Got logic so twisted it’d stump Einstein? That’s where I shine, baby!</li>
                <li>🚀 Craving real-time wizardry, payment fireworks, or search sorcery? I’ll turn your wildest dreams into reality!</li>
                <li>🚀 Let’s build something so epic it’ll break the internet—in a good way!</li>
              </ul>

              <p>Let’s connect and create the future! Hit me up at:</p>
              <ul className="list-none space-y-1">
                <li>
                  📞 Phone:{" "}
                  <a href="tel:+9177881213" className="text-blue-400 hover:underline">
                    +91 917788 1213
                  </a>
                </li>
                <li>
                  📧 Email:{" "}
                  <a href="mailto:bhoomasagar1213@gmail.com" className="text-blue-400 hover:underline">
                    bhoomasagar1213@gmail.com
                  </a>
                </li>
              </ul>

              <p>
                Snag my resume and see the madness for yourself!{" "}
                <a href="/Prem_Resume.pdf" download className="text-green-400 hover:underline">
                  Download Resume
                </a>
              </p>

              <p>When I’m not coding up a storm, catch me grooving to Pop beats, jamming to Jazz riffs, or hunting the next tech treasure that’ll blow your mind!</p>
            </div>

            <div className="mt-5">
              <Link href="#contact" className="inline-flex items-center text-yellow-400 hover:text-yellow-300">
                Let’s ignite something legendary together! CONTACT ME ✨
              </Link>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
