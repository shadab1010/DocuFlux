"use client";

import { Shield, Zap, Layers, Globe, Layout, Clock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "We use 256-bit SSL encryption to ensure that your files are 100% safe.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Convert, merge, and edit PDFs in seconds with our optimized processing engine.",
  },
  {
    icon: Layers,
    title: "High Capacity",
    description: "Process files up to 100MB and batch convert multiple documents at once.",
  },
  {
    icon: Globe,
    title: "Work from Anywhere",
    description: "Access DocuFlux from any device, anywhere in the world. No installation needed.",
  },
  {
    icon: Layout,
    title: "User-Friendly Interface",
    description: "Clean, intuitive design that makes complex PDF tasks simple for everyone.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Our cloud servers are always running, so you can work whenever inspiration strikes.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-[#FFFCF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-950 mb-4 font-display font-serif">
            Why Choose DocuFlux
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We don't just process PDFs; we provide a complete document management solution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-8 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-100 hover:border-emerald-100 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
