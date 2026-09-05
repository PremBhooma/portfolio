"use client";

import dynamic from "next/dynamic";

// WebGL only runs in the browser, and the three.js bundle is heavy — keep it out of SSR.
const SkillsOrb = dynamic(() => import("./SkillsOrb"), {
  ssr: false,
  loading: () => (
    <div className="h-[260px] w-full sm:h-[340px] lg:h-[460px] flex items-center justify-center">
      <div className="h-24 w-24 rounded-full border border-white/10 border-t-white/40 animate-spin" />
    </div>
  ),
});

export default function SkillsOrbLazy() {
  return <SkillsOrb />;
}
