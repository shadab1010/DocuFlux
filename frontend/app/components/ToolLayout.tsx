"use client";

import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollAnimation from "./ui/ScrollAnimation";
import { LucideIcon, Star, FileText, Shield, Zap, Sparkles, Binary, Lock, RefreshCw, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface ToolLayoutProps {
    children: ReactNode;
    title: string;
    description: string;
    icon: LucideIcon;
}

export default function ToolLayout({
    children,
    title,
    description,
    icon: Icon,
}: ToolLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-[#FFFCF5] selection:bg-emerald-100 selection:text-emerald-900">
            <Navbar />
            <main className="flex-1 pt-28 pb-16 relative overflow-hidden">
                {/* Visual Anchors & Decorative Background */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-emerald-200/20 rounded-full blur-[160px] opacity-40 pointer-events-none animate-pulse" />
                <div className="absolute middle-0 left-0 -translate-x-1/4 w-[700px] h-[700px] bg-teal-200/20 rounded-full blur-[140px] opacity-30 pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-[600px] h-[600px] bg-lime-100/30 rounded-full blur-[120px] opacity-40 pointer-events-none" />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />

                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <ScrollAnimation direction="up">
                            <div className="text-center mb-10">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="relative inline-flex items-center justify-center p-4 bg-white rounded-[2rem] mb-6 shadow-2xl shadow-emerald-950/10 border border-emerald-50/50 group hover:scale-105 transition-transform duration-500"
                                >
                                    <div className="absolute inset-0 bg-emerald-500/5 rounded-[2rem] scale-90 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Icon className="w-10 h-10 text-emerald-800 relative z-10" strokeWidth={1.5} />

                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute -top-2 -right-2 text-emerald-400 opacity-20"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                    </motion.div>
                                </motion.div>

                                <h1 className="text-4xl md:text-5xl font-bold text-slate-950 mb-6 font-display tracking-tight leading-[1.05]">
                                    {title.split(' ').map((word, i) => (
                                        <span key={i} className={i === 1 ? "text-emerald-700 italic font-serif px-2" : "inline-block"}>
                                            {word}{' '}
                                        </span>
                                    ))}
                                </h1>
                                <p className="text-base md:text-lg text-slate-600 font-sans max-w-2xl mx-auto leading-relaxed font-medium opacity-70">
                                    {description}
                                </p>
                            </div>
                        </ScrollAnimation>

                        <div className="relative group/container">
                            {/* Floating Contextual Badges */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="absolute -top-8 -left-20 bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-emerald-100/50 hidden xl:flex items-center gap-3 z-30"
                            >
                                <div className="w-8 h-8 rounded-full bg-emerald-900 text-white flex items-center justify-center shadow-lg">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-emerald-900/40 uppercase tracking-widest">Enterprise</div>
                                    <div className="text-xs font-extrabold text-slate-900">Encrypted</div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="absolute top-20 -right-20 bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-emerald-100/50 hidden xl:flex items-center gap-3 z-30"
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg">
                                    <Binary className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-slate-900/40 uppercase tracking-widest">Precision</div>
                                    <div className="text-xs font-extrabold text-slate-900">No Data Loss</div>
                                </div>
                            </motion.div>

                            <ScrollAnimation direction="up" delay={0.3}>
                                <div className="relative group">
                                    {/* Glassmorphic Shell */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-b from-emerald-100/50 to-emerald-50/10 rounded-[3rem] blur opacity-30 group-hover:opacity-100 transition duration-1000" />

                                    <div className="relative bg-white/40 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_40px_120px_-20px_rgba(6,78,59,0.15)] border border-white/80 p-6 md:p-10 overflow-hidden">
                                        {/* Corner Accents */}
                                        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-emerald-100/40 rounded-tl-[2.5rem] pointer-events-none" />
                                        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-emerald-100/40 rounded-br-[2.5rem] pointer-events-none" />

                                        <div className="relative z-10">
                                            {children}
                                        </div>
                                    </div>
                                </div>
                            </ScrollAnimation>
                        </div>
                    </div>
                </div>

                {/* Footer Badges */}
                <div className="max-w-4xl mx-auto px-6 mt-16 flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <div className="flex items-center gap-2 font-display font-bold text-xs uppercase tracking-[0.2em]">
                        <Layers className="w-4 h-4" /> Multi-Layer Tech
                    </div>
                    <div className="flex items-center gap-2 font-display font-bold text-xs uppercase tracking-[0.2em]">
                        <RefreshCw className="w-4 h-4" /> Auto-Scaling
                    </div>
                    <div className="flex items-center gap-2 font-display font-bold text-xs uppercase tracking-[0.2em]">
                        <Lock className="w-4 h-4" /> PII Shielded
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
