"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface SubPageHeroProps {
    title: string;
    subtitle: string;
    description: string;
    badge: string;
}

export default function SubPageHero({ title, subtitle, description, badge }: SubPageHeroProps) {
    return (
        <section className="pt-32 pb-16 relative overflow-hidden bg-[#FFFCF5]">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-50/30 to-transparent -z-10" />

            {/* Star decoration */}
            <div className="absolute top-20 right-[10%] text-emerald-600/20 animate-float">
                <Star className="w-8 h-8 fill-current" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 font-medium text-xs tracking-wider uppercase"
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 premium-glow" />
                    {badge}
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-emerald-950 mb-6 leading-tight font-display"
                >
                    {title} <span className="text-emerald-800 italic font-serif">{subtitle}</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    {description}
                </motion.p>
            </div>

            {/* Decorative pulse element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl -z-10 animate-pulse" />
        </section>
    );
}
