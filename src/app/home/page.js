"use client";

import Link from "next/link";
import Particles from "../../components/ui/particles";
import { FadeText } from "../../components/ui/fade-text";
import Footer from "../../components/Footer";

export default function HomePage() {
  return (
    <>
      <Particles className="absolute inset-0" quantity={100} ease={80} refresh />

      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <h1 className="lg:text-8xl text-6xl font-bold tracking-tight font-sounthernAire mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#fff] to-[#1E2761] drop-shadow-lg">Prem Bhooma</h1>
        {/* <FadeText
          className="lg:text-8xl text-6xl font-bold tracking-tight font-sounthernAire mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#fff] to-[#1E2761] drop-shadow-lg"
          direction="up"
          framerProps={{
            show: { transition: { delay: 0.5 } },
          }}
          text="Prem Bhooma"
        /> */}

        <div className="space-y-6 text-sm lg:text-lg font-nunitoLight drop-shadow">
          <p>
            Your friendly neighborhood frontend developer, UX architect, and JavaScript engineer. I spend my days (and often nights) painting the Internet canvas with
            <span className=" font-semibold"> PROJECTS </span>
            and lines of code, turning zeroes and ones into immersive, interactive experiences.
          </p>

          <p>
            Your friendly neighborhood frontend developer, UX architect, and JavaScript engineer. I spend my days (and often nights) painting the Internet canvas with
            <span className=" font-semibold"> PROJECTS </span>
            and lines of code, turning zeroes and ones into immersive, interactive experiences.
          </p>

          <p>
            or swaying to the rhythm of Pop Music & Jazz, losing myself in the captivating flow of melodies. anyways you can
            <span className=" font-semibold"> CONTACT ME</span>
          </p>
        </div>

        <div className="mt-8">
          <Link href="#" className="inline-flex items-center  ">
            See More About Me
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        <Footer />
      </div>
    </>
  );
}
