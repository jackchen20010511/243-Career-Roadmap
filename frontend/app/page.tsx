"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Features from "@/components/landing/features";
import Header from "@/components/ui/header";

export default function Home() {
  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[100vh] flex items-center justify-center text-center text-white bg-black">
        {/* Header overlays video */}
        <div className="absolute top-0 left-0 w-full z-30">
          <Header />
        </div>

        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50 z-10"></div>

        {/* Hero Content */}
        <div
          className="z-20 px-4"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <h1 className="mb-5 mt-10 animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-7xl font-semibold text-transparent">
            Built for Personalized <br />
            <span className="block mt-4">Career Growth</span>
          </h1>
          <p className="text-lg text-indigo-100/80 max-w-md mx-auto">
            Your personalized roadmap to career success—powered by AI, driven by you.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <Features />
    </>
  );
}
