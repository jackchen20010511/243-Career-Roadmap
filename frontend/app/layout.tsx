"use client";

import { useEffect } from "react";
import "aos/dist/aos.css";
import "./css/style.css";
import { usePathname } from "next/navigation";

import { Inter } from "next/font/google";
import localFont from "next/font/local";

// Load Google Font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Load Local Fonts
const nacelle = localFont({
  src: [
    { path: "../public/fonts/nacelle-regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/nacelle-italic.woff2", weight: "400", style: "italic" },
    { path: "../public/fonts/nacelle-semibold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/nacelle-semibolditalic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-nacelle",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const video = document.getElementById("bg-video") as HTMLVideoElement;
    if (video) {
      video.playbackRate = 0.7; // 👈 Set your custom speed here
    }
  }, []);

  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <html lang="en">
      <body className="relative">

        {/* 🎥 Background video */}
        <video
          id="bg-video"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* 🧼 Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/70 z-10"></div>

        {/* 📦 Main content */}
        <main className="relative z-20 flex grow flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
          {children}
        </main>

      </body>
    </html>
  );
}