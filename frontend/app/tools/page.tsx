"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Services from "../components/Services";
import SubPageHero from "../components/ui/SubPageHero";

export default function ToolsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-1">
                <SubPageHero
                    badge="Productivity Tools"
                    title="All-in-One"
                    subtitle="PDF Solution"
                    description="Access our complete suite of document tools. From conversion to security, everything you need to manage your PDF workflow in one place."
                />
                <Services />
            </main>
            <Footer />
        </div>
    );
}
