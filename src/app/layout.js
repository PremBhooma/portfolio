import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const sounthernAire = localFont({
  src: "./fonts/SouthernAire_Personal_Use_Only.ttf",
  variable: "--font-sounthern-aire",
  weight: "100 900",
});

const remachine = localFont({
  src: "./fonts/RemachineScript.ttf",
  variable: "--font-remachine",
  weight: "100 900",
});

const nunitoBold = localFont({
  src: "./fonts/Nunito-Bold.ttf",
  variable: "--font-nunito-bold",
  weight: "100 900",
});

const nunitoRegular = localFont({
  src: "./fonts/Nunito-Regular.ttf",
  variable: "--font-nunito-regular",
  weight: "100 900",
});

const nunitoLight = localFont({
  src: "./fonts/Nunito-Light.ttf",
  variable: "--font-nunito-light",
  weight: "100 900",
});

export const metadata = {
  title: "AstroDev",
  description: "AstroDev Prem",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${sounthernAire.variable} ${remachine.variable} ${nunitoRegular.variable}  ${nunitoBold.variable} ${nunitoLight.variable} antialiased`}>
        {" "}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
