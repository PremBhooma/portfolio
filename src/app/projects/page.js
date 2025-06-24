"use client";

import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import Particles from "../../components/ui/particles";
import { twMerge } from "tailwind-merge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BorderBeam } from "@/components/magicui/border-beam";

export default function ProjectsPage() {
  return (
    <>
      <div className="h-screen overflow-hidden relative">
        <Navigation />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative max-w-xl lg:max-w-4xl mx-auto px-6 lg:px-0 h-[calc(100vh-4rem)] z-10">
          {/* Hello Div - Hidden on mobile, sticky and scrollable on larger screens */}
          <div className="hidden lg:block col-span-1 space-y-6 overflow-y-auto lg:sticky lg:top-16">
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold mb-4">Projects</CardTitle>
                <CardDescription>
                  <ul className="space-y-3 text-white">
                    <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      {" "}
                      <Link href="https://www.aitoolsbazaar.com/" target="_blank">
                        AI Tools Bazaar
                      </Link>
                    </li>
                    <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      {" "}
                      <Link href="https://www.vegastattooofficial.com/" target="_blank">
                        Vegas Tattoo
                      </Link>
                    </li>
                    <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      {" "}
                      <Link href="https://www.patientifi.com/" target="_blank">
                        Patientifi
                      </Link>
                    </li>

                    <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      {" "}
                      <Link href="https://www.tekdollars.com/" target="_blank">
                        TeckDollars
                      </Link>
                    </li>
                    <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      {" "}
                      <Link href="https://zeengo.vercel.app/" target="_blank">
                        Zeengo
                      </Link>
                    </li>
                    <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      {" "}
                      <Link href="https://apnagaramdharam.vercel.app/" target="_blank">
                        Apna Garamdharam
                      </Link>
                    </li>
                  </ul>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-4"></div>
              </CardContent>
              <BorderBeam duration={8} size={100} />
            </Card>
          </div>

          {/* Scrollable Content Div */}
          <div className="antialiased col-span-1 lg:col-span-3 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent custom-scrollbar">
            {dummyContent.map((item, index) => (
              <div key={index} className="mb-10 lg:pt-5">
                <h2 className="text-2xl mb-4">
                  {item.link ? (
                    <Link href={item.link} target="_blank" rel="noopener noreferrer" className=" hover:underline">
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </h2>

                {/* Corrected badge mapping */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.badge.map((ele, idx) => (
                    <span key={idx} className="border bg-black text-white rounded-full text-sm w-fit px-4 py-1">
                      {ele}
                    </span>
                  ))}
                </div>

                <div className="text-sm prose prose-sm dark:prose-invert">
                  {item?.image && <Image src={item?.image} alt="blog thumbnail" height={1000} width={1000} className="rounded-lg mb-10 object-cover" />}
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Particles className="absolute inset-0" quantity={200} ease={100} refresh />
      </div>
    </>
  );
}

const dummyContent = [
  {
    title: "AI Tools Bazaar - #1 Source for All Things AI",
    description: (
      <>
        <p className="mb-4">A comprehensive, user-friendly platform designed to centralize resources for AI enthusiasts and professionals, featuring the largest database of thousands of AI tools, tutorials, gadgets, events, jobs, and more. Updated daily, this platform integrates secure authentication, payment systems, an in-built ad manager, plus coupon and referral systems to enhance user engagement and monetization. Built using a modern, scalable tech stack, it delivers a seamless experience with an intuitive UI and robust backend.</p>

        <h3 className="text-lg font-semibold mb-2">Key Features & Highlights</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <p>
              <span className="font-medium">Extensive AI Resource Hub:</span> Aggregates thousands of AI tools, tutorials, gadgets, events, and jobs, updated daily.
            </p>
          </li>
          <li>
            <p>
              <span className="font-medium">User-Friendly Interface:</span> Designed with modern UI libraries for a clean and intuitive experience.
            </p>
          </li>
          <li>
            <p>
              <span className="font-medium">Secure Authentication:</span> Implements robust user authentication for data security.
            </p>
          </li>
          <li>
            <p>
              <span className="font-medium">Integrated Payment System:</span> Handles transactions securely for subscriptions and ad placements.
            </p>
          </li>
          <li>
            <p>
              <span className="font-medium">In-Built Ad Manager:</span> Enables efficient advertisement management for monetization.
            </p>
          </li>
          <li>
            <p>
              <span className="font-medium">Coupon & Referral System:</span> Boosts engagement with incentives for users.
            </p>
          </li>
          <li>
            <p>
              <span className="font-medium">Scalable Architecture:</span> Built to handle growing traffic and data demands.
            </p>
          </li>
        </ul>


        <h3 className="text-lg font-semibold mb-2">Tech Stack</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <p>
              <span className="font-medium">Frontend:</span> JavaScript, React.js, Next.js, Tailwind CSS, Shadcn UI, Aceternity UI, Magic UI, Radix
            </p>
          </li>
          <li>
            <p>
              <span className="font-medium">State Management:</span> Redux Toolkit, TanStack Query
            </p>
          </li>
          <li>
            <p>
              <span className="font-medium">Backend:</span> Node.js, Express.js
            </p>
          </li>
          <li>
            <p>
              <span className="font-medium">Database:</span> MongoDB
            </p>
          </li>
        </ul>

      </>
    ),
    badge: ["Javascript", "React.js", "Next.js", "Shadcn UI", "Aceternity UI", "Magic UI", "Radix", "Tailwind CSS", "TanStack Query", "Redux Toolkit", "Node.js", "Express.js", "MongoDB"],
    image: "/images/aitoolsbazaaar.png",
    link: "https://www.aitoolsbazaar.com/",
  },
  {
    title: "Vegas Tattoo - Showcase of Artistry",
    description: (
      <>
        <p className="mb-4">A dynamic, user-friendly platform designed to showcase the exceptional tattoo designs and pricing from Vegas Tattoo Studio, providing detailed insights into the studio’s offerings, artists, and ambiance. This project features an intuitive interface, a comprehensive gallery of tattoo designs, transparent pricing details, and rich studio information to engage tattoo enthusiasts. Built with a modern, scalable tech stack, it delivers a seamless browsing experience with visually stunning animations and robust performance.</p>

        <h3 className="text-lg font-semibold mb-2">Key Features & Highlights</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <p>
              <span className="font-medium">Transparent Pricing:</span> Displays clear and detailed pricing information, empowering users to plan their tattoo experience with confidence.
            </p>
          </li>
          <li>
            <p>
              <span className="font-medium">User-Friendly Interface:</span> Leverages modern UI libraries for a clean, intuitive, and visually appealing design that enhances user navigation.
            </p>
          </li>
          <li>
            <p>
              <span className="font-medium">Studio Details:</span> Provides in-depth information about the Vegas Tattoo Studio, including artist profiles, ambiance, and booking options.
            </p>
          </li>
          <li>
            <p>
              <span className="font-medium">Responsive Design:</span> Ensures a seamless experience across devices, from desktops to mobile phones, with optimized performance.
            </p>
          </li>
          <li>
            <p>
              <span className="font-medium">Engaging Animations:</span> Integrates animated components to highlight featured designs and create an immersive browsing experience.
            </p>
          </li>
        </ul>


        <h3 className="text-lg font-semibold mb-2">Tech Stack</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <p>
              <span className="font-medium">Frontend:</span> JavaScript, React.js, Next.js, Tailwind CSS, Shadcn UI, Aceternity UI, Magic UI, Radix
            </p>
          </li>
        </ul>

      </>
    ),
    badge: ["Javascript", "React.js", "Next.js", "Shadcn UI", "Aceternity UI", "Magic UI", "Radix", "Tailwind CSS"],
    image: "/images/vegas.png",
    link: "https://www.vegastattooofficial.com/",
  },
  {
    title: "Updating Soon...",
    description: <></>,
    badge: [],
    image: "",
  },
];
