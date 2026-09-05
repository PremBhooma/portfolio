import Navigation from "@/components/Navigation";
import HomePage from "./home/page";
import Particles from "@/components/ui/particles";
import SkillsOrbLazy from "@/components/three/SkillsOrbLazy";

export default function Home() {
  return (
    <>
      <div className="relative flex flex-col min-h-screen overflow-x-hidden">
        <Particles className="absolute inset-0 -z-10" quantity={200} ease={100} refresh />
        <Navigation />
        <div className="flex-1 flex justify-center items-center">
          <div className="mx-auto w-full max-w-6xl px-6 lg:px-4 py-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-6 lg:gap-10 items-center">
            <HomePage />
            <div className="order-first lg:order-none">
              <SkillsOrbLazy />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
