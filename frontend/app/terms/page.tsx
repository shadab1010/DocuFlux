"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="bg-white rounded-lg shadow p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using DocuFlux, you accept and agree to be bound by the terms
                and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
              <p className="text-gray-700">
                Permission is granted to temporarily use DocuFlux for personal or commercial use.
                This license shall automatically terminate if you violate any of these restrictions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
              <p className="text-gray-700">
                You are responsible for maintaining the confidentiality of your account and password.
                You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Prohibited Activities</h2>
              <p className="text-gray-700">
                You may not use our service for any illegal or unauthorized purpose. You must not
                transmit any worms, viruses, or any code of a destructive nature.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Limitation of Liability</h2>
              <p className="text-gray-700">
                DocuFlux shall not be liable for any damages that may occur to you as a result
                of your use of our service, to the fullest extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Modifications</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. We will notify users
                of any material changes via email or through our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Contact Information</h2>
              <p className="text-gray-700">
                Questions about the Terms of Service should be sent to us at legal@docuflux.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
