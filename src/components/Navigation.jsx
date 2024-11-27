import Link from "next/link";
import React from "react";

export default function Navigation() {
  const navigation = [
    { name: "About", href: "#" },
    { name: "Projects", href: "#" },
    { name: "Contact", href: "#" },
  ];
  return (
    <header className="relative z-10">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-end py-6">
          <div className="ml-10 space-x-8">
            {navigation?.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm font-nunitoLight font-medium">
                {link.name}
              </Link>
            ))}
            {/* <ThemeMode /> */}
          </div>
        </div>
      </nav>
    </header>
  );
}
