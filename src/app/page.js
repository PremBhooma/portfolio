import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import ThemeMode from "@/components/theme-mode";
import HomePage from "./home/page";
import Particles from "@/components/ui/particles";

export default function Home() {
  return (
    <>
      <div className="relative flex flex-col min-h-screen overflow-hidden">
        <Particles className="absolute inset-0 -z-10" quantity={200} ease={100} refresh />
        <Navigation />
        <div className="flex-1 flex justify-center items-center">
          <HomePage />
        </div>
      </div>
    </>
  );
}
