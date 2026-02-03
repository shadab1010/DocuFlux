"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import About from "../components/About";
import SubPageHero from "../components/ui/SubPageHero";

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-1">
                <SubPageHero
                    badge="Our Mission"
                    title="Exceptional Service,"
                    subtitle="Exceptional Results"
                    description="At DocuFlux, we're dedicated to providing the most accurate and efficient document tools in the industry. Discover our journey and the values that drive us."
                />
                <About />
            </main>
            <Footer />
        </div>
    );
}
