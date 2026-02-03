"use client";

import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 conversions per day",
      "Basic PDF tools",
      "Standard quality",
      "Email support",
    ],
    cta: "Get Started",
    href: "/free-tier",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    features: [
      "Unlimited conversions",
      "All PDF tools",
      "High quality output",
      "Priority support",
      "No watermarks",
      "API access",
    ],
    cta: "Start Free Trial",
    href: "/pricing",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Volume discounts",
      "Training included",
    ],
    cta: "Contact Sales",
    href: "/pricing",
  },
];

export default function PricingSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that's right for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg p-8 ${
                plan.popular ? "ring-2 ring-blue-600 shadow-xl" : "shadow-lg"
              }`}
            >
              {plan.popular && (
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold mt-4">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-600 ml-2">/ {plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block w-full text-center px-6 py-3 rounded-lg font-semibold ${
                  plan.popular
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
