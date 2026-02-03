"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

export default function FreeTierPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Free Tier
            </h1>
            <p className="text-xl text-gray-600">
              Get started with DocuFlux for free! No credit card required.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">What's Included</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <span className="text-gray-700">5 file conversions per day</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <span className="text-gray-700">Access to all PDF tools</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <span className="text-gray-700">Standard quality conversions</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <span className="text-gray-700">Email support</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <span className="text-gray-700">Secure file processing</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
            <h3 className="text-xl font-bold mb-4">Need More?</h3>
            <p className="text-gray-700 mb-4">
              Upgrade to Pro for unlimited conversions, higher quality output, and priority support.
            </p>
            <Link
              href="/pricing"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 inline-block"
            >
              View Pro Plans
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
