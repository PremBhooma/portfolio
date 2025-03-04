"use client";

import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import Particles from "../../components/ui/particles";
import { twMerge } from "tailwind-merge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BorderBeam } from "@/components/magicui/border-beam";

export default function AboutPage() {
  return (
    // <>
    //   <div>
    //     <Navigation />
    //     <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative max-w-xl lg:max-w-4xl mx-auto min-h-screen">
    //       {/* Hello Div - Hidden on mobile, fixed on larger screens */}
    //       <div className="hidden lg:block h-32 lg:sticky lg:top-16 col-span-1 space-y-6">
    //         <Card className="relative overflow-hidden">
    //           <CardHeader className="pb-6">
    //             <CardTitle className="text-2xl font-bold mb-4">Projects</CardTitle>
    //             <CardDescription>
    //               <ul className="space-y-3 text-white">
    //                 <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">AI Tools Bazaar</li>
    //                 <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">TeckDollars</li>
    //                 <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Vegas Tattoo</li>
    //                 <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Patientifi</li>
    //                 <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Zeengo</li>
    //                 <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Apna Garamdharam</li>
    //               </ul>
    //             </CardDescription>
    //           </CardHeader>
    //           <CardContent>
    //             <div className="grid w-full items-center gap-4"></div>
    //           </CardContent>
    //           <BorderBeam duration={8} size={100} />
    //         </Card>

    //         <Card className="relative overflow-hidden">
    //           <CardHeader className="pb-6">
    //             <CardTitle className="text-2xl font-bold mb-4">Teck Stacks</CardTitle>
    //             <CardDescription>
    //               <ul className="space-y-3 text-white">
    //                 <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">AI Tools Bazaar</li>
    //                 <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">TeckDollars</li>
    //                 <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Vegas Tattoo</li>
    //                 <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Patientifi</li>
    //                 <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Apna Garamdharam</li>
    //                 <li className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Zeengo</li>
    //               </ul>
    //             </CardDescription>
    //           </CardHeader>
    //           <CardContent>
    //             <div className="grid w-full items-center gap-4"></div>
    //           </CardContent>
    //           <BorderBeam duration={8} size={100} />
    //         </Card>
    //       </div>

    //       {/* Scrollable Content Div */}
    //       <div className="antialiased col-span-1 lg:col-span-3">
    //         {dummyContent.map((item, index) => (
    //           <div key={index} className="mb-10 lg:pt-5">
    //             <h2 className="text-2xl mb-4">{item.title}</h2>

    //             {/* Corrected badge mapping */}
    //             <div className="flex flex-wrap gap-2 mb-4">
    //               {item.badge.map((ele, idx) => (
    //                 <span key={idx} className="border bg-black text-white rounded-full text-sm w-fit px-4 py-1">
    //                   {ele}
    //                 </span>
    //               ))}
    //             </div>

    //             <div className="text-sm prose prose-sm dark:prose-invert">
    //               {item?.image && <Image src={item?.image} alt="blog thumbnail" height={1000} width={1000} className="rounded-lg mb-10 object-cover" />}
    //               {item.description}
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   </div>
    //   <Particles className="absolute inset-0" quantity={200} ease={100} refresh />
    // </>

    <>
      <div className="h-screen overflow-hidden relative">
        <Navigation />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative max-w-xl lg:max-w-4xl mx-auto h-[calc(100vh-4rem)]">
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
                      <Link href="https://vegas-tau.vercel.app/" target="_blank">
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
                      <Link href="https://staffing-livid.vercel.app/" target="_blank">
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
        <ul className="list-disc list-inside mb-4">
          <li>Extensive AI Resource Hub: Aggregates thousands of AI tools, tutorials, gadgets, events, and jobs, updated daily.</li>
          <li>User-Friendly Interface: Designed with modern UI libraries for a clean and intuitive experience.</li>
          <li>Secure Authentication: Implements robust user authentication for data security.</li>
          <li>Integrated Payment System: Handles transactions securely for subscriptions and ad placements.</li>
          <li>In-Built Ad Manager: Enables efficient advertisement management for monetization.</li>
          <li>Coupon & Referral System: Boosts engagement with incentives for users.</li>
          <li>Scalable Architecture: Built to handle growing traffic and data demands.</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Tech Stack</h3>
        <ul className="list-disc list-inside mb-4">
          <li>Frontend: JavaScript, React.js, Next.js, Tailwind CSS, Shadcn UI, Aceternity UI, Magic UI, Radix</li>
          <li>State Management: Redux Toolkit, TanStack Query</li>
          <li>Backend: Node.js, Express.js</li>
          <li>Database: MongoDB</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">My Contributions & Achievements</h3>
        <ul className="list-disc list-inside mb-4">
          <li>Developed a responsive frontend using Next.js and Tailwind CSS, enhanced with modern UI libraries.</li>
          <li>Built a scalable RESTful API with Node.js, Express.js, and MongoDB for efficient data management.</li>
          <li>Implemented secure authentication, payment integration, and advanced features like the ad manager.</li>
          <li>Optimized state management with Redux Toolkit and TanStack Query for real-time updates.</li>
          <li>Ensured performance and SEO optimization using Next.js for faster load times and better discoverability.</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Impact</h3>
        <ul className="list-disc list-inside mb-4">
          <li>Created a one-stop destination for AI enthusiasts, streamlining access to tools and opportunities.</li>
          <li>Enhanced user engagement through gamified features like coupons and referrals.</li>
          <li>Demonstrated full-stack expertise, from pixel-perfect UIs to robust backend systems.</li>
        </ul>
      </>
    ),
    badge: ["Javascript", "React.js", "Next.js", "Shadcn UI", "Aceternity UI", "Magic UI", "Radix", "Tailwind CSS", "TanStack Query", "Redux Toolkit", "Node.js", "Express.js", "MongoDB"],
    image: "/images/aitoolsbazaaar.png",
    link: "https://www.aitoolsbazaar.com/",
  },
  {
    title: "AI Tools Bazaar",
    description: (
      <>
        <p>Sit duis est minim proident non nisi velit non consectetur. Esse adipisicing laboris consectetur enim ipsum reprehenderit eu deserunt Lorem ut aliqua anim do. Duis cupidatat qui irure cupidatat incididunt incididunt enim magna id est qui sunt fugiat. Laboris do duis pariatur fugiat Lorem aute sit ullamco. Qui deserunt non reprehenderit dolore nisi velit exercitation Lorem qui do enim culpa. Aliqua eiusmod in occaecat reprehenderit laborum nostrud fugiat voluptate do Lorem culpa officia sint labore. Tempor consectetur excepteur ut fugiat veniam commodo et labore dolore commodo pariatur.</p>
        <p>Dolor minim irure ut Lorem proident. Ipsum do pariatur est ad ad veniam in commodo id reprehenderit adipisicing. Proident duis exercitation ad quis ex cupidatat cupidatat occaecat adipisicing.</p>
        <p>Tempor quis dolor veniam quis dolor. Sit reprehenderit eiusmod reprehenderit deserunt amet laborum consequat adipisicing officia qui irure id sint adipisicing. Adipisicing fugiat aliqua nulla nostrud. Amet culpa officia aliquip deserunt veniam deserunt officia adipisicing aliquip proident officia sunt.</p>
      </>
    ),
    badge: ["Javascript", "React.js", "Next.js", "Shadcn UI", "Aceternity UI", "Magic UI", "Radix", "Tailwind CSS", "Tenstack", "Redux Toolkit", "Node.js", "Express.js", "MongoDB"],
    image: "/images/aitoolsbazaaar.png",
    link: "https://www.aitoolsbazaar.com/",
  },
  {
    title: "AI Tools Bazaar",
    description: (
      <>
        <p>Sit duis est minim proident non nisi velit non consectetur. Esse adipisicing laboris consectetur enim ipsum reprehenderit eu deserunt Lorem ut aliqua anim do. Duis cupidatat qui irure cupidatat incididunt incididunt enim magna id est qui sunt fugiat. Laboris do duis pariatur fugiat Lorem aute sit ullamco. Qui deserunt non reprehenderit dolore nisi velit exercitation Lorem qui do enim culpa. Aliqua eiusmod in occaecat reprehenderit laborum nostrud fugiat voluptate do Lorem culpa officia sint labore. Tempor consectetur excepteur ut fugiat veniam commodo et labore dolore commodo pariatur.</p>
        <p>Dolor minim irure ut Lorem proident. Ipsum do pariatur est ad ad veniam in commodo id reprehenderit adipisicing. Proident duis exercitation ad quis ex cupidatat cupidatat occaecat adipisicing.</p>
        <p>Tempor quis dolor veniam quis dolor. Sit reprehenderit eiusmod reprehenderit deserunt amet laborum consequat adipisicing officia qui irure id sint adipisicing. Adipisicing fugiat aliqua nulla nostrud. Amet culpa officia aliquip deserunt veniam deserunt officia adipisicing aliquip proident officia sunt.</p>
      </>
    ),
    badge: ["Javascript", "React.js", "Next.js", "Shadcn UI", "Aceternity UI", "Magic UI", "Radix", "Tailwind CSS", "Tenstack", "Redux Toolkit", "Node.js", "Express.js", "MongoDB"],
    image: "/images/aitoolsbazaaar.png",
  },
];
