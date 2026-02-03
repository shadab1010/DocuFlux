"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Solutions from "../components/Solutions";

export default function SolutionsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">
        <Solutions />
      </main>
      <Footer />
    </div>
  );
}
