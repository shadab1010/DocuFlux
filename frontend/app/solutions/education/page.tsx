"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SubPageHero from "../../components/ui/SubPageHero";
import { GraduationCap, BookOpen, Heart, Globe, ArrowRight, ShieldCheck } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion } from "framer-motion";

export default function EducationPage() {
    const benefits = [
        {
            icon: <BookOpen className="w-6 h-6" />,
            title: "Student Friendly",
            description: "Easy-to-use tools that help students manage assignments, research papers, and study guides effortlessly."
        },
        {
            icon: <ShieldCheck className="w-6 h-6" />,
            title: "Privacy Focused",
            description: "We take student data privacy seriously. Files are processed securely and deleted automatically."
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: "Free Access",
            description: "Generous free tier to ensure essential document tools are accessible to every learner."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-1">
                <SubPageHero
                    badge="Education Solutions"
                    title="Empower Your"
                    subtitle="Learning"
                    description="Dedicated tools for students, teachers, and researchers. Simplify your academic life with professional-grade document management."
                />

                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 text-center">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-700 premium-glow">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">{benefit.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="bg-emerald-50 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden">
                            <div className="max-w-3xl relative z-10">
                                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-md bg-white text-emerald-800 font-bold text-[10px] tracking-widest uppercase">
                                    For Academic Institutions
                                </div>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 font-display leading-[1.1]">
                                    Transform document management in <span className="text-emerald-800 italic font-serif">your school.</span>
                                </h2>
                                <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                                    We offer special licensing for schools and universities to provide DocuFlux Pro features to all students and faculty.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <AnimatedButton
                                        href="/contact"
                                        variant="primary"
                                        size="md"
                                    >
                                        Inquire for Institutions <ArrowRight className="w-4 h-4 ml-2" />
                                    </AnimatedButton>
                                    <AnimatedButton
                                        href="/pricing"
                                        variant="secondary"
                                        size="md"
                                    >
                                        Individual Student Pro
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
