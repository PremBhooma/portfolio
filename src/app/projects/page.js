"use client";

import Link from "next/link";
import Particles from "../../components/ui/particles";
import { FadeText } from "../../components/ui/fade-text";
import Footer from "../../components/Footer";
import Navigation from "@/components/Navigation";

export default function ProjectsPage() {
  return (
    <>
      <div className="flex flex-col h-screen">
        <Navigation />
        <div className="flex-1 flex justify-center items-center">
          <Particles className="absolute inset-0" quantity={100} ease={80} refresh />

          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <h1 className="lg:text-8xl text-6xl font-bold tracking-tight font-sounthernAire mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#fff] to-[#1E2761] drop-shadow-lg">Projects</h1>

            <div className="space-y-6 text-sm lg:text-lg font-nunitoLight drop-shadow"></div>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
