"use client";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Services from "./components/Services";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ScrollAnimation from "./components/ui/ScrollAnimation";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ScrollAnimation direction="up" delay={0.1}>
        <HowItWorks />
      </ScrollAnimation>
      <ScrollAnimation direction="left" delay={0.2}>
        <Features />
      </ScrollAnimation>
      <ScrollAnimation direction="right" delay={0.2}>
        <Services />
      </ScrollAnimation>
      <ScrollAnimation direction="zoom" delay={0.3}>
        <About />
      </ScrollAnimation>
      <ScrollAnimation direction="up" delay={0.4}>
        <Contact />
      </ScrollAnimation>
      <Footer />
    </main>
  );
}
