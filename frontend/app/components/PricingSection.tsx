"use client";

import { motion } from "framer-motion";
import { Check, DollarSign } from "lucide-react";
import AnimatedButton from "./ui/AnimatedButton";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    subtitle: "For occasional use",
    features: [
      "Access to basic tools",
      "5 tasks per day",
      "Standard processing speed",
    ],
    cta: "Choose Free",
    href: "/free-tier",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    subtitle: "For power users",
    features: [
      "Unlimited tasks",
      "No file size limits",
      "Priority processing",
      "Ad-free experience",
    ],
    cta: "Choose Pro",
    href: "/pricing",
    popular: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/mo",
    subtitle: "For small teams",
    features: [
      "All Pro features",
      "User management",
      "Centralized billing",
      "Priority support",
    ],
    cta: "Choose Team",
    href: "/contact",
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mx-auto mb-6 text-yellow-600"
          >
            <DollarSign className="w-6 h-6" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Start for free, upgrade as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative flex flex-col p-10 rounded-[2rem] border transition-all duration-300 ${plan.popular
                  ? "bg-white border-emerald-800 shadow-sm"
                  : "bg-gray-50/30 border-gray-100"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#064E3B] text-white px-5 py-1 rounded-full text-xs font-bold tracking-tight">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-1 font-display">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900 font-display">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 font-medium">{plan.period}</span>}
                </div>
                <p className="text-gray-400 text-sm font-medium">{plan.subtitle}</p>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-600 text-sm">
                    <div className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center mr-4 flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <AnimatedButton
                href={plan.href}
                variant={plan.popular ? "primary" : "outline"}
                size="md"
                className={`w-full rounded-xl py-4 font-bold ${plan.popular
                    ? "bg-[#064E3B] hover:bg-[#043327] text-white"
                    : "bg-white text-gray-900 border-gray-200 hover:border-gray-900"
                  }`}
              >
                {plan.cta}
              </AnimatedButton>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
