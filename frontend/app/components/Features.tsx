"use client";

import { FileText, Zap, Shield, Cloud } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Multiple Formats",
    description: "Convert between PDF, Word, Excel, PowerPoint, and image formats",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Process your documents in seconds with our optimized servers",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your files are encrypted and automatically deleted after processing",
  },
  {
    icon: Cloud,
    title: "Cloud Based",
    description: "No installation required. Access your tools from anywhere",
  },
];

export default function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose DocuFlux?
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features designed for your document workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 border rounded-lg hover:shadow-lg transition"
            >
              <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
