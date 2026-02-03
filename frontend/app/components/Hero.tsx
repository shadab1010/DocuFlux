"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, FileText, Image as ImageIcon, Star } from "lucide-react";
import AnimatedButton from "./ui/AnimatedButton";

export default function Hero() {
  return (
    <section id="hero" className="pt-32 pb-20 relative overflow-hidden bg-[#FFFCF5]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-50/30 to-transparent -z-10" />

      {/* Star decoration from screenshot */}
      <div className="absolute top-20 right-[10%] text-emerald-600/20 animate-float">
        <Star className="w-8 h-8 fill-current" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Column: Text */}
          <div className="flex-1 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 font-medium text-xs tracking-wider uppercase"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 premium-glow" />
              Professional PDF Tools
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-emerald-950 mb-8 leading-[1.1] font-display"
            >
              Exceptional <span className="text-emerald-800 italic font-serif">Detail</span>,<br />
              Guaranteed <br />
              <span className="relative inline-block">
                Accuracy.
                <span className="absolute bottom-2 left-0 w-full h-3 bg-emerald-200/50 -z-10 rounded-sm animate-pulse"></span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl leading-relaxed"
            >
              Experience the difference with our seamless PDF tools. Convert, edit, and manage your documents with professional-grade precision and speed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-4"
            >
              <AnimatedButton
                href="/tools/pdf-to-word"
                variant="primary"
                size="md"
                className="shadow-lg shadow-emerald-500/20"
              >
                Start Converting <ArrowRight className="w-4 h-4 ml-2" />
              </AnimatedButton>
              <AnimatedButton
                href="/how-it-works"
                variant="secondary"
                size="md"
              >
                How It Works
              </AnimatedButton>
            </motion.div>
          </div>

          {/* Right Column: Floating Card Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 relative w-full max-w-lg"
          >
            <div className="relative aspect-square md:aspect-[4/3] bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-8 flex flex-col items-center justify-center z-10 animate-float">
              <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-700 premium-glow">
                <FileText className="w-10 h-10" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2 font-display">50,000+</div>
              <div className="text-gray-500 font-medium tracking-wide text-sm uppercase">Documents Processed</div>

              {/* User Avatars Row */}
              <div className="flex -space-x-3 mt-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative transition-transform hover:scale-110 hover:z-20 cursor-pointer">
                    <div className={`w-full h-full bg-gradient-to-br ${['from-yellow-200', 'from-blue-200', 'from-red-200', 'from-green-200'][i - 1]} to-gray-50`} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-50">
                      <span className="text-[10px]">user</span>
                    </div>
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-emerald-900 flex items-center justify-center text-white text-xs font-bold premium-glow">+</div>
              </div>

              {/* Floating Badge 1 - Excel */}
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-gray-50 flex items-center gap-3 animate-float-delayed">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Converted</div>
                  <div className="text-sm font-bold text-gray-900">Excel Report.xlsx</div>
                </div>
              </div>

              {/* Floating Badge 2 - JPG */}
              <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-xl shadow-xl border border-gray-50 flex items-center gap-3 animate-float">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Compressed</div>
                  <div className="text-sm font-bold text-gray-900">Portfolio.jpg</div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-emerald-50/50 rounded-full blur-3xl -z-10 animate-pulse" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
