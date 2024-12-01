import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import ThemeMode from "@/components/theme-mode";
import HomePage from "./home/page";

export default function Home() {
  return (
    <>
      <div className="flex flex-col h-screen">
        <Navigation />
        <div className="flex-1 flex justify-center items-center">
          <HomePage />
        </div>
      </div>
    </>
  );
}
