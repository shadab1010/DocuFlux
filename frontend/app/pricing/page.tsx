"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PricingSection from "../components/PricingSection";
import SubPageHero from "../components/ui/SubPageHero";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <SubPageHero
          badge="Pricing Plans"
          title="Plans that scale with"
          subtitle="Your Needs"
          description="Transparent pricing for everyone. From individual students to large enterprises, find the perfect fit for your document workflow."
        />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
