"use client";

import { Upload, Settings, Zap, Download, FileCheck } from "lucide-react";

const steps = [
    {
        icon: Upload,
        title: "Upload Your File",
        description: "Simply drag and drop your document or select it from your device. We support all major formats.",
    },
    {
        icon: Settings,
        title: "Select Your Tool",
        description: "Choose the specific PDF tool you need from our comprehensive suite of options.",
    },
    {
        icon: Zap,
        title: "Instant Processing",
        description: "Our optimized cloud engines process your request in seconds with maximum accuracy.",
    },
    {
        icon: Download,
        title: "Download Result",
        description: "Get your perfectly processed file immediately. Secure, fast, and high quality.",
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-[#FFFCF5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-emerald-950 mb-4 font-display font-serif">
                        How <span className="text-emerald-700 italic">DocuFlux</span> Works
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        We've simplified document management. No complicated software, just powerful tools right in your browser.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={index}
                                className="p-8 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-100 hover:border-emerald-100 hover:shadow-lg transition-all duration-300 group"
                            >
                                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
                                    <Icon className="w-8 h-8" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 font-display text-gray-900">
                                    {step.title}
                                </h3>
                                <p className="text-gray-500 leading-relaxed text-sm">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
