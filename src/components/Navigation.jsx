"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useWarp } from "@/components/transition/WarpProvider";

export default function Navigation() {
  const path = usePathname();
  const { warpTo, warping } = useWarp();

  const navigation = [
    { name: "Prem Bhooma", href: "/" },
    { name: "Projects", href: "/projects", warp: true },
    { name: "Contact", href: "/contact" },
  ];

  // Filter navigation items based on the current path
  const filteredNavigation = navigation.filter((link) => {
    return path !== link.href;
  });

  return (
    <header className="relative z-10">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-end py-6">
          <div className="ml-10 space-x-8">
            {filteredNavigation.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                prefetch={link.warp ? true : undefined}
                onClick={
                  link.warp && warpTo
                    ? (e) => {
                        // Let modified clicks (new tab, download) behave normally.
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                        e.preventDefault();
                        warpTo(link.href);
                      }
                    : undefined
                }
                aria-disabled={link.warp && warping ? true : undefined}
                className="text-sm font-nunitoLight font-medium hover:text-[#7dd3fc] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
