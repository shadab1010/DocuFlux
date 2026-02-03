"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PricingSection from "../components/PricingSection";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
