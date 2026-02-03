"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SubPageHero from "../../components/ui/SubPageHero";
import { Briefcase, Zap, Shield, Users, ArrowRight } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion } from "framer-motion";

export default function BusinessPage() {
    const benefits = [
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Bulk Processing",
            description: "Convert thousands of documents simultaneously with our high-performance cloud infrastructure."
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Enterprise Security",
            description: "Bank-grade encryption and automatic file deletion ensure your corporate data stays private."
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Team Management",
            description: "Manage licenses, track usage, and collaborate across departments with centralized billing."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-1">
                <SubPageHero
                    badge="Business Solutions"
                    title="Empower Your"
                    subtitle="Enterprise"
                    description="Scale your document workflows with high-performance tools designed for modern business needs. Secure, fast, and remarkably easy."
                />

                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-700 premium-glow">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">{benefit.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="bg-emerald-950 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-900/20 -skew-x-12 translate-x-1/4" />
                            <div className="relative z-10 max-w-3xl">
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 font-display">
                                    Ready to transform your <span className="text-emerald-400 italic font-serif">workflow?</span>
                                </h2>
                                <p className="text-emerald-100/80 text-lg mb-10 leading-relaxed">
                                    Join hundreds of forward-thinking companies that rely on DocuFlux for their daily document management needs. Get started with a custom demo today.
                                </p>
                                <div className="flex flex-wrap gap-6">
                                    <AnimatedButton
                                        href="/contact"
                                        variant="primary"
                                        size="md"
                                        className="bg-white text-emerald-950 hover:bg-emerald-50 shadow-none"
                                    >
                                        Contact Sales <ArrowRight className="w-4 h-4 ml-2" />
                                    </AnimatedButton>
                                    <AnimatedButton
                                        href="/pricing"
                                        variant="outline"
                                        size="md"
                                        className="border-emerald-700 text-white hover:bg-emerald-900"
                                    >
                                        View Pro Plans
                                    </AnimatedButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
