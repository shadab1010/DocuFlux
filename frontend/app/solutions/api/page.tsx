"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SubPageHero from "../../components/ui/SubPageHero";
import { Code, Terminal, Cpu, Database, ArrowRight, Shield } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion } from "framer-motion";

export default function DeveloperAPIPage() {
    const features = [
        {
            icon: <Terminal className="w-6 h-6" />,
            title: "RESTful API",
            description: "Simple, powerful endpoints for conversion, merging, and compression that integrate in minutes."
        },
        {
            icon: <Cpu className="w-6 h-6" />,
            title: "High Performance",
            description: "Low-latency processing powered by a horizontally scalable global cloud infrastructure."
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Secure & Private",
            description: "Files are processed in memory and never stored, with support for advanced authentication."
        }
    ];

    const codeExample = `// Example: Convert PDF to Word
const response = await fetch('https://api.docuflux.com/v1/convert', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: formData
});

const result = await response.json();`;

    return (
        <div className="min-h-screen flex flex-col bg-[#FFFCF5]">
            <Navbar />
            <main className="flex-1">
                <SubPageHero
                    badge="Developer Tools"
                    title="Build with our"
                    subtitle="Powerful API"
                    description="High-performance document processing for your application. Automate conversions, compression, and more with our developer-first API."
                />

                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-3xl font-bold text-gray-900 mb-6 font-display">Developer-First Documentation</h2>
                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    Our API is designed to be intuitive and powerful. With comprehensive guides, SDKs for popular languages, and a playground to test your requests.
                                </p>
                                <div className="space-y-4 mb-10">
                                    {["Simple Auth", "Detailed Error Codes", "Webhook Support"].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-emerald-800 font-medium">
                                            <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <ArrowRight className="w-3 h-3" />
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                <AnimatedButton
                                    href="/docs"
                                    variant="primary"
                                    size="md"
                                >
                                    View API Documentation <ArrowRight className="w-4 h-4 ml-2" />
                                </AnimatedButton>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="bg-emerald-950 rounded-3xl p-8 shadow-2xl relative"
                            >
                                <div className="flex gap-2 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <pre className="text-emerald-400 font-mono text-sm overflow-x-auto">
                                    <code>{codeExample}</code>
                                </pre>
                                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                                        <Database className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Latency</div>
                                        <div className="text-sm font-bold text-gray-900">~120ms avg</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="p-8 rounded-[2rem] bg-[#FFFCF5] border border-emerald-50 text-center"
                                >
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-800 shadow-sm">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
