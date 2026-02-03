"use client";

import Link from "next/link";

const solutions = [
  {
    title: "For Businesses",
    description: "Streamline document workflows with bulk processing and API access",
    features: ["Bulk conversion", "API integration", "Priority support"],
  },
  {
    title: "For Students",
    description: "Free tools to help with assignments and research papers",
    features: ["Free tier", "No watermarks", "Fast processing"],
  },
  {
    title: "For Professionals",
    description: "Professional-grade tools for document management",
    features: ["Advanced features", "High quality", "Secure processing"],
  },
];

export default function Solutions() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Solutions for Everyone
          </h2>
          <p className="text-xl text-gray-600">
            Tailored tools for your specific needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition"
            >
              <h3 className="text-2xl font-bold mb-4">{solution.title}</h3>
              <p className="text-gray-600 mb-6">{solution.description}</p>
              <ul className="space-y-2 mb-6">
                {solution.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-700">
                    <span className="text-blue-600 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/solutions"
                className="text-blue-600 font-semibold hover:underline"
              >
                Learn More →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
