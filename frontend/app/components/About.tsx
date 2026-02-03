"use client";

import { Zap, Shield, Globe } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-24 bg-[#F9FcF6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-display font-serif">
            About DocuFlux
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            We believe document management should be effortless. DocuFlux provides a comprehensive
            suite of tools to convert, edit, and secure your PDFs without the hassle of software installation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-gray-50 flex flex-col items-center">
            <div className="w-12 h-12 text-orange-400 mb-6">
              <Zap className="w-full h-full" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 font-display">Lightning Fast</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Process documents in seconds with our optimized cloud engines.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-gray-50 flex flex-col items-center">
            <div className="w-12 h-12 text-emerald-600 mb-6">
              <Shield className="w-full h-full" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 font-display">Secure & Safe</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Your files are encrypted and automatically deleted after processing.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-gray-50 flex flex-col items-center">
            <div className="w-12 h-12 text-blue-500 mb-6">
              <Globe className="w-full h-full" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 font-display">Accessible Anywhere</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Use DocuFlux on any device, anywhere in the world.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
