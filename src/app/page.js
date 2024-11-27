import Footer from "@/components/Footer";
import HomePage from "@/components/Home";
import Navigation from "@/components/Navigation";
import ThemeMode from "@/components/theme-mode";

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
