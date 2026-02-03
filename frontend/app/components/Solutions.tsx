"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Code, ArrowRight, Check } from "lucide-react";
import AnimatedButton from "./ui/AnimatedButton";

const solutions = [
  {
    title: "Business",
    subtitle: "Enterprise workflows",
    icon: <Briefcase className="w-6 h-6" />,
    description: "Streamline document workflows with bulk processing, team management, and priority support.",
    features: ["Bulk conversion", "Dedicated dashboard", "Priority 24/7 support", "Custom branding"],
    href: "/solutions/business",
    color: "emerald"
  },
  {
    title: "Education",
    subtitle: "For Students & Teachers",
    icon: <GraduationCap className="w-6 h-6" />,
    description: "Empower academic success with easy-to-use tools for papers, research, and collaborative projects.",
    features: ["Free tier available", "Student privacy first", "Easy sharing", "No watermarks"],
    href: "/solutions/education",
    color: "emerald"
  },
  {
    title: "Developer API",
    subtitle: "Seamless integration",
    icon: <Code className="w-6 h-6" />,
    description: "Integrate professional PDF processing into your application with our robust and scalable API.",
    features: ["RESTful API", "99.9% Uptime SLA", "Secure processing", "Full documentation"],
    href: "/solutions/api",
    color: "emerald"
  },
];

export default function Solutions() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 opacity-50 -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-6 font-display">
              Solutions for <span className="text-emerald-800 italic font-serif">Every</span> Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Tailored tools and specialized features designed to empower individuals and organizations alike.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group p-8 rounded-[2rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 premium-glow">
                {solution.icon}
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-2 font-display">
                  {solution.subtitle}
                </h3>
                <h4 className="text-2xl font-bold text-gray-900 mb-4 font-display">
                  {solution.title}
                </h4>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {solution.description}
                </p>

                <ul className="space-y-3 mb-10">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700 text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center mr-3 flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                <AnimatedButton
                  href={solution.href}
                  variant="outline"
                  size="sm"
                  className="w-full text-emerald-800 border-emerald-100 hover:border-emerald-600"
                >
                  Learn More <ArrowRight className="w-4 h-4 ml-2" />
                </AnimatedButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
