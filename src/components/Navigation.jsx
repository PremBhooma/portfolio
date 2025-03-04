"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Navigation() {
  const path = usePathname();
  console.log("Path:", path);

  const navigation = [
    { name: "Prem Bhooma", href: "/" },
    // { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Contact", href: "/contact" },
  ];

  // Filter navigation items based on the current path
  const filteredNavigation = navigation.filter((link) => {
    // Only hide the link if the path exactly matches the href
    return path !== link.href;
  });

  return (
    <header className="relative z-10">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-end py-6">
          <div className="ml-10 space-x-8">
            {filteredNavigation.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm font-nunitoLight font-medium">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
