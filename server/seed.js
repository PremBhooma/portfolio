require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const Project = require("./models/Project");
const Content = require("./models/Content");
const SocialLink = require("./models/SocialLink");

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB for seeding...");

    // 1. Seed Admin
    const existingAdmin = await Admin.findOne();
    if (!existingAdmin) {
      const admin = new Admin({
        email: "admin@astrodev.com",
        password: "admin123",
      });
      await admin.save();
      console.log("✅ Admin seeded: admin@astrodev.com / admin123");
    } else {
      console.log("⏭️  Admin already exists, skipping...");
    }

    // 2. Seed Projects
    const existingProjects = await Project.countDocuments();
    if (existingProjects === 0) {
      const projects = [
        {
          title: "AI Tools Bazaar - #1 Source for All Things AI",
          description:
            "A comprehensive, user-friendly platform designed to centralize resources for AI enthusiasts and professionals, featuring the largest database of thousands of AI tools, tutorials, gadgets, events, jobs, and more. Updated daily, this platform integrates secure authentication, payment systems, an in-built ad manager, plus coupon and referral systems to enhance user engagement and monetization. Built using a modern, scalable tech stack, it delivers a seamless experience with an intuitive UI and robust backend.",
          badges: [
            "Javascript", "React.js", "Next.js", "Shadcn UI", "Aceternity UI",
            "Magic UI", "Radix", "Tailwind CSS", "TanStack Query", "Redux Toolkit",
            "Node.js", "Express.js", "MongoDB",
          ],
          link: "https://www.aitoolsbazaar.com/",
          features: [
            { title: "Extensive AI Resource Hub", description: "Aggregates thousands of AI tools, tutorials, gadgets, events, and jobs, updated daily." },
            { title: "User-Friendly Interface", description: "Designed with modern UI libraries for a clean and intuitive experience." },
            { title: "Secure Authentication", description: "Implements robust user authentication for data security." },
            { title: "Integrated Payment System", description: "Handles transactions securely for subscriptions and ad placements." },
            { title: "In-Built Ad Manager", description: "Enables efficient advertisement management for monetization." },
            { title: "Coupon & Referral System", description: "Boosts engagement with incentives for users." },
            { title: "Scalable Architecture", description: "Built to handle growing traffic and data demands." },
          ],
          techStack: [
            { category: "Frontend", items: "JavaScript, React.js, Next.js, Tailwind CSS, Shadcn UI, Aceternity UI, Magic UI, Radix" },
            { category: "State Management", items: "Redux Toolkit, TanStack Query" },
            { category: "Backend", items: "Node.js, Express.js" },
            { category: "Database", items: "MongoDB" },
          ],
          order: 0,
          isActive: true,
        },
        {
          title: "Vegas Tattoo - Showcase of Artistry",
          description:
            "A dynamic, user-friendly platform designed to showcase the exceptional tattoo designs and pricing from Vegas Tattoo Studio, providing detailed insights into the studio's offerings, artists, and ambiance. This project features an intuitive interface, a comprehensive gallery of tattoo designs, transparent pricing details, and rich studio information to engage tattoo enthusiasts. Built with a modern, scalable tech stack, it delivers a seamless browsing experience with visually stunning animations and robust performance.",
          badges: [
            "Javascript", "React.js", "Next.js", "Shadcn UI", "Aceternity UI",
            "Magic UI", "Radix", "Tailwind CSS",
          ],
          link: "https://www.vegastattooofficial.com/",
          features: [
            { title: "Transparent Pricing", description: "Displays clear and detailed pricing information, empowering users to plan their tattoo experience with confidence." },
            { title: "User-Friendly Interface", description: "Leverages modern UI libraries for a clean, intuitive, and visually appealing design that enhances user navigation." },
            { title: "Studio Details", description: "Provides in-depth information about the Vegas Tattoo Studio, including artist profiles, ambiance, and booking options." },
            { title: "Responsive Design", description: "Ensures a seamless experience across devices, from desktops to mobile phones, with optimized performance." },
            { title: "Engaging Animations", description: "Integrates animated components to highlight featured designs and create an immersive browsing experience." },
          ],
          techStack: [
            { category: "Frontend", items: "JavaScript, React.js, Next.js, Tailwind CSS, Shadcn UI, Aceternity UI, Magic UI, Radix" },
          ],
          order: 1,
          isActive: true,
        },
      ];

      await Project.insertMany(projects);
      console.log("✅ Projects seeded (2 projects)");
    } else {
      console.log("⏭️  Projects already exist, skipping...");
    }

    // 3. Seed Hero Content
    const existingHero = await Content.findOne({ section: "hero" });
    if (!existingHero) {
      await Content.create({
        section: "hero",
        data: {
          name: "Prem Bhooma",
          tagline: "Full-Stack Developer & Digital Craftsman",
          bio: "I don't just write code — I craft digital experiences. From breathing life into interactive UIs to architecting powerful backends, I thrive in the chaos of JavaScript, React.js, Next.js, Node.js, and everything in between.",
          highlights: [
            "⚡ Need a pixel-perfect UI? I got you.",
            "⚡ Scalable backend? Consider it done.",
            "⚡ Complex logic that makes your head spin? That's my playground.",
          ],
          closingText: "With a knack for turning ideas into high-performance web apps, I specialize in building seamless, scalable, and visually stunning solutions. Whether it's implementing real-time data, payment integrations, advanced search, or state management wizardry, I ensure every project is both functional and futuristic.",
          funFact: "When I'm not conquering the web, you'll probably find me lost in the rhythm of Pop Music & Jazz or obsessing over the next big tech trend.",
          ctaText: "Let's build something awesome together! CONTACT ME ✨",
        },
      });
      console.log("✅ Hero content seeded");
    } else {
      console.log("⏭️  Hero content already exists, skipping...");
    }

    // 4. Seed Contact Content
    const existingContact = await Content.findOne({ section: "contact" });
    if (!existingContact) {
      await Content.create({
        section: "contact",
        data: {
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
        },
      });
      console.log("✅ Contact content seeded");
    } else {
      console.log("⏭️  Contact content already exists, skipping...");
    }

    // 5. Seed Social Links
    const existingSocial = await SocialLink.countDocuments();
    if (existingSocial === 0) {
      const socialLinks = [
        {
          name: "LinkedIn",
          href: "https://www.linkedin.com/in/prem-bhooma-8bb225220/",
          svgPath: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
          order: 0,
        },
        {
          name: "GitHub",
          href: "https://github.com/PremBhooma",
          svgPath: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
          order: 1,
        },
        {
          name: "Instagram",
          href: "https://www.instagram.com/v3.0__boy/",
          svgPath: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
          order: 2,
        },
        {
          name: "Twitter",
          href: "#",
          svgPath: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z",
          order: 3,
        },
        {
          name: "Facebook",
          href: "#",
          svgPath: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
          order: 4,
        },
      ];

      await SocialLink.insertMany(socialLinks);
      console.log("✅ Social links seeded (5 links)");
    } else {
      console.log("⏭️  Social links already exist, skipping...");
    }

    console.log("\n🎉 Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
