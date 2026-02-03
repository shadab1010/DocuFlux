"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Contact from "../components/Contact";
import SubPageHero from "../components/ui/SubPageHero";

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-1">
                <SubPageHero
                    badge="Get In Touch"
                    title="How can we"
                    subtitle="Help You?"
                    description="Our team is here to support you. Whether you have a question about our tools, pricing, or enterprise solutions, we're ready to assist."
                />
                <Contact />
            </main>
            <Footer />
        </div>
    );
}
